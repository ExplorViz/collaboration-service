import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { createClient } from 'redis';
import { Redis } from 'ioredis';
import { RoomService } from './room/room.service';
import { IdGenerationService } from './id-generation/id-generation.service';
import { RoomFactoryService } from './factory/room-factory/room-factory.service';
import { WebsocketGateway } from './websocket/websocket.gateway';
import { TicketService } from './ticket/ticket.service';
import { SessionService } from './session/session.service';
import { MessageFactoryService } from './factory/message-factory/message-factory.service';
import { ScheduleModule } from '@nestjs/schedule';
import { LockService } from './lock/lock.service';
import { PublisherService } from './publisher/publisher.service';
import { SubscriberService } from './subscriber/subscriber.service';
import { MongoInitService } from './persistence/mongo-init.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SpectateConfig,
  SpectateConfigSchema,
} from './persistence/spectateConfiguration/spectateConfig.schema';
import { SpectateConfigController } from './persistence/spectateConfiguration/spectateConfig.controller';
import { SpectateConfigsService } from './persistence/spectateConfiguration/spectateConfig.service';
import { SpectateConfigFallback } from './persistence/spectateConfiguration/spectateConfigFallback.service';

import { ChatService } from './chat/chat.service';
import { Logger } from '@nestjs/common';

// Shared Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || '',
  socketOptions: {
    connectTimeout: 5000,
    reconnectStrategy: (retries: number) => {
      if (retries > 10) {
        return new Error('Redis connection failed after 10 retries');
      }
      return Math.min(retries * 100, 3000);
    },
  },
};

// Shared promise to create and connect Redis clients in parallel (singleton pattern)
let redisClientsPromise: Promise<{ redisClient: any; pubsubClient: any }> | null = null;

function getRedisClients() {
  if (!redisClientsPromise) {
    redisClientsPromise = (async () => {
      const logger = new Logger('RedisConnection');
      const startTime = Date.now();

      try {
        // Create both clients
        const redisClient = createClient({
          socket: {
            host: redisConfig.host,
            port: redisConfig.port,
            ...redisConfig.socketOptions,
          },
          password: redisConfig.password,
        });

        const pubsubClient = createClient({
          socket: {
            host: redisConfig.host,
            port: redisConfig.port,
            ...redisConfig.socketOptions,
          },
          password: redisConfig.password,
        });

        // Connect both clients in parallel
        await Promise.all([redisClient.connect(), pubsubClient.connect()]);

        const duration = Date.now() - startTime;
        logger.log(`Redis clients connected successfully in ${duration}ms`);

        return { redisClient, pubsubClient };
      } catch (error) {
        const duration = Date.now() - startTime;
        logger.error(`Redis connection failed after ${duration}ms: ${error.message}`);
        redisClientsPromise = null; // Reset on error to allow retry
        throw error;
      }
    })();
  }
  return redisClientsPromise;
}

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [AppController],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: async () => {
        const { redisClient } = await getRedisClients();
        return redisClient;
      },
    },
    {
      provide: 'REDIS_PUBSUB_CLIENT',
      useFactory: async () => {
        const { pubsubClient } = await getRedisClients();
        return pubsubClient;
      },
    },
    {
      provide: 'IOREDIS_CLIENT',
      useFactory: () => {
        return new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
          password: process.env.REDIS_PASSWORD || '',
          connectTimeout: 5000,
          retryStrategy: (times) => {
            if (times > 10) {
              return null; // Stop retrying after 10 attempts
            }
            return Math.min(times * 100, 3000);
          },
          maxRetriesPerRequest: 3,
          lazyConnect: false, // Connect immediately
        });
      },
    },
    RoomFactoryService,
    RoomService,
    WebsocketGateway,
    IdGenerationService,
    TicketService,
    SessionService,
    MessageFactoryService,
    LockService,
    PublisherService,
    SubscriberService,
    ChatService,
  ],
  exports: [],
})
export class AppModule {
  static async register() {
    // Check MongoDB availability in parallel with module initialization
    // This prevents blocking startup if MongoDB is slow or unavailable
    const mongoCheckPromise = MongoInitService.isMongoAvailable().catch(() => false);
    const mongoAvailable = await mongoCheckPromise;

    const mongoImports = mongoAvailable
      ? [
          MongooseModule.forRoot(
            process.env.MONGO_URI || 'mongodb://127.0.0.1:27018/collab_db',
          ),
          MongooseModule.forFeature([
            { name: SpectateConfig.name, schema: SpectateConfigSchema },
          ]),
        ]
      : [];

    const mongoControllers = mongoAvailable ? [SpectateConfigController] : [];

    const mongoProviders = mongoAvailable
      ? [
          {
            provide: 'SpectateConfigInterface',
            useClass: SpectateConfigsService,
          },
        ]
      : [
          {
            provide: 'SpectateConfigInterface',
            useClass: SpectateConfigFallback,
          },
        ];

    const mongoExports = mongoAvailable ? ['SpectateConfigInterface'] : [];

    return {
      module: AppModule,
      imports: [...mongoImports],
      controllers: [...mongoControllers],
      providers: [...mongoProviders],
      exports: [...mongoExports],
    };
  }
}

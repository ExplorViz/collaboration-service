import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { RedisModule } from '@liaoliaots/nestjs-redis';
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

@Module({
  imports: [
    RedisModule.forRoot({
      config: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || '',
      },
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [
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
    const mongoAvailable = await MongoInitService.isMongoAvailable();

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

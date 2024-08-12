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
import { MongooseModule } from '@nestjs/mongoose';
import { SpectateConfigsModule } from './persistence/spectateConfiguration/spectateConfigs.module';

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
    MongooseModule.forRoot('mongodb://127.0.0.1:27018/collab_db'),
    SpectateConfigsModule,
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
  ],
  exports: [],
})
export class AppModule {}

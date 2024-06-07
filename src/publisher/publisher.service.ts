import { Injectable } from '@nestjs/common';
import {
  CreateRoomMessage,
  CREATE_ROOM_EVENT,
} from 'src/message/pubsub/create-room-message';
import { RoomForwardMessage } from 'src/message/pubsub/room-forward-message';
import { RoomStatusMessage } from 'src/message/pubsub/room-status-message';
import { Redis } from 'ioredis';
import { RedisService } from '@liaoliaots/nestjs-redis';
import { LockService } from 'src/lock/lock.service';
import { MessageFactoryService } from 'src/factory/message-factory/message-factory.service';
import { RoomService } from 'src/room/room.service';

@Injectable()
export class PublisherService {
  private readonly redis: Redis;

  constructor(
    private readonly redisService: RedisService,
    private readonly lockService: LockService,
    private readonly roomService: RoomService,
    private readonly messageFactoryService: MessageFactoryService,
  ) {
    this.redis = this.redisService.getClient().duplicate();
  }

  /**
   * Publishes the creation of a room to Redis.
   *
   * @param message The attributes of the created room.
   */
  publishCreateRoomEvent(message: CreateRoomMessage) {
    this.publish(CREATE_ROOM_EVENT, message);
  }

  /**
   * Publishes a room-specific, server-triggered event to Redis.
   *
   * @param event The event identifier
   * @param message The messages which encapsulates event-specific data
   */
  publishRoomStatusMessage(event: string, message: RoomStatusMessage<any>) {
    this.publish(event, message);
  }

  /**
   * Publishes a room-specific, client-triggered event to Redis.
   *
   * @param event The event identifier
   * @param message The messages which encapsulates event-specific data
   */
  publishRoomForwardMessage(
    event: string,
    message: RoomForwardMessage<any>,
  ): void {
    this.publish(event, message);
  }

  private publish(channel: string, message: any) {
    this.redis.publish(channel, JSON.stringify(message));
  }
}

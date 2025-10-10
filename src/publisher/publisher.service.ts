import { Injectable, Inject } from '@nestjs/common';
import {
  CreateRoomMessage,
  CREATE_ROOM_EVENT,
} from 'src/message/pubsub/create-room-message';
import { RoomForwardMessage } from 'src/message/pubsub/room-forward-message';
import { RoomStatusMessage } from 'src/message/pubsub/room-status-message';
import { RedisClientType } from 'redis';

@Injectable()
export class PublisherService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: RedisClientType,
  ) {}

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

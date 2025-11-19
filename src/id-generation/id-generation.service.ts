import { Injectable, Inject } from '@nestjs/common';
import { RedisClientType } from 'redis';

const UNIQUE_ID_KEY = 'unique_id';
const ROOM_ID_KEY = 'room_id';

@Injectable()
export class IdGenerationService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: RedisClientType,
  ) {}

  /**
   * Generates a unique ID among all distributed replicas
   *
   * @returns A unique ID
   */
  async nextId(): Promise<string> {
    return (await this.getUniqueId()).toString();
  }

  /**
   * Generates a unique room ID among all distributed replicas.
   * Room IDs start at 1 and increment by 1 for each new room.
   *
   * @returns A unique room ID
   */
  async nextRoomId(): Promise<string> {
    return (await this.getRoomId()).toString();
  }

  private async getUniqueId(): Promise<number> {
    await this.redis.setNX(UNIQUE_ID_KEY, '0');
    const nextUniqueKey = await this.redis.incr(UNIQUE_ID_KEY);
    return nextUniqueKey;
  }

  private async getRoomId(): Promise<number> {
    await this.redis.setNX(ROOM_ID_KEY, '0');
    const nextRoomId = await this.redis.incr(ROOM_ID_KEY);
    return nextRoomId;
  }
}

import { Injectable, Inject } from '@nestjs/common';
import { RedisClientType } from 'redis';

const UNIQUE_ID_KEY = 'unique_id';

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

  private async getUniqueId(): Promise<number> {
    await this.redis.setNX(UNIQUE_ID_KEY, '0');
    const nextUniqueKey = await this.redis.incr(UNIQUE_ID_KEY);
    return nextUniqueKey;
  }
}

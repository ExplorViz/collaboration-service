import { Injectable, Logger } from '@nestjs/common';
import mongoose from 'mongoose';

@Injectable()
export class MongoInitService {
  static async isMongoAvailable(): Promise<boolean> {
    const mongoUri =
      process.env.MONGO_URI || 'mongodb://127.0.0.1:27018/collab_db';

    try {
      await mongoose.connect(mongoUri);
      Logger.log('MongoDB connection successful.');
      await mongoose.disconnect();
      return true;
    } catch (err) {
      Logger.warn('MongoDB not available.');
      await mongoose.disconnect();
      return false;
    }
  }
}

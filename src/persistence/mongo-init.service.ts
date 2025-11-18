import { Injectable, Logger } from '@nestjs/common';
import mongoose from 'mongoose';

@Injectable()
export class MongoInitService {
  static async isMongoAvailable(): Promise<boolean> {
    const mongoUri =
      process.env.MONGO_URI || 'mongodb://127.0.0.1:27018/collab_db';

    try {
      // Add timeout to prevent hanging during startup
      const connectPromise = mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 3000, // 3 second timeout
        socketTimeoutMS: 3000,
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('MongoDB connection timeout')), 3000);
      });

      await Promise.race([connectPromise, timeoutPromise]);
      Logger.log('MongoDB connection successful.');
      await mongoose.disconnect();
      return true;
    } catch (error) {
      Logger.error(`MongoDB not available: ${error.message}`);
      try {
        await mongoose.disconnect();
      } catch (error) {
        Logger.error(`MongoDB disconnect failed: ${error.message}`);
      }
      return false;
    }
  }
}

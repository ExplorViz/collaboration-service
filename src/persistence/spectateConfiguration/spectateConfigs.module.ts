import { DynamicModule, Logger, Module } from '@nestjs/common';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { SpectateConfig, SpectateConfigSchema } from './spectateConfig.schema';
import { SpectateConfigsService } from './spectateConfig.service';
import { SpectateConfigController } from './spectateConfig.controller';
import { SpectateConfigFallback } from './spectateConfigFallback.service';
import { MongoInitService } from '../mongo-init.service';

@Module({})
export class SpectateConfigsModule {

  static forRootAsync(): DynamicModule {
    // const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27018/collab_db';

    return {
      module: SpectateConfigsModule,
      imports: [
        // MongooseModule.forRootAsync({
        //   useFactory: async () => {
        //     const isAvailable = await MongoInitService.initializeMongo();
        //     if (!isAvailable) {
        //       return { 
        //         uri: '',
        //         autoReconnect: false,
        //         reconnectTries: 0,
        //         reconnectInterval: 0,
        //         connectTimeoutMS: 1000,
        //         connectionFactory: () => null,
        //       };
        //     } else {
        //       return { uri: mongoUri };
        //     }
        //   },
        // }),
        MongooseModule.forFeature([
            { name: SpectateConfig.name, schema: SpectateConfigSchema },
        ])
      ],
      controllers: [SpectateConfigController],
      providers: [
          {
              provide: 'SpectateConfigsService',
              useClass: SpectateConfigsService,
          },
      ],
      exports: ['SpectateConfigsService'],
    };
  }
}

//   static forRoot(): DynamicModule {
//     const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27018/collab_db';
//     const imports = [];

//     const isMongoAvailable = MongoInitService.isMongoConnected();
//     Logger.log(isMongoAvailable);

//     if (isMongoAvailable) {
//         imports.push(
//             MongooseModule.forRoot(mongoUri),
//             MongooseModule.forFeature([
//                 { name: SpectateConfig.name, schema: SpectateConfigSchema },
//             ])
//         );
//     }     

//     return {
//         module: SpectateConfigsModule,
//         imports,
//         controllers: [SpectateConfigController],
//         providers: [
//             {
//                 provide: 'SpectateConfigInterface',
//                 useClass: isMongoAvailable ? SpectateConfigsService : SpectateConfigFallback,
//             },
//         ],
//         exports: ['SpectateConfigInterface'],
//     };
//   }

// }

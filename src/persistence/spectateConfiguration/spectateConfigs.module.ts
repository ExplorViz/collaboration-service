import { DynamicModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SpectateConfig, SpectateConfigSchema } from './spectateConfig.schema';
import { SpectateConfigsService } from './spectateConfig.service';
import { SpectateConfigController } from './spectateConfig.controller';

@Module({})
export class SpectateConfigsModule {
  static forRootAsync(): DynamicModule {
    return {
      module: SpectateConfigsModule,
      imports: [
        MongooseModule.forFeature([
          { name: SpectateConfig.name, schema: SpectateConfigSchema },
        ]),
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

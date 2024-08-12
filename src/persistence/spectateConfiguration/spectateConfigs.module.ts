import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SpectateConfig, SpectateConfigSchema } from './spectateConfig.schema';
import { SpectateConfigsService } from './spectateConfig.service';
import { SpectateConfigController } from './spectateConfig.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SpectateConfig.name, schema: SpectateConfigSchema },
    ]),
  ],
  controllers: [SpectateConfigController],
  providers: [SpectateConfigsService],
})
export class SpectateConfigsModule {}

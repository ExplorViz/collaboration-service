import { Body, Controller, Get, Post } from '@nestjs/common';
import { SpectateConfigsService } from './spectateConfig.service';
import { CreateSpectateConfigDto } from '../dto/create-spectateConfig.dto';
import { SpectateConfig } from './spectateConfig.schema';

@Controller('spectateConfig')
export class SpectateConfigController {
  constructor(private readonly spectateConfigService: SpectateConfigsService) {}

  @Post('spectateConfig')
  async createConfig(
    @Body() createSpectateConfigDto: CreateSpectateConfigDto,
  ): Promise<SpectateConfig> {
    return await this.spectateConfigService.create(createSpectateConfigDto);
  }

  @Get('spectateConfig/all')
  async getAllConfigs(): Promise<SpectateConfig[]> {
    return await this.spectateConfigService.getAllConfigs();
  }
}

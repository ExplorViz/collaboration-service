import { Body, Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { SpectateConfigsService } from './spectateConfig.service';
import { CreateSpectateConfigDto } from '../dto/create-spectateConfig.dto';
import { SpectateConfig } from './spectateConfig.schema';

@Controller('spectateConfig')
export class SpectateConfigController {
  constructor(private readonly spectateConfigService: SpectateConfigsService) {}

  @Post('/add')
  async createConfig(
    @Body() createSpectateConfigDto: CreateSpectateConfigDto,
  ): Promise<SpectateConfig> {
    return await this.spectateConfigService.create(createSpectateConfigDto);
  }

  @Get('/all')
  async getAllConfigs(): Promise<SpectateConfig[]> {
    return await this.spectateConfigService.getAllConfigs();
  }

  @Put('/update')
  async updateConfig(
    @Body() spectateConfigDto: CreateSpectateConfigDto,
  ): Promise<number> {
    const spectateConfig = await this.spectateConfigService.getConfigById(
      spectateConfigDto.id,
    );

    if (spectateConfig.length !== 1) {
      return -1;
    }

    if (spectateConfigDto.user !== spectateConfig[0].user) {
      return -2;
    }

    await this.spectateConfigService.deleteConfigById(spectateConfigDto.id);

    await this.spectateConfigService.create(spectateConfigDto);

    return 0;
  }

  @Delete('/delete')
  async deleteConfig(
    @Body() spectateConfigDto: CreateSpectateConfigDto,
  ): Promise<number> {
    const spectateConfig = await this.spectateConfigService.getConfigById(
      spectateConfigDto.id,
    );

    if (spectateConfig.length !== 1) {
      return -1;
    }

    if (spectateConfigDto.user !== spectateConfig[0].user) {
      return -2;
    }

    return await this.spectateConfigService.deleteConfigById(
      spectateConfigDto.id,
    );
  }
}

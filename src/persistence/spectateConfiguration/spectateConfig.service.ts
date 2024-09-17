import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SpectateConfig } from './spectateConfig.schema';
import { Model } from 'mongoose';
import { CreateSpectateConfigDto } from '../dto/create-spectateConfig.dto';
import { SpectateConfigInterface } from './spectateConfig.interface';
import { initialData } from './initialData';

@Injectable()
export class SpectateConfigsService implements SpectateConfigInterface {
  constructor(
    @InjectModel(SpectateConfig.name)
    private spectateConfigModel: Model<SpectateConfig> | null
  ) {}

  async create(
    createSpectateConfigDto: CreateSpectateConfigDto,
  ): Promise<SpectateConfig> {
    if (!this.spectateConfigModel) {
      Logger.warn('MongoDB not available.');
      return new CreateSpectateConfigDto();
    }

    return await this.spectateConfigModel.create(createSpectateConfigDto);
  }

  async getAllConfigs(): Promise<SpectateConfig[]> {
    if (!this.spectateConfigModel) {
      Logger.warn('MongoDB not available.');
      return [];
    }

    const data = await this.spectateConfigModel.find().exec();
    if (data.length === 0) {
      initialData.forEach(async (config) => {
        await this.spectateConfigModel.create({
          id: config.id,
          user: config.user,
          devices: config.devices,
        });
      });
    }

    return data;
  }

  async getConfigById(id: string): Promise<SpectateConfig[]> {
    if (!this.spectateConfigModel) {
      Logger.warn('MongoDB not available.');
      return [];
    }

    return await this.spectateConfigModel.find({ id: id }).exec();
  }

  async deleteConfigById(id: string): Promise<number> {
    if (!this.spectateConfigModel) {
      Logger.warn('MongoDB not available.');
      return -2;
    }

    return (await this.spectateConfigModel.deleteOne({ id: id })).deletedCount;
  }
}

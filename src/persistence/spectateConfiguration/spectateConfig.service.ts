import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SpectateConfig } from './spectateConfig.schema';
import { Model } from 'mongoose';
import { CreateSpectateConfigDto } from '../dto/create-spectateConfig.dto';

@Injectable()
export class SpectateConfigsService {
  constructor(
    @InjectModel(SpectateConfig.name)
    private spectateConfigModel: Model<SpectateConfig>,
  ) {}

  async create(
    createSpectateConfigDto: CreateSpectateConfigDto,
  ): Promise<SpectateConfig> {
    return await this.spectateConfigModel.create(createSpectateConfigDto);
  }

  async getAllConfigs(): Promise<SpectateConfig[]> {
    return await this.spectateConfigModel.find().exec();
  }

  async getConfigById(id: string): Promise<SpectateConfig[]> {
    return await this.spectateConfigModel.find({ id: id }).exec();
  }

  async deleteConfigById(id: string): Promise<number> {
    return (await this.spectateConfigModel.deleteOne({ id: id })).deletedCount;
  }
}

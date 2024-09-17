import { Injectable, Logger } from "@nestjs/common";
import { SpectateConfigInterface } from "./spectateConfig.interface";
import { initialData } from "./initialData";

@Injectable()
export class SpectateConfigFallback implements SpectateConfigInterface {
    async getAllConfigs(): Promise<any[]> {
        Logger.warn('MongoDB is not available. Using initial data.');
        return initialData;
    }

    async create(dto: any): Promise<any> {
        Logger.warn('MongoDB is not available.');
        return [];
    }

    async getConfigById(id: any): Promise<any> {
        Logger.warn('MongoDB is not available. Using initial data.');

        const configs = initialData.filter((conf) => conf.id === id);

        return configs;
    }

    async deleteConfigById(id: any): Promise<any> {
        Logger.warn('MongoDB is not available.');
        return [];
    }
}
export interface SpectateConfigInterface {
    getAllConfigs(): Promise<any[]>;

    create(dto: any): any;

    getConfigById(id: any): any;

    deleteConfigById(id: any): any;
}
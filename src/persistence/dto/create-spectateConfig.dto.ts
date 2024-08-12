export class CreateSpectateConfigDto {
  id: string;
  devices: { deviceId: string; projectionMatrix: number[] }[];
}

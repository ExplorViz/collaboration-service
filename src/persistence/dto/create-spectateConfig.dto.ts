export class CreateSpectateConfigDto {
  id: string;
  user: string;
  devices: { deviceId: string; projectionMatrix: number[] }[];
}

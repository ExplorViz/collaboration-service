export const PING_UPDATE_EVENT = 'ping_update';

export type PingUpdateMessage = {
  modelIds: string[];
  positions: number[][];
};

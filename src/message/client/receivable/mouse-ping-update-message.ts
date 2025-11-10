export const MOUSE_PING_UPDATE_EVENT = 'mouse_ping_update';

export type MousePingUpdateMessage = {
  modelIds: string[];
  positions: number[][];
};

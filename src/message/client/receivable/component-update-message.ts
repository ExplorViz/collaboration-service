export const COMPONENT_UPDATE_EVENT = 'component_update';

export type ComponentUpdateMessage = {
  componentIds: string[];
  areOpened: boolean;
};

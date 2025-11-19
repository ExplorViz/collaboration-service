export const HIGHLIGHTING_UPDATE_EVENT = 'highlighting_update';

export type HighlightingUpdateMessage = {
  entityIds: string[];
  areHighlighted: boolean;
};

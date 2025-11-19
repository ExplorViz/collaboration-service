export const USER_DISCONNECTED_EVENT = 'user_disconnect';

export type UserDisconnectedMessage = {
  id: string;
  highlightedEntityIds: string[];
};

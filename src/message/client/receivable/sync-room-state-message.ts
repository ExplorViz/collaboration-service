import { UserHighlighting } from 'src/message/client/sendable/initial-landscape-message';
import {
  PublishedAnnotation,
  PublishedDetachedMenu,
} from 'src/message/pubsub/create-room-message';
import { Landscape } from 'src/payload/receivable/initial-room';

export const SYNC_ROOM_STATE_EVENT = 'sync_room_state';

export type SyncRoomStateMessage = {
  landscape: Landscape;
  closedComponentIds: string[];
  highlightedEntities: UserHighlighting[];
  detachedMenus: PublishedDetachedMenu[];
  annotations: PublishedAnnotation[];
};

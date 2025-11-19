import { Landscape } from 'src/payload/receivable/initial-room';

export const INITIAL_LANDSCAPE_EVENT = 'landscape';

export type InitialLandscapeMessage = {
  landscape: Landscape;
  closedComponents: string[];
  highlightedEntities: UserHighlighting[];
  detachedMenus: InitialDetachedMenu[];
  annotations: InitialAnnotation[];
};

export type UserHighlighting = {
  userId: string;
  entityId: string;
};

export type InitialDetachedMenu = {
  objectId: string;
  entityType: string;
  entityId: string;
  position: number[];
  quaternion: number[];
  scale: number[];
  userId: string;
};

export type InitialAnnotation = {
  objectId: string | null;
  annotationId: number;
  entityId: string | undefined;
  menuId: string | undefined;
  annotationTitle: string;
  annotationText: string;
  userId: string;
};

import { Landscape } from 'src/payload/receivable/initial-room';

export const INITIAL_LANDSCAPE_EVENT = 'landscape';

export type InitialLandscapeMessage = {
  openApps: InitialApp[];
  landscape: Landscape;
  detachedMenus: InitialDetachedMenu[];
  annotations: InitialAnnotation[];
  highlightedExternCommunicationLinks: HighlightingObject[];
};

export type InitialApp = {
  id: string;
  position: number[];
  quaternion: number[];
  scale: number[];
  openComponents: string[];
  highlightedComponents: HighlightingObject[];
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

export type HighlightingObject = {
  userId: string;
  appId: string;
  entityType: string;
  entityId: string;
  isHighlighted: boolean;
  color: number[];
};

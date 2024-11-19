export type InitialRoomPayload = {
  roomId: string;
  landscape: Landscape;
  openApps: App[];
  detachedMenus: DetachedMenu[];
  annotations: Annotation[];
};

// TODO missing properties

export type Landscape = {
  landscapeToken: string;
  timestamp: number;
};

export type App = {
  id: string;
  position: number[];
  quaternion: number[];
  openComponents: string[];
  scale: number[];
};

export type DetachedMenu = {
  entityId: string;
  entityType: string;
  userId: string;
  position: number[];
  quaternion: number[];
  scale: number[];
};

export type Annotation = {
  annotationId: number;
  entityId: string | undefined;
  menuId: string | undefined;
  annotationTitle: string;
  annotationText: string;
  userId: string;
  owner: string;
  isEditable: boolean;
  lastEditor: string;
};

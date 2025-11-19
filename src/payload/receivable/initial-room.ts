export type InitialRoomPayload = {
  roomId?: string;
  landscape: Landscape;
  detachedMenus: DetachedMenu[];
  annotations: Annotation[];
};

export type Landscape = {
  landscapeToken: string;
  timestamp: number;
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

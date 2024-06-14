export type AnnotationForwardMessage = {
  objectId: string;
  userId: string;
  annotationId: number;
  entityId: string | undefined;
  menuId: string | undefined;
  annotationTitle: string;
  annotationText: string;
};

export const ANNOTATION_UPDATED_EVENT = 'annotation_updated';

export type AnnotationUpdatedMessage = {
  annotationId: number;
  objectId: string;
  annotationTitle: string;
  annotationText: string;
  nonce: number;
};

export const ANNOTATION_OPENED_EVENT = 'annotation';

export type AnnotationOpenedMessage = {
  annotationId: number;
  entityId: string | undefined;
  position: number[];
  menuId: string | null;
  annotationTitle: string;
  annotationText: string;
  owner: string;
  inEdit: boolean;
  lastEditor: string;
  nonce: number;
};

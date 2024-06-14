import { GrabbableObjectModel } from './grabbable-object-model';
import { ScalableBaseModel } from './scalable-base-model';

export class AnnotationModel
  extends ScalableBaseModel
  implements GrabbableObjectModel
{
  private annotationId: number;
  private entityId: string | undefined;
  private entityType: string | undefined;
  private menuId: string | undefined;
  private annotationTitle: string;
  private annotationText: string;
  private userId: string;

  constructor(
    annotationId: number,
    entityId: string | undefined,
    menuId: string | undefined,
    annotationTitle: string,
    annotationText: string,
    objectId: string,
    userId: string,
  ) {
    super(objectId);
    this.annotationId = annotationId;
    this.entityId = entityId;
    this.menuId = menuId;
    this.annotationTitle = annotationTitle;
    this.annotationText = annotationText;
    this.userId = userId;
  }

  getAnnotationId(): number {
    return this.annotationId;
  }

  setAnnotationId(annotationId: number): void {
    this.annotationId = annotationId;
  }

  getEntityId(): string {
    if (this.entityId) {
      return this.entityId;
    }
    return undefined;
  }

  setEntityId(entityId: string | undefined): void {
    this.entityType = entityId;
  }

  getMenuId(): string {
    if (this.menuId !== undefined) {
      return this.menuId;
    }
    return undefined;
  }

  setMenuId(menuId: string | undefined): void {
    this.menuId = menuId;
  }

  getAnnotationTitle(): string {
    return this.annotationTitle;
  }

  setAnnotationTitle(annotationTitle: string): void {
    this.annotationTitle = annotationTitle;
  }

  getAnnotationText(): string {
    return this.annotationText;
  }

  setAnnotationText(annotationText: string): void {
    this.annotationText = annotationText;
  }

  getUserId(): string {
    return this.userId;
  }

  setUserId(userId: string): void {
    this.userId = userId;
  }

  getGrabId(): string {
    return this.getId();
  }
}

import { AnnotationModel } from 'src/model/annotation-model';
import { GrabModifier } from './grab-modifier';

export class AnnotationModifier {
  private annotations: Map<string, AnnotationModel> = new Map();

  private grabModifier: GrabModifier;

  constructor(grabModifier: GrabModifier) {
    this.grabModifier = grabModifier;
  }

  getAnnotations(): AnnotationModel[] {
    return Array.from(this.annotations.values());
  }

  annotation(
    objectId: string,
    userId: string,
    annotationId: number,
    entityId: string | undefined,
    menuId: string | undefined,
    annotationTitle: string,
    annotationText: string,
  ) {
    const menu: AnnotationModel = new AnnotationModel(
      annotationId,
      entityId,
      menuId,
      annotationTitle,
      annotationText,
      objectId,
      userId,
    );
    this.annotations.set(objectId, menu);
    this.grabModifier.addGrabbableObject(menu);
  }

  closeAnnotation(menuId: string): boolean {
    const menu: AnnotationModel | undefined = this.annotations.get(menuId);
    if (menu) {
      this.annotations.delete(menuId);
      this.grabModifier.removeGrabbableObject(menu);
      return true;
    }
  }

  closeAllAnnotations(): void {
    for (const menu of this.annotations.values()) {
      this.grabModifier.removeGrabbableObject(menu);
    }
    this.annotations.clear();
  }
}

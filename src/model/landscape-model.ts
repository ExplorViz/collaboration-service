import { GrabbableObjectModel } from './grabbable-object-model';
import { ScalableBaseModel } from './scalable-base-model';

export class LandscapeModel
  extends ScalableBaseModel
  implements GrabbableObjectModel
{
  private landscapeToken: string;
  private timestamp: number;

  private closedComponents: Set<string> = new Set();

  constructor(id: string) {
    super(id);
  }

  getLandscapeToken(): string {
    return this.landscapeToken;
  }

  setLandscapeToken(landscapeToken: string): void {
    this.landscapeToken = landscapeToken;
  }

  getTimestamp(): number {
    return this.timestamp;
  }

  setTimestamp(timestamp: number): void {
    this.timestamp = timestamp;
  }

  getGrabId(): string {
    return this.landscapeToken;
  }

  openComponents(ids: string[]): void {
    this.closedComponents = this.closedComponents.difference(new Set(ids));
  }

  closeComponents(ids: string[]): void {
    this.closedComponents = this.closedComponents.union(new Set(ids));
  }

  openAllComponents(): void {
    this.closedComponents.clear();
  }

  getClosedComponents(): string[] {
    return Array.from(this.closedComponents);
  }
}

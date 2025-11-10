import { Color } from 'src/util/color';
import { BaseModel } from './base-model';
import { ControllerModel } from './controller-model';

export enum UserState {
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  SPECTATING = 'SPECTATING',
}

export class UserModel extends BaseModel {
  private readonly userName: string;
  private readonly deviceId: string;
  private readonly controllers: Map<number, ControllerModel>;
  private state: UserState;
  private timeOfLastMessage: number;
  private readonly color: Color;
  private highlightedEntityIds: Set<string>;

  constructor(
    id: string,
    userName: string,
    deviceId: string,
    color: Color,
    position: number[],
    quaternion: number[],
  ) {
    super(id);
    this.userName = userName;
    this.deviceId = deviceId;
    this.color = color;
    this.controllers = new Map();
    this.setPosition(position);
    this.setQuaternion(quaternion);
    this.highlightedEntityIds = new Set();
  }

  getColor(): Color {
    return this.color;
  }

  getState(): UserState {
    return this.state;
  }

  setState(state: UserState): void {
    this.state = state;
  }

  getUserName(): string {
    return this.userName;
  }

  getDeviceId(): string {
    return this.deviceId;
  }

  getControllers(): ControllerModel[] {
    return Array.from(this.controllers.values());
  }

  getController(controllerId: number): ControllerModel {
    return this.controllers.get(controllerId);
  }

  addController(controllerModel: ControllerModel): void {
    this.controllers.set(controllerModel.getControllerId(), controllerModel);
  }

  removeController(controllerId: number) {
    this.controllers.delete(controllerId);
  }

  getTimeOfLastMessage(): number {
    return this.timeOfLastMessage;
  }

  setTimeOfLastMessage(time: number): void {
    this.timeOfLastMessage = time;
  }

  containsHighlightedEntity(): boolean {
    return this.highlightedEntityIds.size > 0;
  }

  addHighlightedEntityIds(entityIds: string[]): void {
    this.highlightedEntityIds = this.highlightedEntityIds.union(
      new Set(entityIds),
    );
  }

  removeHighlightedEntityIds(entityIds: string[]): void {
    this.highlightedEntityIds = this.highlightedEntityIds.difference(
      new Set(entityIds),
    );
  }

  getHighlightedEntities(): string[] {
    return Array.from(this.highlightedEntityIds);
  }

  removeAllHighlightedEntities(): void {
    this.highlightedEntityIds.clear();
  }
}

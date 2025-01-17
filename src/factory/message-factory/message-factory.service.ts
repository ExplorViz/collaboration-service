import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import {
  HighlightingObject,
  InitialAnnotation,
  InitialApp,
  InitialDetachedMenu,
  InitialLandscapeMessage,
} from 'src/message/client/sendable/initial-landscape-message';
import { SelfConnectedMessage } from 'src/message/client/sendable/self-connected-message';
import { RoomForwardMessage } from 'src/message/pubsub/room-forward-message';
import { RoomStatusMessage } from 'src/message/pubsub/room-status-message';
import { HighlightingModel } from 'src/model/highlighting-model';
import { Room } from 'src/model/room-model';
import { UserModel } from 'src/model/user-model';
import { Landscape } from 'src/payload/receivable/initial-room';
import { SessionService } from 'src/session/session.service';
import { Controller } from 'src/util/controller';
import { User, OtherUser } from 'src/util/user';

@Injectable()
export class MessageFactoryService {
  constructor(private readonly sessionService: SessionService) {}

  makeRoomForwardMessage<T>(client: Socket, message: T): RoomForwardMessage<T> {
    const session = this.sessionService.lookupSession(client);
    return {
      roomId: session.getRoom().getRoomId(),
      userId: session.getUser().getId(),
      message,
    };
  }

  makeRoomStatusMessage<T>(roomId: string, message: T): RoomStatusMessage<T> {
    return { roomId: roomId, message };
  }

  makeSelfConnectedMessage(
    room: Room,
    userModel: UserModel,
  ): SelfConnectedMessage {
    const user: User = {
      id: userModel.getId(),
      name: userModel.getUserName(),
      color: userModel.getColor(),
    };
    const otherUsers: OtherUser[] = [];
    for (const otherModel of room.getUserModifier().getUsers()) {
      if (otherModel.getId() == userModel.getId()) continue;
      const otherControllers: Controller[] = [];
      for (const controllerModel of otherModel.getControllers()) {
        if (controllerModel) {
          const otherController: Controller = {
            controllerId: controllerModel.getControllerId(),
            assetUrl: controllerModel.getAssetUrl(),
            position: controllerModel.getPosition(),
            quaternion: controllerModel.getQuaternion(),
            intersection: controllerModel.getIntersection(),
          };
          otherControllers.push(otherController);
        }
      }
      const otherUser: OtherUser = {
        id: otherModel.getId(),
        name: otherModel.getUserName(),
        color: otherModel.getColor(),
        position: otherModel.getPosition(),
        quaternion: otherModel.getQuaternion(),
        controllers: otherControllers,
      };
      otherUsers.push(otherUser);
    }
    const message: SelfConnectedMessage = {
      self: user,
      users: otherUsers,
    };
    return message;
  }

  makeInitialLandscapeMessage(room: Room): InitialLandscapeMessage {
    const externCommunicationLinks: HighlightingObject[] = [];

    const appArray: InitialApp[] = [];
    for (const app of room.getApplicationModifier().getApplications()) {
      const componentHighlightedArray: HighlightingObject[] = [];
      for (const user of room.getUserModifier().getUsers()) {
        if (user.containsHighlightedEntity()) {
          const highlighted: HighlightingModel[] =
            user.getHighlightedEntities();

          for (const highlightedEntity of highlighted) {
            if (highlightedEntity.getHighlightedApp() == app.getId()) {
              const highlightingObj: HighlightingObject = {
                userId: user.getId(),
                appId: highlightedEntity.getHighlightedApp(),
                entityType: highlightedEntity.getEntityType(),
                entityId: highlightedEntity.getHighlightedEntity(),
                isHighlighted: true,
                color: [
                  user.getColor().red,
                  user.getColor().green,
                  user.getColor().blue,
                ],
              };
              componentHighlightedArray.push(highlightingObj);
            } else if (highlightedEntity.getHighlightedApp() == '') {
              const highlightingObj: HighlightingObject = {
                userId: user.getId(),
                appId: highlightedEntity.getHighlightedApp(),
                entityType: highlightedEntity.getEntityType(),
                entityId: highlightedEntity.getHighlightedEntity(),
                isHighlighted: true,
                color: [
                  user.getColor().red,
                  user.getColor().green,
                  user.getColor().blue,
                ],
              };
              componentHighlightedArray.push(highlightingObj);

              let isEntityIdInList = false;
              const id = highlightingObj.entityId;

              for (const externCommunicationLink of externCommunicationLinks) {
                if (externCommunicationLink.entityId === id) {
                  isEntityIdInList = true;
                  break;
                }
              }

              if (!isEntityIdInList) {
                externCommunicationLinks.push(highlightingObj);
              }
            }
          }
        }
      }

      const appObj: InitialApp = {
        id: app.getId(),
        position: app.getPosition(),
        quaternion: app.getQuaternion(),
        scale: app.getScale(),
        openComponents: app.getOpenComponents(),
        highlightedComponents: componentHighlightedArray,
      };
      appArray.push(appObj);
    }

    const landscapeModel = room.getLandscapeModifier().getLandscape();
    const landscapeObj: Landscape = {
      landscapeToken: landscapeModel.getLandscapeToken(),
      timestamp: landscapeModel.getTimestamp(),
    };

    const detachedMenuArray: InitialDetachedMenu[] = [];
    for (const menu of room.getDetachedMenuModifier().getDetachedMenus()) {
      const menuObj: InitialDetachedMenu = {
        objectId: menu.getId(),
        entityId: menu.getDetachId(),
        position: menu.getPosition(),
        quaternion: menu.getQuaternion(),
        entityType: menu.getEntityType(),
        scale: menu.getScale(),
        userId: menu.getUserId(),
      };
      detachedMenuArray.push(menuObj);
    }

    const annotationArray: InitialAnnotation[] = [];
    for (const an of room.getAnnotationModifier().getAnnotations()) {
      const anObj: InitialAnnotation = {
        objectId: an.getId(),
        annotationId: an.getAnnotationId(),
        entityId: an.getEntityId(),
        menuId: an.getMenuId(),
        annotationTitle: an.getAnnotationTitle(),
        annotationText: an.getAnnotationText(),
        userId: an.getUserId(),
      };
      annotationArray.push(anObj);
    }

    return {
      openApps: appArray,
      landscape: landscapeObj,
      detachedMenus: detachedMenuArray,
      annotations: annotationArray,
      highlightedExternCommunicationLinks: externCommunicationLinks,
    };
  }
}

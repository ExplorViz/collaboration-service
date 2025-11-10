import { Injectable } from '@nestjs/common';
import { Room } from 'src/model/room-model';
import { AnnotationModifier } from 'src/modifier/annotation-modifier';
import { ColorModifier } from 'src/modifier/color-modifier';
import { DetachedMenuModifier } from 'src/modifier/detached-menu-modifier';
import { GrabModifier } from 'src/modifier/grab-modifier';
import { HeatmapModifier } from 'src/modifier/heatmap-modifier';
import { LandscapeModifier } from 'src/modifier/landscape-modifier';
import { UserModifier } from 'src/modifier/user-modifier';

@Injectable()
export class RoomFactoryService {
  constructor() {}

  makeRoom(roomId: string, roomName: string, landscapeId: string): Room {
    const grabModifier = new GrabModifier();
    const colorModifier = new ColorModifier();
    const userModifier = new UserModifier(colorModifier);
    const landscapeModifier = new LandscapeModifier(landscapeId, grabModifier);
    const detachedMenuModifier = new DetachedMenuModifier(grabModifier);
    const annotationModifier = new AnnotationModifier(grabModifier);
    const heatmapModifier = new HeatmapModifier();

    return new Room(
      roomId,
      roomName,
      userModifier,
      landscapeModifier,
      detachedMenuModifier,
      annotationModifier,
      heatmapModifier,
      colorModifier,
      grabModifier,
    );
  }
}

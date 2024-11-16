import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { RoomService } from './room/room.service';
import { TicketService } from './ticket/ticket.service';
import { RoomListRecord } from './payload/sendable/room-list';
import { Room } from './model/room-model';
import { InitialRoomPayload } from './payload/receivable/initial-room';
import { RoomCreatedResponse } from './payload/sendable/room-created';
import { LobbyJoinedResponse } from './payload/sendable/lobby-joined';
import { IdGenerationService } from './id-generation/id-generation.service';
import {
  PublishedAnnotation,
  PublishedDetachedMenu,
  PublishedLandscape,
} from './message/pubsub/create-room-message';
import { PublisherService } from './publisher/publisher.service';

@Controller()
export class AppController {
  constructor(
    private readonly roomService: RoomService,
    private readonly ticketService: TicketService,
    private readonly publisherService: PublisherService,
    private readonly idGenerationService: IdGenerationService,
  ) {}

  /**
   * Gets the IDs of all local rooms.
   */
  @Get('/rooms')
  listRooms(): RoomListRecord[] {
    const roomListRecords: RoomListRecord[] = this.roomService
      .getRooms()
      .map((room: Room) => ({
        roomId: room.getRoomId(),
        roomName: room.getName(),
        landscapeToken: room
          .getLandscapeModifier()
          .getLandscape()
          .getLandscapeToken(),
        size: room.getUserModifier().getUsers().length,
      }));

    return roomListRecords;
  }

  /**
   * Creates a new room with the given initial landscape, applications and detached menus.
   * Alternatively returns the ID of an existing room if the given ID is already in use.
   * The room is avalailable at all replicas.
   *
   * @param body The initial room layout.
   * @return The ID of the newly created room.
   */
  @Post('/room')
  async addRoom(
    @Body() body: InitialRoomPayload,
  ): Promise<RoomCreatedResponse> {
    const roomId = body.roomId
      ? body.roomId
      : await this.idGenerationService.nextId();

    if (this.roomService.lookupRoom(roomId)) {
      return { roomId };
    }

    const landscapeId = await this.idGenerationService.nextId();

    const detachedMenus: PublishedDetachedMenu[] = [];
    for (const detachMenu of body.detachedMenus) {
      const id = await this.idGenerationService.nextId();
      detachedMenus.push({
        id: id,
        menu: detachMenu,
      });
    }

    const annotations: PublishedAnnotation[] = [];
    if (body.annotations) {
      for (const annotation of body.annotations) {
        const id = await this.idGenerationService.nextId();
        annotations.push({
          id: id,
          menu: annotation,
        });
      }
    }

    const landscape: PublishedLandscape = {
      id: landscapeId,
      landscape: body.landscape,
    };

    this.publisherService.publishCreateRoomEvent({
      roomId,
      initialRoom: {
        landscape: landscape,
        openApps: body.openApps,
        detachedMenus: detachedMenus,
        annotations: annotations,
      },
    });

    const roomCreatedResponse: RoomCreatedResponse = { roomId };

    return roomCreatedResponse;
  }

  /**
   * Adds a user to the lobby of the room with the given ID.
   *
   * @param roomId The ID of the room whose lobby to add the new user to.
   * @return A ticket ID that can be used to establish a websocket connection with any replica.
   */
  @Post('/room/:roomId/lobby')
  async joinLobby(
    @Param('roomId') roomId: string,
  ): Promise<LobbyJoinedResponse> {
    if (!this.roomService.lookupRoom(roomId)) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }

    const ticket = await this.ticketService.drawTicket(roomId);

    const lobbyJoinedResponse: LobbyJoinedResponse = {
      ticketId: ticket.ticketId,
      validUntil: ticket.validUntil,
    };

    return lobbyJoinedResponse;
  }
}

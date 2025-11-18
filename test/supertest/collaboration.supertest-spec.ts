/* eslint-disable @typescript-eslint/no-require-imports */
import { io, type Socket } from 'socket.io-client';
import { ANNOTATION_CLOSED_EVENT } from 'src/message/client/receivable/annotation-closed-message';
import { ANNOTATION_EDIT_EVENT } from 'src/message/client/receivable/annotation-edit-message';
import { ANNOTATION_OPENED_EVENT } from 'src/message/client/receivable/annotation-opened-message';
import { ANNOTATION_UPDATED_EVENT } from 'src/message/client/receivable/annotation-updated-message';
import { COMPONENT_UPDATE_EVENT } from 'src/message/client/receivable/component-update-message';
import { DETACHED_MENU_CLOSED_EVENT } from 'src/message/client/receivable/detached-menu-closed-message';
import { HEATMAP_UPDATE_EVENT } from 'src/message/client/receivable/heatmap-update-message';
import { HIGHLIGHTING_UPDATE_EVENT } from 'src/message/client/receivable/highlighting-update-message';
import { MENU_DETACHED_EVENT } from 'src/message/client/receivable/menu-detached-message';
import { OBJECT_GRABBED_EVENT } from 'src/message/client/receivable/object-grabbed-message';
import { OBJECT_MOVED_EVENT } from 'src/message/client/receivable/object-moved-message';
import { OBJECT_RELEASED_EVENT } from 'src/message/client/receivable/object-released-message';
import { PING_UPDATE_EVENT } from 'src/message/client/receivable/ping-update-message';
import { SPECTATING_UPDATE_EVENT } from 'src/message/client/receivable/spectating-update-message';
import { TIMESTAMP_UPDATE_EVENT } from 'src/message/client/receivable/timestamp-update-message';
import { USER_POSITIONS_EVENT } from 'src/message/client/receivable/user-positions-message';
import { ANNOTATION_EDIT_RESPONSE_EVENT } from 'src/message/client/sendable/annotation-edit-response-message';
import { ANNOTATION_RESPONSE_EVENT } from 'src/message/client/sendable/annotation-response';
import { ANNOTATION_UPDATED_RESPONSE_EVENT } from 'src/message/client/sendable/annotation-updated-response';
import { INITIAL_LANDSCAPE_EVENT } from 'src/message/client/sendable/initial-landscape-message';
import { MENU_DETACHED_RESPONSE_EVENT } from 'src/message/client/sendable/menu-detached-response';
import { OBJECT_CLOSED_RESPONSE_EVENT } from 'src/message/client/sendable/object-closed-response';
import { OBJECT_GRABBED_RESPONSE_EVENT } from 'src/message/client/sendable/object-grabbed-response';
import { SELF_CONNECTED_EVENT } from 'src/message/client/sendable/self-connected-message';
import { RoomListRecord } from 'src/payload/sendable/room-list';
import * as request from 'supertest';

const initialRoomPayload = require('test/payload/initial-room.json');
const joinLobbyPayload = require('test/payload/join-lobby.json');
const highlightingUpdatePayload = require('test/payload/highlighting-update.json');
const componentOpenPayload = require('test/payload/component-update-open.json');
const pingPayload = require('test/payload/ping-update.json');
const spectatePayload = require('test/payload/spectating-update.json');
const heatmapPayload = require('test/payload/heatmap-update.json');
const componentClosePayload = require('test/payload/component-update-close.json');
const timestampPayload = require('test/payload/timestamp-update.json');
const menuDetachedPayload = require('test/payload/menu-detached.json');
const annotationPayload = require('test/payload/annotation.json');
const closeMenuDetachedPayload = require('test/payload/detached-menu-closed.json');
const closeAnnotationPayload = require('test/payload/annotation-closed.json');
const userPositionsPayload = require('test/payload/user-positions.json');
const grabObjectPayload = require('test/payload/object-grabbed.json');
const moveObjectPayload = require('test/payload/object-moved.json');
const releaseObjectPayload = require('test/payload/object-released.json');
const annotationEditPayload = require('test/payload/annotation-edit.json');
const annotationUpdatedPayload = require('test/payload/annotation-updated.json');
// SETUP INSTRUCTIONS:
// 1. Start the application server: npm run start
// 2. Wait for the server to be ready (should be running on port 4444)
// 3. Run the tests: npm run test:supertest
//
// NOTE: These are integration tests that require the application server to be running.
// The tests will fail with AggregateError if the server is not accessible.

// config
const host = process.env.NEST_HOST || 'localhost';
const port = process.env.NEST_PORT || '4444';
const baseURL = 'http://' + host + ':' + port;

// util
type CollaborationClient = {
  id: string;
  socket: Socket;
};

async function checkServerHealth(): Promise<boolean> {
  try {
    const response = await request(baseURL).get('/rooms').timeout(5000);
    return response.status === 200;
  } catch (error) {
    console.error('Server health check failed:', error.message);
    return false;
  }
}

async function getRooms(): Promise<RoomListRecord[]> {
  const response = await request(baseURL).get('/rooms');
  return response.body;
}

async function createRoom(): Promise<string> {
  const response = await request(baseURL)
    .post('/room')
    .send(initialRoomPayload);
  return response.body.roomId;
}

async function createClient(roomId: string): Promise<CollaborationClient> {
  const response = await request(baseURL)
    .post('/room/' + roomId + '/lobby')
    .send(joinLobbyPayload);
  const socket = io(baseURL, {
    transports: ['websocket'],
    query: {
      ticketId: response.body.ticketId,
      userName: 'JOHNNY',
      mode: 'vr',
    },
  });
  let id: string;
  socket.on(SELF_CONNECTED_EVENT, (msg) => {
    id = msg.self.id;
  });
  await sleep(500);
  return { id, socket };
}

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// test
describe('room', () => {
  beforeAll(async () => {
    const isServerHealthy = await checkServerHealth();
    if (!isServerHealthy) {
      throw new Error(
        `Server is not accessible at ${baseURL}. ` +
          'Please ensure the application is running with "npm run start" before running these tests.',
      );
    }
  });
  it('create room', async () => {
    // create room
    const roomId = await createRoom();

    await sleep(500);

    // fetch rooms
    const rooms = await getRooms();

    // room was correctly created
    expect(rooms).toContainEqual({
      roomId: roomId,
      roomName: 'Room ' + roomId,
      landscapeToken: initialRoomPayload.landscape.landscapeToken,
      size: 0,
    });
  });

  it('delete room which was left by all clients', async () => {
    // fetch initial rooms
    const initialRooms = await getRooms();

    // create room
    const roomId = await createRoom();

    await sleep(500);

    // client joins
    const client = await createClient(roomId);

    // client leaves
    client.socket.disconnect();

    await sleep(500);

    // fetch room again
    const updatedRooms = await getRooms();

    // empty room was deleted
    expect(initialRooms).toStrictEqual(updatedRooms);
  });

  it('joining clients receive landscape', async () => {
    return new Promise<void>(async (resolve, reject) => {
      // create room
      const roomId = await createRoom();

      await sleep(500);

      // client joins
      const response = await request(baseURL)
        .post('/room/' + roomId + '/lobby')
        .send(joinLobbyPayload);
      const socket = io(baseURL, {
        transports: ['websocket'],
        query: {
          ticketId: response.body.ticketId,
          userName: 'JOHNNY',
          mode: 'vr',
        },
      });

      socket.on(INITIAL_LANDSCAPE_EVENT, (msg) => {
        // correct landscape was received
        expect(msg.landscape).toStrictEqual(initialRoomPayload.landscape);
        expect(msg).toHaveProperty('closedComponents');
        expect(msg).toHaveProperty('highlightedEntities');
        expect(Array.isArray(msg.closedComponents)).toBe(true);
        expect(Array.isArray(msg.highlightedEntities)).toBe(true);
        if (msg.highlightedEntities.length > 0) {
          expect(msg.highlightedEntities[0]).toHaveProperty('userId');
          expect(msg.highlightedEntities[0]).toHaveProperty('entityId');
        }
        socket.disconnect();
        resolve();
      });

      // timeout
      await sleep(500);
      socket.disconnect();
      reject(new Error('No message received'));
    });
  });
});

describe('collaboration', () => {
  // re-created for each test
  let client1: CollaborationClient;
  let client2: CollaborationClient;

  beforeAll(async () => {
    const isServerHealthy = await checkServerHealth();
    if (!isServerHealthy) {
      throw new Error(
        `Server is not accessible at ${baseURL}. ` +
          'Please ensure the application is running with "npm run start" before running these tests.',
      );
    }
  });

  beforeEach(async () => {
    const roomId = await createRoom();
    await sleep(500);
    client1 = await createClient(roomId);
    client2 = await createClient(roomId);
  });

  afterEach(() => {
    if (client1?.socket) {
      client1.socket.disconnect();
    }
    if (client2?.socket) {
      client2.socket.disconnect();
    }
  });

  it('highlight component', async () => {
    return new Promise<void>(async (resolve, reject) => {
      client2.socket.on(HIGHLIGHTING_UPDATE_EVENT, (msg) => {
        // forwarded message is correct
        expect(msg).toStrictEqual({
          userId: client1.id,
          originalMessage: highlightingUpdatePayload,
        });
        resolve();
      });

      // highlight component
      client1.socket.emit(HIGHLIGHTING_UPDATE_EVENT, highlightingUpdatePayload);

      // timeout
      await sleep(500);
      reject(new Error('No message received'));
    });
  });

  it('open component', async () => {
    return new Promise<void>(async (resolve, reject) => {
      client2.socket.on(COMPONENT_UPDATE_EVENT, (msg) => {
        // forwarded message is correct
        expect(msg).toStrictEqual({
          userId: client1.id,
          originalMessage: componentOpenPayload,
        });
        resolve();
      });

      // open component
      client1.socket.emit(COMPONENT_UPDATE_EVENT, componentOpenPayload);

      // timeout
      await sleep(500);
      reject(new Error('No message received'));
    });
  });

  it('ping update', async () => {
    return new Promise<void>(async (resolve, reject) => {
      client2.socket.on(PING_UPDATE_EVENT, (msg) => {
        // forwarded message is correct
        expect(msg).toStrictEqual({
          userId: client1.id,
          originalMessage: pingPayload,
        });
        resolve();
      });

      // mouse ping
      client1.socket.emit(PING_UPDATE_EVENT, pingPayload);

      // timeout
      await sleep(500);
      reject(new Error('No message received'));
    });
  });

  it('update spectating', async () => {
    return new Promise<void>(async (resolve, reject) => {
      spectatePayload.spectatingUserIds = [client1.id];
      spectatePayload.spectatedUserId = client2.id;

      client2.socket.on(SPECTATING_UPDATE_EVENT, (msg) => {
        // forwarded message is correct
        expect(msg).toMatchObject({
          userId: client1.id,
          originalMessage: spectatePayload,
        });
        resolve();
      });

      // update spectating
      client1.socket.emit(SPECTATING_UPDATE_EVENT, spectatePayload);

      // timeout
      await sleep(500);
      reject(new Error('No message received'));
    });
  });

  it('update heatmap', async () => {
    return new Promise<void>(async (resolve, reject) => {
      client2.socket.on(HEATMAP_UPDATE_EVENT, (msg) => {
        // forwarded message is correct
        expect(msg).toStrictEqual({
          userId: client1.id,
          originalMessage: heatmapPayload,
        });
        resolve();
      });

      // update heatmap
      client1.socket.emit(HEATMAP_UPDATE_EVENT, heatmapPayload);

      // timeout
      await sleep(500);
      reject(new Error('No message received'));
    });
  });

  it('close component', async () => {
    return new Promise<void>(async (resolve, reject) => {
      client2.socket.on(COMPONENT_UPDATE_EVENT, (msg) => {
        // forwarded message is correct
        expect(msg).toStrictEqual({
          userId: client1.id,
          originalMessage: componentClosePayload,
        });
        resolve();
      });

      // close component
      client1.socket.emit(COMPONENT_UPDATE_EVENT, componentClosePayload);

      // timeout
      await sleep(500);
      reject(new Error('No message received'));
    });
  });

  it('update timestamp', async () => {
    return new Promise<void>(async (resolve, reject) => {
      client2.socket.on(TIMESTAMP_UPDATE_EVENT, (msg) => {
        // forwarded message is correct
        expect(msg).toStrictEqual({
          userId: client1.id,
          originalMessage: timestampPayload,
        });
        resolve();
      });

      // update timestamp
      client1.socket.emit(TIMESTAMP_UPDATE_EVENT, timestampPayload);

      await sleep(500);
      reject(new Error('No message received'));
    });
  });

  it('detach menu', async () => {
    let forwardedObjectId: string;
    client2.socket.on(MENU_DETACHED_EVENT, (msg) => {
      // forwarded attributes are correct
      expect(msg.userId).toStrictEqual(client1.id);
      expect(msg.detachId).toStrictEqual(menuDetachedPayload.detachId);
      expect(msg.entityType).toStrictEqual(menuDetachedPayload.entityType);
      expect(msg.position).toStrictEqual(menuDetachedPayload.position);
      expect(msg.quaternion).toStrictEqual(menuDetachedPayload.quaternion);
      expect(msg.scale).toStrictEqual(menuDetachedPayload.scale);
      forwardedObjectId = msg.objectId;
    });

    let respondedObjectId: string;
    client1.socket.on(MENU_DETACHED_RESPONSE_EVENT, (msg) => {
      // nonce is correct
      expect(msg.nonce).toStrictEqual(menuDetachedPayload.nonce);
      respondedObjectId = msg.response.objectId;
    });

    // detach menu
    client1.socket.emit(MENU_DETACHED_EVENT, menuDetachedPayload);

    await sleep(500);

    // object id is equal for both clients
    expect(forwardedObjectId).toBeDefined();
    expect(respondedObjectId).toBeDefined();
    expect(forwardedObjectId).toStrictEqual(respondedObjectId);
  });

  it('close detached menu', async () => {
    return new Promise<void>(async (resolve, reject) => {
      let menuId: number;
      client1.socket.on(MENU_DETACHED_RESPONSE_EVENT, (msg) => {
        // nonce is correct
        expect(msg.nonce).toStrictEqual(menuDetachedPayload.nonce);
        menuId = msg.response.objectId;
      });
      client1.socket.on(OBJECT_CLOSED_RESPONSE_EVENT, (msg) => {
        // nonce is correct
        expect(msg.nonce).toStrictEqual(closeMenuDetachedPayload.nonce);
        // closing was successful
        expect(msg.response.isSuccess).toStrictEqual(true);
        resolve();
      });

      // detach menu
      client1.socket.emit(MENU_DETACHED_EVENT, menuDetachedPayload);

      await sleep(500);

      // response including menu id were received
      expect(menuId).toBeDefined();
      closeMenuDetachedPayload.menuId = menuId;

      // close menu
      client1.socket.emit(DETACHED_MENU_CLOSED_EVENT, closeMenuDetachedPayload);

      // timeout
      await sleep(500);
      reject(new Error('No message received'));
    });
  });

  it('annotation opened', async () => {
    let forwardedObjectId: string;
    client2.socket.on(ANNOTATION_OPENED_EVENT, (msg) => {
      // forwarded attributes are correct
      expect(msg.userId).toStrictEqual(client1.id);
      expect(msg.annotationId).toStrictEqual(annotationPayload.annotationId);
      expect(msg.entityId).toStrictEqual(annotationPayload.entityId);
      expect(msg.menuId).toStrictEqual(annotationPayload.menuId);
      expect(msg.annotationTitle).toStrictEqual(
        annotationPayload.annotationTitle,
      );
      expect(msg.annotationText).toStrictEqual(
        annotationPayload.annotationText,
      );
      expect(msg.owner).toStrictEqual(annotationPayload.owner);
      expect(msg.lastEditor).toStrictEqual(annotationPayload.lastEditor);
      forwardedObjectId = msg.objectId;
    });

    let respondedObjectId: string;
    client1.socket.on(ANNOTATION_RESPONSE_EVENT, (msg) => {
      // nonce is correct
      expect(msg.nonce).toStrictEqual(annotationPayload.nonce);
      respondedObjectId = msg.response.objectId;
    });

    // open annotation
    client1.socket.emit(ANNOTATION_OPENED_EVENT, annotationPayload);

    await sleep(500);

    // object id is equal for both clients
    expect(forwardedObjectId).toBeDefined();
    expect(respondedObjectId).toBeDefined();
    expect(forwardedObjectId).toStrictEqual(respondedObjectId);
  });

  it('close annotation', async () => {
    return new Promise<void>(async (resolve, reject) => {
      let menuId: number;
      client1.socket.on(ANNOTATION_RESPONSE_EVENT, (msg) => {
        // nonce is correct
        expect(msg.nonce).toStrictEqual(annotationPayload.nonce);
        menuId = msg.response.objectId;
      });
      client1.socket.on(OBJECT_CLOSED_RESPONSE_EVENT, (msg) => {
        // nonce is correct
        expect(msg.nonce).toStrictEqual(closeAnnotationPayload.nonce);
        // closing was successful
        expect(msg.response.isSuccess).toStrictEqual(true);
        resolve();
      });

      // open annotation
      client1.socket.emit(ANNOTATION_OPENED_EVENT, annotationPayload);

      await sleep(500);

      // response including menu id were received
      expect(menuId).toBeDefined();
      closeAnnotationPayload.menuId = menuId;

      // close annotation
      client1.socket.emit(ANNOTATION_CLOSED_EVENT, closeAnnotationPayload);

      // timeout
      await sleep(500);
      reject(new Error('No message received'));
    });
  });

  it('annotation edit', async () => {
    client2.socket.on(ANNOTATION_EDIT_EVENT, () => {
      // there is no forwarding
    });

    let respondedIsEditable: boolean;
    client1.socket.on(ANNOTATION_EDIT_RESPONSE_EVENT, (msg) => {
      // nonce is correct
      expect(msg.nonce).toStrictEqual(annotationEditPayload.nonce);
      respondedIsEditable = msg.response.isEditable;
    });

    // edit annotation
    client1.socket.emit(ANNOTATION_EDIT_EVENT, annotationEditPayload);

    await sleep(500);

    // object id is equal for both clients
    expect(respondedIsEditable).toBeDefined();
  });

  it('annotation updated', async () => {
    // prepare objectId for update
    let objectId: string;
    client2.socket.on(ANNOTATION_OPENED_EVENT, (msg) => {
      objectId = msg.objectId;
    });

    // test update event
    let forwardedObjectId: string;
    client2.socket.on(ANNOTATION_UPDATED_EVENT, (msg) => {
      // forwarded attributes are correct
      expect(msg.annotationId).toStrictEqual(
        annotationUpdatedPayload.annotationId,
      );
      expect(msg.annotationTitle).toStrictEqual(
        annotationUpdatedPayload.annotationTitle,
      );
      expect(msg.annotationText).toStrictEqual(
        annotationUpdatedPayload.annotationText,
      );
      expect(msg.lastEditor).toStrictEqual(annotationUpdatedPayload.lastEditor);
      forwardedObjectId = msg.objectId;
    });

    let respondedUpdated: boolean;
    client1.socket.on(ANNOTATION_UPDATED_RESPONSE_EVENT, (msg) => {
      // nonce is correct
      expect(msg.nonce).toStrictEqual(annotationUpdatedPayload.nonce);
      respondedUpdated = msg.response.updated;
    });

    // add annotation
    client1.socket.emit(ANNOTATION_OPENED_EVENT, annotationPayload);

    await sleep(500);

    // overwrite objectId of payload (not possible in other ways, because auto generation)
    annotationUpdatedPayload.objectId = objectId;

    // update annotation
    client1.socket.emit(ANNOTATION_UPDATED_EVENT, annotationUpdatedPayload);

    await sleep(500);

    // object id is equal for both clients
    expect(forwardedObjectId).toBeDefined();
    expect(respondedUpdated).toBeDefined();
    expect(forwardedObjectId).toStrictEqual(annotationUpdatedPayload.objectId);
  });

  it('update user position', async () => {
    return new Promise<void>(async (resolve, reject) => {
      client2.socket.on(USER_POSITIONS_EVENT, (msg) => {
        // forwarded message is correct
        expect(msg).toStrictEqual({
          userId: client1.id,
          originalMessage: userPositionsPayload,
        });
        resolve();
      });

      // update user position
      client1.socket.emit(USER_POSITIONS_EVENT, userPositionsPayload);

      // timeout
      await sleep(500);
      reject(new Error('No message received'));
    });
  });

  it('move object', async () => {
    return new Promise<void>(async (resolve, reject) => {
      // First, create a detached menu to get an objectId
      let objectId: string;

      // Set up listener for menu detached event before emitting
      const menuAddedPromise = new Promise<void>((menuAddedResolve) => {
        client2.socket.once(MENU_DETACHED_EVENT, () => {
          menuAddedResolve();
        });
      });

      await new Promise<void>((menuResolve) => {
        client1.socket.on(MENU_DETACHED_RESPONSE_EVENT, (msg) => {
          objectId = msg.response.objectId;
          menuResolve();
        });
        client1.socket.emit(MENU_DETACHED_EVENT, menuDetachedPayload);
      });

      // Wait for the menu to be added to the grab modifier via Redis pub/sub
      // The MENU_DETACHED_EVENT is broadcast after the menu is added
      await menuAddedPromise;

      // Update payloads with the actual objectId
      const grabPayload = { ...grabObjectPayload, objectId };
      const movePayload = { ...moveObjectPayload, objectId };

      let isSuccess: boolean;
      client1.socket.on(OBJECT_GRABBED_RESPONSE_EVENT, (msg) => {
        // nonce is correct
        expect(msg.nonce).toStrictEqual(grabPayload.nonce);
        isSuccess = msg.response.isSuccess;
      });
      client2.socket.on(OBJECT_MOVED_EVENT, (msg) => {
        // forwarded message is correct
        expect(msg).toStrictEqual({
          userId: client1.id,
          originalMessage: movePayload,
        });
        resolve();
      });

      // grab object
      client1.socket.emit(OBJECT_GRABBED_EVENT, grabPayload);

      await sleep(500);

      // grabbing was successful
      expect(isSuccess).toStrictEqual(true);

      // move object
      client1.socket.emit(OBJECT_MOVED_EVENT, movePayload);

      // timeout
      await sleep(500);
      reject(new Error('No message received'));
    });
  });

  it('object can be grabbed by one user only', async () => {
    return new Promise<void>(async (resolve, reject) => {
      // First, create a detached menu to get an objectId
      let objectId: string;

      // Set up listener for menu detached event before emitting
      const menuAddedPromise = new Promise<void>((menuAddedResolve) => {
        client2.socket.once(MENU_DETACHED_EVENT, () => {
          menuAddedResolve();
        });
      });

      await new Promise<void>((menuResolve) => {
        client1.socket.on(MENU_DETACHED_RESPONSE_EVENT, (msg) => {
          objectId = msg.response.objectId;
          menuResolve();
        });
        client1.socket.emit(MENU_DETACHED_EVENT, menuDetachedPayload);
      });

      // Wait for the menu to be added to the grab modifier via Redis pub/sub
      // The MENU_DETACHED_EVENT is broadcast after the menu is added
      await menuAddedPromise;

      // Update payload with the actual objectId
      const grabPayload = { ...grabObjectPayload, objectId };

      let isSuccess: boolean;
      client1.socket.on(OBJECT_GRABBED_RESPONSE_EVENT, (msg) => {
        isSuccess = msg.response.isSuccess;
      });
      client2.socket.on(OBJECT_GRABBED_RESPONSE_EVENT, (msg) => {
        // grabbding was unsuccessful
        expect(msg.response.isSuccess).toStrictEqual(false);
        resolve();
      });

      // client1 grabs object
      client1.socket.emit(OBJECT_GRABBED_EVENT, grabPayload);

      await sleep(500);

      // grabbing was successful
      expect(isSuccess).toStrictEqual(true);

      // client2 grabs object
      client2.socket.emit(OBJECT_GRABBED_EVENT, grabPayload);

      // timeout
      await sleep(500);
      reject(new Error('No message received'));
    });
  });

  it('grabbed object cannot be closed', async () => {
    return new Promise<void>(async (resolve, reject) => {
      // First, create a detached menu to get an objectId
      let objectId: string;

      // Set up listener for menu detached event before emitting
      const menuAddedPromise = new Promise<void>((menuAddedResolve) => {
        client2.socket.once(MENU_DETACHED_EVENT, () => {
          menuAddedResolve();
        });
      });

      await new Promise<void>((menuResolve) => {
        client1.socket.on(MENU_DETACHED_RESPONSE_EVENT, (msg) => {
          objectId = msg.response.objectId;
          menuResolve();
        });
        client1.socket.emit(MENU_DETACHED_EVENT, menuDetachedPayload);
      });

      // Wait for the menu to be added to the grab modifier via Redis pub/sub
      // The MENU_DETACHED_EVENT is broadcast after the menu is added
      await menuAddedPromise;

      // Update payloads with the actual objectId
      const grabPayload = { ...grabObjectPayload, objectId };
      const closePayload = { ...closeMenuDetachedPayload, menuId: objectId };

      let isSuccess: boolean;
      client1.socket.on(OBJECT_GRABBED_RESPONSE_EVENT, (msg) => {
        isSuccess = msg.response.isSuccess;
      });
      client2.socket.on(OBJECT_CLOSED_RESPONSE_EVENT, (msg) => {
        // closing was unsuccessful
        expect(msg.response.isSuccess).toStrictEqual(false);
        resolve();
      });

      // client1 grabs object
      client1.socket.emit(OBJECT_GRABBED_EVENT, grabPayload);

      await sleep(500);

      // grabbing was successful
      expect(isSuccess).toStrictEqual(true);

      // client2 tries to close the grabbed object
      client2.socket.emit(DETACHED_MENU_CLOSED_EVENT, closePayload);

      // timeout
      await sleep(500);
      reject(new Error('No message received'));
    });
  });

  it('released object can be grabbed again', async () => {
    return new Promise<void>(async (resolve, reject) => {
      // First, create a detached menu to get an objectId
      let objectId: string;
      await new Promise<void>((menuResolve) => {
        client1.socket.on(MENU_DETACHED_RESPONSE_EVENT, (msg) => {
          objectId = msg.response.objectId;
          menuResolve();
        });
        client1.socket.emit(MENU_DETACHED_EVENT, menuDetachedPayload);
      });

      // Update payloads with the actual objectId
      const grabPayload = { ...grabObjectPayload, objectId };
      const releasePayload = { ...releaseObjectPayload, objectId };

      // grab object
      client1.socket.emit(OBJECT_GRABBED_EVENT, grabPayload);

      await sleep(500);

      // release object
      client1.socket.emit(OBJECT_RELEASED_EVENT, releasePayload);

      await sleep(500);

      client1.socket.on(OBJECT_GRABBED_RESPONSE_EVENT, (msg) => {
        // grabbing released object was successfull
        expect(msg.response.isSuccess).toStrictEqual(true);
        resolve();
      });

      // grab object again
      client1.socket.emit(OBJECT_GRABBED_EVENT, grabPayload);

      // timeout
      await sleep(500);
      reject(new Error('No message received'));
    });
  });
});

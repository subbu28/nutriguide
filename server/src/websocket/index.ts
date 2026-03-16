import { WebSocket } from 'ws';

interface Connection {
  userId: string;
  familyIds: string[];
  socket: WebSocket;
}

const connections = new Map<string, Connection>();
const familyConnections = new Map<string, Set<string>>(); // familyId -> Set<userId>

export function websocketHandler(connection: any, request: any) {
  const socket = connection.socket as WebSocket;
  let userId: string | null = null;
  let userFamilies: string[] = [];

  socket.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());

      switch (message.type) {
        case 'AUTH': {
          // Client sends auth token after connection
          userId = message.userId;
          userFamilies = message.familyIds || [];

          if (userId) {
            connections.set(userId, {
              userId,
              familyIds: userFamilies,
              socket
            });

            // Register user in family connections
            for (const familyId of userFamilies) {
              if (!familyConnections.has(familyId)) {
                familyConnections.set(familyId, new Set());
              }
              familyConnections.get(familyId)!.add(userId);
            }

            socket.send(JSON.stringify({
              type: 'AUTH_SUCCESS',
              payload: { userId, connectedFamilies: userFamilies }
            }));
          }
          break;
        }

        case 'JOIN_FAMILY': {
          const { familyId } = message.payload;
          if (userId && familyId) {
            if (!familyConnections.has(familyId)) {
              familyConnections.set(familyId, new Set());
            }
            familyConnections.get(familyId)!.add(userId);
            userFamilies.push(familyId);

            const conn = connections.get(userId);
            if (conn) {
              conn.familyIds = userFamilies;
            }
          }
          break;
        }

        case 'LEAVE_FAMILY': {
          const { familyId } = message.payload;
          if (userId && familyId) {
            familyConnections.get(familyId)?.delete(userId);
            userFamilies = userFamilies.filter(f => f !== familyId);

            const conn = connections.get(userId);
            if (conn) {
              conn.familyIds = userFamilies;
            }
          }
          break;
        }

        case 'PING': {
          socket.send(JSON.stringify({ type: 'PONG' }));
          break;
        }

        case 'TYPING': {
          const { familyId } = message.payload;
          if (userId && familyId) {
            broadcastToFamily(familyId, {
              type: 'USER_TYPING',
              payload: { userId, familyId }
            }, userId);
          }
          break;
        }
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });

  socket.on('close', () => {
    if (userId) {
      // Remove from family connections
      for (const familyId of userFamilies) {
        familyConnections.get(familyId)?.delete(userId);
      }
      connections.delete(userId);
    }
  });

  socket.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  // Send initial connection success
  socket.send(JSON.stringify({ type: 'CONNECTED' }));
}

export function broadcastToFamily(familyId: string, message: any, excludeUserId?: string) {
  const memberIds = familyConnections.get(familyId);
  if (!memberIds) return;

  const payload = JSON.stringify(message);

  for (const memberId of memberIds) {
    if (excludeUserId && memberId === excludeUserId) continue;

    const connection = connections.get(memberId);
    if (connection && connection.socket.readyState === WebSocket.OPEN) {
      connection.socket.send(payload);
    }
  }
}

export function sendToUser(userId: string, message: any) {
  const connection = connections.get(userId);
  if (connection && connection.socket.readyState === WebSocket.OPEN) {
    connection.socket.send(JSON.stringify(message));
  }
}

export function isUserOnline(userId: string): boolean {
  const connection = connections.get(userId);
  return !!connection && connection.socket.readyState === WebSocket.OPEN;
}

export function getOnlineFamilyMembers(familyId: string): string[] {
  const memberIds = familyConnections.get(familyId);
  if (!memberIds) return [];

  return Array.from(memberIds).filter(userId => isUserOnline(userId));
}

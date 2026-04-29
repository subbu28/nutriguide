import { FastifyInstance } from 'fastify';
import { WebSocket } from 'ws';
import { prisma } from '../lib/prisma.js';
import jwt from '@fastify/jwt';

interface ConnectedClient {
  socket: WebSocket;
  userId: string;
  familyIds: string[];
}

const clients = new Map<string, ConnectedClient>();

export function setupWebSocket(fastify: FastifyInstance) {
  fastify.get('/ws', { websocket: true }, (connection, req) => {
    const socket = connection.socket;
    let userId: string | null = null;

    // Handle authentication
    socket.on('message', async (message: Buffer) => {
      try {
        const data = JSON.parse(message.toString());

        // Authentication message
        if (data.type === 'auth') {
          try {
            const decoded = await fastify.jwt.verify<{ userId: string }>(data.token);
            userId = decoded.userId;

            // Get user's families
            const memberships = await prisma.familyMember.findMany({
              where: { userId },
              select: { familyId: true },
            });

            const familyIds = memberships.map(m => m.familyId);

            clients.set(userId, {
              socket,
              userId,
              familyIds,
            });

            socket.send(JSON.stringify({ type: 'auth', success: true }));

            // Send unread notification count
            const unreadCount = await prisma.notification.count({
              where: { userId, read: false },
            });

            socket.send(JSON.stringify({
              type: 'notification_count',
              count: unreadCount,
            }));
          } catch (err) {
            socket.send(JSON.stringify({ type: 'auth', success: false, error: 'Invalid token' }));
          }
          return;
        }

        // Chat message
        if (data.type === 'chat_message' && userId) {
          const { familyId, content } = data;

          const client = clients.get(userId);
          if (!client?.familyIds.includes(familyId)) {
            socket.send(JSON.stringify({ type: 'error', error: 'Not a member of this family' }));
            return;
          }

          // Save message
          const message = await prisma.message.create({
            data: {
              familyId,
              userId,
              content,
              type: 'TEXT',
            },
            include: {
              user: {
                select: { id: true, name: true, avatar: true },
              },
            },
          });

          // Broadcast to family members
          broadcastToFamily(familyId, {
            type: 'chat_message',
            message,
          });
        }

        // Typing indicator
        if (data.type === 'typing' && userId) {
          const { familyId } = data;
          const client = clients.get(userId);
          if (client?.familyIds.includes(familyId)) {
            broadcastToFamily(familyId, {
              type: 'typing',
              userId,
              familyId,
            }, [userId]); // Exclude sender
          }
        }

        // Mark notifications read
        if (data.type === 'mark_notifications_read' && userId) {
          await prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true },
          });

          socket.send(JSON.stringify({
            type: 'notification_count',
            count: 0,
          }));
        }
      } catch (err) {
        console.error('WebSocket error:', err);
        socket.send(JSON.stringify({ type: 'error', error: 'Invalid message format' }));
      }
    });

    socket.on('close', () => {
      if (userId) {
        clients.delete(userId);
      }
    });

    socket.on('error', (err) => {
      console.error('WebSocket error:', err);
    });
  });
}

// Broadcast message to all connected clients in a family
function broadcastToFamily(familyId: string, message: any, excludeUserIds: string[] = []) {
  for (const [userId, client] of clients.entries()) {
    if (excludeUserIds.includes(userId)) continue;
    if (client.familyIds.includes(familyId)) {
      if (client.socket.readyState === WebSocket.OPEN) {
        client.socket.send(JSON.stringify(message));
      }
    }
  }
}

// Broadcast to specific user
export function broadcastToUser(userId: string, message: any) {
  const client = clients.get(userId);
  if (client && client.socket.readyState === WebSocket.OPEN) {
    client.socket.send(JSON.stringify(message));
  }
}

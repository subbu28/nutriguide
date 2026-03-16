type MessageHandler = (message: any) => void;

class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private handlers: Map<string, Set<MessageHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private pingInterval: NodeJS.Timeout | null = null;
  private userId: string | null = null;
  private familyIds: string[] = [];

  constructor() {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
    this.url = `${wsUrl}/ws`;
  }

  connect(userId: string, familyIds: string[]) {
    this.userId = userId;
    this.familyIds = familyIds;

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.authenticate();
      return;
    }

    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.authenticate();
      this.startPing();
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.stopPing();
      this.attemptReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private authenticate() {
    if (this.ws?.readyState === WebSocket.OPEN && this.userId) {
      this.send({
        type: 'AUTH',
        userId: this.userId,
        familyIds: this.familyIds,
      });
    }
  }

  private startPing() {
    this.pingInterval = setInterval(() => {
      this.send({ type: 'PING' });
    }, 30000);
  }

  private stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    setTimeout(() => {
      if (this.userId) {
        this.connect(this.userId, this.familyIds);
      }
    }, delay);
  }

  disconnect() {
    this.stopPing();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.userId = null;
    this.familyIds = [];
  }

  send(message: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  joinFamily(familyId: string) {
    if (!this.familyIds.includes(familyId)) {
      this.familyIds.push(familyId);
    }
    this.send({ type: 'JOIN_FAMILY', payload: { familyId } });
  }

  leaveFamily(familyId: string) {
    this.familyIds = this.familyIds.filter(f => f !== familyId);
    this.send({ type: 'LEAVE_FAMILY', payload: { familyId } });
  }

  sendTyping(familyId: string) {
    this.send({ type: 'TYPING', payload: { familyId } });
  }

  on(type: string, handler: MessageHandler) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);

    return () => {
      this.handlers.get(type)?.delete(handler);
    };
  }

  off(type: string, handler: MessageHandler) {
    this.handlers.get(type)?.delete(handler);
  }

  private handleMessage(message: any) {
    const handlers = this.handlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => handler(message.payload));
    }

    // Also emit to wildcard handlers
    const wildcardHandlers = this.handlers.get('*');
    if (wildcardHandlers) {
      wildcardHandlers.forEach(handler => handler(message));
    }
  }
}

export const wsClient = new WebSocketClient();

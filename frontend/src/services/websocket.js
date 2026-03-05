import { io } from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
  }

  connect(userId, token) {
    if (this.socket?.connected) {
      console.log('WebSocket already connected');
      return;
    }

    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:3000';
    
    this.socket = io(wsUrl, {
      query: { userId, token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.emit('connection', { connected: true });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.emit('connection', { connected: false, reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        this.emit('error', { message: 'Max reconnection attempts reached' });
      }
    });

    // Listen for all message types
    this.socket.on('message', (data) => {
      console.log('WebSocket message:', data);
      this.handleMessage(data);
    });

    // Specific event handlers
    this.socket.on('sensor_data', (data) => {
      this.emit('sensor_data', data);
    });

    this.socket.on('device_status', (data) => {
      this.emit('device_status', data);
    });

    this.socket.on('alert', (data) => {
      this.emit('alert', data);
    });

    this.socket.on('connected', (data) => {
      console.log('WebSocket acknowledged:', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  handleMessage(data) {
    const { type, ...payload } = data;
    
    switch (type) {
      case 'sensor_data':
        this.emit('sensor_data', payload);
        break;
      case 'device_status':
        this.emit('device_status', payload);
        break;
      case 'alert':
        this.emit('alert', payload);
        break;
      default:
        this.emit('message', data);
    }
  }

  // Subscribe to an event
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    // Return unsubscribe function
    return () => {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        eventListeners.delete(callback);
      }
    };
  }

  // Emit to local listeners
  emit(event, data) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((callback) => callback(data));
    }
  }

  // Remove all listeners for an event
  off(event) {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  // Get connection status
  isConnected() {
    return this.socket?.connected || false;
  }
}

// Create singleton instance
const wsService = new WebSocketService();

export default wsService;

import { io, Socket } from 'socket.io-client';

// WebSocket server URL
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3003';

// Singleton socket instance
let socket: Socket | null = null;

// Event types
export interface ChatMessage {
  id: string;
  content: string;
  type: string;
  fileUrl?: string;
  roomId: string;
  senderId: string;
  sender: {
    id: string;
    name: string | null;
    image: string | null;
  };
  createdAt: Date;
}

export interface DirectMessage {
  id: string;
  content: string;
  type: string;
  fileUrl?: string;
  conversationId: string;
  senderId: string;
  sender: {
    id: string;
    name: string | null;
    image: string | null;
  };
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'achievement';
  link?: string;
  createdAt: Date;
}

// Initialize socket connection
export function initializeSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: false,
    });
  }
  return socket;
}

// Get existing socket or create new one
export function getSocket(): Socket {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
}

// Connect socket
export function connectSocket(userId: string): Socket {
  const sock = getSocket();
  
  if (!sock.connected) {
    sock.connect();
    sock.emit('join', userId);
  }
  
  return sock;
}

// Disconnect socket
export function disconnectSocket(): void {
  if (socket?.connected) {
    socket.disconnect();
  }
}

// ============ CHAT ROOM EVENTS ============

// Join a chat room
export function joinChatRoom(roomId: string): void {
  const sock = getSocket();
  if (sock.connected) {
    sock.emit('joinRoom', roomId);
  }
}

// Leave a chat room
export function leaveChatRoom(roomId: string): void {
  const sock = getSocket();
  if (sock.connected) {
    sock.emit('leaveRoom', roomId);
  }
}

// Send a chat message
export function sendChatMessage(message: ChatMessage): void {
  const sock = getSocket();
  if (sock.connected) {
    sock.emit('chatMessage', message);
  }
}

// Send typing indicator
export function sendTypingIndicator(roomId: string, userId: string, isTyping: boolean): void {
  const sock = getSocket();
  if (sock.connected) {
    sock.emit('typing', { roomId, userId, isTyping });
  }
}

// Subscribe to new chat messages
export function subscribeToChatMessages(
  callback: (message: ChatMessage) => void
): () => void {
  const sock = getSocket();
  sock.on('newMessage', callback);
  return () => sock.off('newMessage', callback);
}

// Subscribe to typing indicators
export function subscribeToTyping(
  callback: (data: { roomId: string; userId: string; isTyping: boolean }) => void
): () => void {
  const sock = getSocket();
  sock.on('userTyping', callback);
  return () => sock.off('userTyping', callback);
}

// ============ DIRECT MESSAGE EVENTS ============

// Join a conversation
export function joinConversation(conversationId: string): void {
  const sock = getSocket();
  if (sock.connected) {
    sock.emit('joinConversation', conversationId);
  }
}

// Leave a conversation
export function leaveConversation(conversationId: string): void {
  const sock = getSocket();
  if (sock.connected) {
    sock.emit('leaveConversation', conversationId);
  }
}

// Send a direct message
export function sendDirectMessage(message: DirectMessage): void {
  const sock = getSocket();
  if (sock.connected) {
    sock.emit('directMessage', message);
  }
}

// Subscribe to new direct messages
export function subscribeToDirectMessages(
  callback: (message: DirectMessage) => void
): () => void {
  const sock = getSocket();
  sock.on('newDirectMessage', callback);
  return () => sock.off('newDirectMessage', callback);
}

// ============ NOTIFICATION EVENTS ============

// Subscribe to notifications
export function subscribeToNotifications(
  callback: (notification: Notification) => void
): () => void {
  const sock = getSocket();
  sock.on('notification', callback);
  return () => sock.off('notification', callback);
}

// Subscribe to broadcasts
export function subscribeToBroadcasts(
  callback: (data: Omit<Notification, 'userId'>) => void
): () => void {
  const sock = getSocket();
  sock.on('broadcast', callback);
  return () => sock.off('broadcast', callback);
}

// ============ PRESENCE EVENTS ============

// Update user status
export function updateUserStatus(userId: string, status: 'online' | 'away' | 'offline'): void {
  const sock = getSocket();
  if (sock.connected) {
    sock.emit('statusUpdate', { userId, status });
  }
}

// Subscribe to user presence updates
export function subscribeToPresence(
  callback: (data: { userId: string; status: string }) => void
): () => void {
  const sock = getSocket();
  sock.on('presenceUpdate', callback);
  return () => sock.off('presenceUpdate', callback);
}

// Export socket instance for advanced use
export { socket };

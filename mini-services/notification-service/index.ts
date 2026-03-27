import { Server } from 'socket.io';

const PORT = 3003;

const io = new Server(PORT, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'achievement';
  link?: string;
  createdAt: Date;
}

interface LeaderboardUpdate {
  userId: string;
  points: number;
  rank: number;
}

interface ChatMessage {
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

interface DirectMessage {
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

// Store connected users
const connectedUsers = new Map<string, string[]>(); // userId -> socketIds
const userRooms = new Map<string, Set<string>>(); // socketId -> roomIds
const userConversations = new Map<string, Set<string>>(); // socketId -> conversationIds

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // User joins their personal room
  socket.on('join', (userId: string) => {
    socket.join(`user:${userId}`);
    
    // Track connected users
    const existingSockets = connectedUsers.get(userId) || [];
    connectedUsers.set(userId, [...existingSockets, socket.id]);
    
    console.log(`User ${userId} joined with socket ${socket.id}`);
    
    // Send confirmation
    socket.emit('joined', { userId, socketId: socket.id });
    
    // Broadcast user online status
    socket.broadcast.emit('presenceUpdate', { userId, status: 'online' });
  });

  // ============ CHAT ROOM EVENTS ============
  
  // Join a chat room
  socket.on('joinRoom', (roomId: string) => {
    socket.join(`room:${roomId}`);
    
    // Track rooms for this socket
    const rooms = userRooms.get(socket.id) || new Set();
    rooms.add(roomId);
    userRooms.set(socket.id, rooms);
    
    console.log(`Socket ${socket.id} joined room ${roomId}`);
    
    // Notify others in the room
    socket.to(`room:${roomId}`).emit('userJoinedRoom', { socketId: socket.id, roomId });
  });

  // Leave a chat room
  socket.on('leaveRoom', (roomId: string) => {
    socket.leave(`room:${roomId}`);
    
    // Remove from tracking
    const rooms = userRooms.get(socket.id);
    if (rooms) {
      rooms.delete(roomId);
    }
    
    socket.to(`room:${roomId}`).emit('userLeftRoom', { socketId: socket.id, roomId });
  });

  // Handle chat messages
  socket.on('chatMessage', (message: ChatMessage) => {
    // Broadcast to all users in the room
    io.to(`room:${message.roomId}`).emit('newMessage', message);
  });

  // Handle typing indicators for chat
  socket.on('typing', (data: { roomId: string; userId: string; isTyping: boolean }) => {
    socket.to(`room:${data.roomId}`).emit('userTyping', data);
  });

  // ============ DIRECT MESSAGE EVENTS ============
  
  // Join a conversation
  socket.on('joinConversation', (conversationId: string) => {
    socket.join(`conversation:${conversationId}`);
    
    // Track conversations for this socket
    const conversations = userConversations.get(socket.id) || new Set();
    conversations.add(conversationId);
    userConversations.set(socket.id, conversations);
    
    console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
  });

  // Leave a conversation
  socket.on('leaveConversation', (conversationId: string) => {
    socket.leave(`conversation:${conversationId}`);
    
    // Remove from tracking
    const conversations = userConversations.get(socket.id);
    if (conversations) {
      conversations.delete(conversationId);
    }
  });

  // Handle direct messages
  socket.on('directMessage', (message: DirectMessage) => {
    // Broadcast to all users in the conversation
    io.to(`conversation:${message.conversationId}`).emit('newDirectMessage', message);
  });

  // ============ STATUS EVENTS ============
  
  // Handle status updates
  socket.on('statusUpdate', (data: { userId: string; status: 'online' | 'away' | 'offline' }) => {
    io.emit('presenceUpdate', data);
  });

  // ============ EVENT EVENTS ============
  
  // Join event room for real-time updates
  socket.on('joinEvent', (eventId: string) => {
    socket.join(`event:${eventId}`);
    console.log(`Socket ${socket.id} joined event ${eventId}`);
  });

  // Leave event room
  socket.on('leaveEvent', (eventId: string) => {
    socket.leave(`event:${eventId}`);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    
    // Remove from connected users and get userId for status update
    let disconnectedUserId: string | null = null;
    
    connectedUsers.forEach((sockets, userId) => {
      const index = sockets.indexOf(socket.id);
      if (index !== -1) {
        disconnectedUserId = userId;
        sockets.splice(index, 1);
        if (sockets.length === 0) {
          connectedUsers.delete(userId);
        }
      }
    });
    
    // Clean up room tracking
    userRooms.delete(socket.id);
    userConversations.delete(socket.id);
    
    // Broadcast offline status if this was the user's last socket
    if (disconnectedUserId) {
      const remainingSockets = connectedUsers.get(disconnectedUserId);
      if (!remainingSockets || remainingSockets.length === 0) {
        io.emit('presenceUpdate', { userId: disconnectedUserId, status: 'offline' });
      }
    }
  });
});

// API endpoints for the main app to send notifications
io.of('/api').on('connection', (socket) => {
  // Send notification to specific user
  socket.on('sendNotification', (data: Notification) => {
    io.to(`user:${data.userId}`).emit('notification', data);
  });

  // Broadcast to all users
  socket.on('broadcast', (data: Omit<Notification, 'userId'>) => {
    io.emit('broadcast', data);
  });

  // Send leaderboard update
  socket.on('leaderboardUpdate', (data: LeaderboardUpdate) => {
    io.to(`user:${data.userId}`).emit('leaderboardUpdate', data);
  });

  // Send badge earned notification
  socket.on('badgeEarned', (data: { userId: string; badgeName: string; badgeIcon: string }) => {
    io.to(`user:${data.userId}`).emit('badgeEarned', data);
  });

  // Event attendance update
  socket.on('eventAttendance', (data: { eventId: string; count: number }) => {
    io.to(`event:${data.eventId}`).emit('attendanceUpdate', data);
  });

  // Send chat message from API
  socket.on('sendChatMessage', (data: ChatMessage) => {
    io.to(`room:${data.roomId}`).emit('newMessage', data);
  });

  // Send direct message from API
  socket.on('sendDirectMessage', (data: DirectMessage) => {
    io.to(`conversation:${data.conversationId}`).emit('newDirectMessage', data);
  });
});

console.log(`🔔 Notification & Chat WebSocket service running on port ${PORT}`);

export { io };

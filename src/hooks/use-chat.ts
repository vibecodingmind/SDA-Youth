'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  initializeSocket,
  disconnectSocket,
  joinChatRoom,
  leaveChatRoom,
  subscribeToChatMessages,
  subscribeToTyping,
  sendTypingIndicator,
  ChatMessage,
} from '@/lib/socket';

interface UseChatOptions {
  roomId: string;
  userId: string;
  enabled?: boolean;
}

export function useChat({ roomId, userId, enabled = true }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const socket = initializeSocket();
    
    // Connect if not already connected
    if (!socket.connected) {
      socket.connect();
      socket.emit('join', userId);
    }

    // Set connected state via callback after socket operations
    const handleConnect = () => {
      setIsConnected(true);
    };

    socket.on('connect', handleConnect);
    
    // If already connected, set state immediately via queueMicrotask
    if (socket.connected) {
      queueMicrotask(() => setIsConnected(true));
    }

    // Join the chat room
    joinChatRoom(roomId);

    // Subscribe to new messages
    const unsubscribeMessages = subscribeToChatMessages((message) => {
      if (message.roomId === roomId) {
        setMessages((prev) => [...prev, message]);
      }
    });

    // Subscribe to typing indicators
    const unsubscribeTyping = subscribeToTyping(({ roomId: rId, userId: uId, isTyping }) => {
      if (rId === roomId && uId !== userId) {
        setTypingUsers((prev) => {
          if (isTyping) {
            return prev.includes(uId) ? prev : [...prev, uId];
          } else {
            return prev.filter((id) => id !== uId);
          }
        });
      }
    });

    return () => {
      socket.off('connect', handleConnect);
      unsubscribeMessages();
      unsubscribeTyping();
      leaveChatRoom(roomId);
    };
  }, [roomId, userId, enabled]);

  const sendMessage = useCallback((content: string, type: string = 'text', fileUrl?: string) => {
    const message: ChatMessage = {
      id: `temp-${Date.now()}`,
      content,
      type,
      fileUrl,
      roomId,
      senderId: userId,
      sender: {
        id: userId,
        name: null,
        image: null,
      },
      createdAt: new Date(),
    };
    
    setMessages((prev) => [...prev, message]);
    
    // Send via WebSocket
    const socket = initializeSocket();
    if (socket.connected) {
      socket.emit('chatMessage', message);
    }
  }, [roomId, userId]);

  const setTyping = useCallback((isTyping: boolean) => {
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    sendTypingIndicator(roomId, userId, isTyping);

    // Auto-clear typing after 3 seconds
    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingIndicator(roomId, userId, false);
      }, 3000);
    }
  }, [roomId, userId]);

  return {
    messages,
    setMessages,
    isConnected,
    typingUsers,
    sendMessage,
    setTyping,
  };
}

// Hook for managing chat rooms
export function useChatRooms(userId: string) {
  const [rooms, setRooms] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/chat/rooms?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch rooms');
      const data = await response.json();
      setRooms(data.rooms);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchRooms();
    }
  }, [userId, fetchRooms]);

  const createRoom = useCallback(async (data: { name: string; description?: string; type?: string }) => {
    const response = await fetch('/api/chat/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, createdBy: userId }),
    });
    if (!response.ok) throw new Error('Failed to create room');
    const newRoom = await response.json();
    setRooms((prev) => [...prev, newRoom.room]);
    return newRoom.room;
  }, [userId]);

  const joinRoom = useCallback(async (roomId: string) => {
    const response = await fetch(`/api/chat/rooms/${roomId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) throw new Error('Failed to join room');
    await fetchRooms();
  }, [userId, fetchRooms]);

  return {
    rooms,
    loading,
    error,
    refetch: fetchRooms,
    createRoom,
    joinRoom,
  };
}

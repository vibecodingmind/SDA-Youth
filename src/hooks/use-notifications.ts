'use client';

import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'achievement';
  link?: string;
  createdAt: Date;
  isRead?: boolean;
}

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    // Connect to WebSocket server with XTransformPort
    const socket: Socket = io('/?XTransformPort=3003', {
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('Connected to notification service');
      setIsConnected(true);
      socket.emit('join', userId);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from notification service');
      setIsConnected(false);
    });

    socket.on('notification', (notification: Notification) => {
      setNotifications((prev) => [
        { ...notification, createdAt: new Date(notification.createdAt), isRead: false },
        ...prev,
      ]);
      
      // Show browser notification if permitted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/logo.svg',
        });
      }
    });

    socket.on('broadcast', (notification: Omit<Notification, 'userId'>) => {
      setNotifications((prev) => [
        { ...notification, userId: userId, createdAt: new Date(notification.createdAt), isRead: false },
        ...prev,
      ]);
    });

    socket.on('badgeEarned', (data: { badgeName: string; badgeIcon: string }) => {
      const notification: Notification = {
        id: Date.now().toString(),
        userId: userId,
        title: '🏆 Badge Earned!',
        message: `You've earned the "${data.badgeName}" badge!`,
        type: 'achievement',
        link: '/dashboard/badges',
        createdAt: new Date(),
        isRead: false,
      };
      setNotifications((prev) => [notification, ...prev]);
    });

    socket.on('leaderboardUpdate', (data: { points: number; rank: number }) => {
      const notification: Notification = {
        id: Date.now().toString(),
        userId: userId,
        title: '📊 Leaderboard Update',
        message: `You're now ranked #${data.rank} with ${data.points} points!`,
        type: 'info',
        link: '/dashboard/leaderboard',
        createdAt: new Date(),
        isRead: false,
      };
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return {
    notifications,
    isConnected,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };
}

// Hook to join event rooms for real-time updates
export function useEventRoom(eventId?: string) {
  const [attendanceCount, setAttendanceCount] = useState(0);

  useEffect(() => {
    if (!eventId) return;

    const socket: Socket = io('/?XTransformPort=3003', {
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      socket.emit('joinEvent', eventId);
    });

    socket.on('attendanceUpdate', (data: { eventId: string; count: number }) => {
      setAttendanceCount(data.count);
    });

    return () => {
      socket.emit('leaveEvent', eventId);
      socket.disconnect();
    };
  }, [eventId]);

  return { attendanceCount };
}

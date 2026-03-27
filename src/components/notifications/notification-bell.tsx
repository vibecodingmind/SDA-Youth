'use client';

import * as React from 'react';
import { Bell, X, Check, CheckCheck, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Notification } from '@/hooks/use-notifications';

interface NotificationBellProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

const typeColors = {
  info: 'bg-blue-500',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  achievement: 'bg-purple-500',
};

const typeIcons = {
  info: '📢',
  success: '✅',
  warning: '⚠️',
  achievement: '🏆',
};

export function NotificationBell({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMarkAllAsRead}
              className="text-xs text-purple-600 hover:text-purple-700"
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'p-3 hover:bg-muted/50 cursor-pointer transition-colors',
                    !notification.isRead && 'bg-purple-50/50'
                  )}
                  onClick={() => onMarkAsRead(notification.id)}
                >
                  <div className="flex gap-3">
                    <span className="text-lg">
                      {typeIcons[notification.type]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn(
                          'text-sm font-medium truncate',
                          !notification.isRead && 'text-purple-700'
                        )}>
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <div className={cn('w-2 h-2 rounded-full flex-shrink-0 mt-1', typeColors[notification.type])} />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                  {notification.link && (
                    <a
                      href={notification.link}
                      className="text-xs text-purple-600 hover:underline mt-2 inline-flex items-center gap-1"
                    >
                      View details <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        {notifications.length > 0 && (
          <div className="p-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-purple-600"
              asChild
            >
              <a href="/dashboard/notifications">View all notifications</a>
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

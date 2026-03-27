'use client';

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Hash,
  Users,
  Plus,
  MessageCircle,
  Smile,
  Paperclip,
  MoreVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  type: string;
  image?: string;
  members: Array<{
    user: {
      id: string;
      name: string | null;
      image: string | null;
    };
  }>;
  messages: Array<{
    id: string;
    content: string;
    sender: {
      id: string;
      name: string | null;
      image: string | null;
    };
    createdAt: string;
  }>;
  _count: {
    messages: number;
    members: number;
  };
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  sender: {
    id: string;
    name: string | null;
    image: string | null;
  };
  createdAt: string | Date;
}

interface ChatRoomProps {
  userId: string;
  userName?: string;
}

export function ChatRoomComponent({ userId, userName = 'User' }: ChatRoomProps) {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch rooms
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch(`/api/chat/rooms?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setRooms(data.rooms);
          if (data.rooms.length > 0) {
            setSelectedRoom(data.rooms[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching rooms:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, [userId]);

  // Fetch messages for selected room
  useEffect(() => {
    if (!selectedRoom) return;

    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/chat/messages?roomId=${selectedRoom.id}`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };
    fetchMessages();
  }, [selectedRoom]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle typing indicator
  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      // In real implementation, emit typing event via WebSocket
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 3000);
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom) return;

    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      content: newMessage,
      senderId: userId,
      sender: { id: userId, name: userName, image: null },
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage('');
    setIsTyping(false);

    try {
      await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newMessage,
          roomId: selectedRoom.id,
          senderId: userId,
        }),
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase();
  };

  const formatTime = (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <Card className="h-[600px]">
        <CardContent className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[600px] flex overflow-hidden">
      {/* Rooms Sidebar */}
      <div className="w-64 border-r bg-gray-50 flex flex-col">
        <CardHeader className="border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Chat Rooms</CardTitle>
            <Button size="icon" variant="ghost" className="h-8 w-8">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => setSelectedRoom(room)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-lg transition-colors',
                  selectedRoom?.id === room.id
                    ? 'bg-purple-100 text-purple-900'
                    : 'hover:bg-gray-100'
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white">
                    <Hash className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{room.name}</p>
                    <p className="text-xs text-gray-500">
                      {room._count.members} members
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedRoom ? (
          <>
            {/* Room Header */}
            <CardHeader className="border-b px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center text-white">
                    <Hash className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{selectedRoom.name}</CardTitle>
                    <p className="text-sm text-gray-500">
                      {selectedRoom._count.members} members
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost">
                    <Users className="h-5 w-5" />
                  </Button>
                  <Button size="icon" variant="ghost">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                <AnimatePresence>
                  {messages.map((message, index) => {
                    const isOwn = message.senderId === userId;
                    const showAvatar =
                      index === 0 || messages[index - 1]?.senderId !== message.senderId;

                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          'flex gap-2',
                          isOwn ? 'flex-row-reverse' : 'flex-row'
                        )}
                      >
                        {showAvatar ? (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={message.sender.image || undefined} />
                            <AvatarFallback className="text-xs">
                              {getInitials(message.sender.name)}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="w-8" />
                        )}
                        <div
                          className={cn(
                            'max-w-[70%] rounded-2xl px-4 py-2',
                            isOwn
                              ? 'bg-purple-600 text-white rounded-tr-sm'
                              : 'bg-gray-100 rounded-tl-sm'
                          )}
                        >
                          {showAvatar && !isOwn && (
                            <p className="text-xs font-medium text-purple-600 mb-1">
                              {message.sender.name || 'Unknown'}
                            </p>
                          )}
                          <p className="text-sm">{message.content}</p>
                          <p
                            className={cn(
                              'text-xs mt-1',
                              isOwn ? 'text-purple-200' : 'text-gray-400'
                            )}
                          >
                            {formatTime(message.createdAt)}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                {typingUsers.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="flex -space-x-2">
                      {typingUsers.slice(0, 3).map((_, i) => (
                        <div
                          key={i}
                          className="w-6 h-6 rounded-full bg-gray-300 animate-pulse"
                        />
                      ))}
                    </div>
                    <span>typing...</span>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t p-4">
              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost">
                  <Paperclip className="h-5 w-5 text-gray-400" />
                </Button>
                <Input
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button size="icon" variant="ghost">
                  <Smile className="h-5 w-5 text-gray-400" />
                </Button>
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Select a chat room to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

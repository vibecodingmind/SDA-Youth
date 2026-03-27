'use client';

import * as React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Hand,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Lock,
  MoreVertical,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface PrayerRequest {
  id: string;
  title: string;
  content: string;
  isPrivate: boolean;
  isUrgent: boolean;
  isAnswered: boolean;
  answeredAt: Date | null;
  authorId: string;
  createdAt: Date;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  reactions: Array<{
    id: string;
    type: string;
    userId: string;
    user: {
      id: string;
      name: string | null;
      image: string | null;
    };
  }>;
  _count: {
    reactions: number;
  };
}

interface PrayerWallProps {
  userId: string;
}

const reactionIcons: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  praying: { icon: <Hand className="h-4 w-4" />, label: 'Praying', color: 'text-blue-600' },
  amen: { icon: <CheckCircle className="h-4 w-4" />, label: 'Amen', color: 'text-green-600' },
  heart: { icon: <Heart className="h-4 w-4" />, label: 'Heart', color: 'text-red-500' },
};

export function PrayerWall({ userId }: PrayerWallProps) {
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newPrayer, setNewPrayer] = useState({
    title: '',
    content: '',
    isPrivate: false,
    isUrgent: false,
  });
  const [showAnswered, setShowAnswered] = useState(false);

  // Fetch prayers
  React.useEffect(() => {
    const fetchPrayers = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({ userId });
        if (showAnswered) params.append('includeAnswered', 'true');
        
        const response = await fetch(`/api/prayer-requests?${params}`);
        if (response.ok) {
          const data = await response.json();
          setPrayers(data.prayers);
        }
      } catch (error) {
        console.error('Error fetching prayers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPrayers();
  }, [userId, showAnswered]);

  // Create prayer
  const createPrayer = async () => {
    try {
      const response = await fetch('/api/prayer-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newPrayer,
          authorId: userId,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setPrayers((prev) => [data.prayer, ...prev]);
        setDialogOpen(false);
        setNewPrayer({ title: '', content: '', isPrivate: false, isUrgent: false });
      }
    } catch (error) {
      console.error('Error creating prayer:', error);
    }
  };

  // React to prayer
  const react = async (prayerId: string, type: string) => {
    try {
      const prayer = prayers.find((p) => p.id === prayerId);
      const existingReaction = prayer?.reactions.find((r) => r.userId === userId);

      if (existingReaction) {
        // Remove reaction
        await fetch(`/api/prayer-requests/${prayerId}/react?userId=${userId}`, {
          method: 'DELETE',
        });
        setPrayers((prev) =>
          prev.map((p) =>
            p.id === prayerId
              ? {
                  ...p,
                  reactions: p.reactions.filter((r) => r.userId !== userId),
                  _count: { ...p._count, reactions: p._count.reactions - 1 },
                }
              : p
          )
        );
      } else {
        // Add reaction
        await fetch(`/api/prayer-requests/${prayerId}/react`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, type }),
        });
        setPrayers((prev) =>
          prev.map((p) =>
            p.id === prayerId
              ? {
                  ...p,
                  reactions: [
                    ...p.reactions,
                    {
                      id: `temp-${Date.now()}`,
                      type,
                      userId,
                      user: { id: userId, name: null, image: null },
                    },
                  ],
                  _count: { ...p._count, reactions: p._count.reactions + 1 },
                }
              : p
          )
        );
      }
    } catch (error) {
      console.error('Error reacting to prayer:', error);
    }
  };

  // Mark as answered
  const markAnswered = async (prayerId: string) => {
    try {
      await fetch(`/api/prayer-requests/${prayerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAnswered: true }),
      });
      setPrayers((prev) =>
        prev.map((p) =>
          p.id === prayerId ? { ...p, isAnswered: true, answeredAt: new Date() } : p
        )
      );
    } catch (error) {
      console.error('Error marking prayer as answered:', error);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'A';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase();
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return d.toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              🙏 Prayer Request Wall
            </CardTitle>
            <CardDescription>Share your prayer requests and pray for others</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={showAnswered ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowAnswered(!showAnswered)}
            >
              {showAnswered ? 'Hide Answered' : 'Show Answered'}
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Request
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Share a Prayer Request</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input
                    placeholder="Title"
                    value={newPrayer.title}
                    onChange={(e) =>
                      setNewPrayer((prev) => ({ ...prev, title: e.target.value }))
                    }
                  />
                  <Textarea
                    placeholder="Share your prayer request..."
                    value={newPrayer.content}
                    onChange={(e) =>
                      setNewPrayer((prev) => ({ ...prev, content: e.target.value }))
                    }
                    rows={4}
                  />
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newPrayer.isPrivate}
                        onChange={(e) =>
                          setNewPrayer((prev) => ({ ...prev, isPrivate: e.target.checked }))
                        }
                        className="rounded"
                      />
                      <span className="text-sm flex items-center gap-1">
                        <Lock className="h-3 w-3" /> Private
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newPrayer.isUrgent}
                        onChange={(e) =>
                          setNewPrayer((prev) => ({ ...prev, isUrgent: e.target.checked }))
                        }
                        className="rounded"
                      />
                      <span className="text-sm flex items-center gap-1">
                        <AlertCircle className="h-3 w-3 text-red-500" /> Urgent
                      </span>
                    </label>
                  </div>
                  <Button
                    onClick={createPrayer}
                    disabled={!newPrayer.title || !newPrayer.content}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Submit Prayer Request
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <AnimatePresence>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : prayers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No prayer requests yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {prayers.map((prayer) => (
                  <motion.div
                    key={prayer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={cn(
                      'p-4 rounded-xl border transition-all',
                      prayer.isAnswered
                        ? 'bg-green-50 border-green-200'
                        : prayer.isUrgent
                        ? 'bg-red-50 border-red-200'
                        : 'bg-white hover:shadow-md'
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={prayer.author.image || undefined} />
                          <AvatarFallback className="text-xs">
                            {getInitials(prayer.author.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {prayer.author.name || 'Anonymous'}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(prayer.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {prayer.isPrivate && (
                          <Badge variant="secondary" className="text-xs">
                            <Lock className="h-3 w-3 mr-1" />
                            Private
                          </Badge>
                        )}
                        {prayer.isUrgent && !prayer.isAnswered && (
                          <Badge variant="destructive" className="text-xs">
                            Urgent
                          </Badge>
                        )}
                        {prayer.isAnswered && (
                          <Badge className="bg-green-600 text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Answered!
                          </Badge>
                        )}
                      </div>
                    </div>

                    <h4 className="font-semibold mb-1">{prayer.title}</h4>
                    <p className="text-gray-600 text-sm mb-3">{prayer.content}</p>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex gap-2">
                        {Object.entries(reactionIcons).map(([type, config]) => {
                          const count = prayer.reactions.filter(
                            (r) => r.type === type
                          ).length;
                          const userReacted = prayer.reactions.some(
                            (r) => r.userId === userId && r.type === type
                          );

                          return (
                            <Button
                              key={type}
                              variant="ghost"
                              size="sm"
                              onClick={() => react(prayer.id, type)}
                              className={cn(
                                'h-8 px-2',
                                userReacted && 'bg-purple-100'
                              )}
                            >
                              <span className={config.color}>{config.icon}</span>
                              {count > 0 && (
                                <span className="ml-1 text-xs">{count}</span>
                              )}
                            </Button>
                          );
                        })}
                      </div>

                      {prayer.authorId === userId && !prayer.isAnswered && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => markAnswered(prayer.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Mark Answered
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

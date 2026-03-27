'use client';

import { useState, useCallback } from 'react';

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

export function usePrayerRequests(userId: string) {
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrayers = useCallback(async (includeAnswered = false) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ userId });
      if (includeAnswered) params.append('includeAnswered', 'true');
      
      const response = await fetch(`/api/prayer-requests?${params}`);
      if (!response.ok) throw new Error('Failed to fetch prayer requests');
      const data = await response.json();
      setPrayers(data.prayers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const createPrayer = useCallback(async (data: {
    title: string;
    content: string;
    isPrivate?: boolean;
    isUrgent?: boolean;
  }) => {
    const response = await fetch('/api/prayer-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, authorId: userId }),
    });
    if (!response.ok) throw new Error('Failed to create prayer request');
    const newPrayer = await response.json();
    setPrayers((prev) => [newPrayer.prayer, ...prev]);
    return newPrayer.prayer;
  }, [userId]);

  const react = useCallback(async (prayerId: string, type: string = 'praying') => {
    const response = await fetch(`/api/prayer-requests/${prayerId}/react`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, type }),
    });
    if (!response.ok) throw new Error('Failed to react');
    
    // Update the prayer in the list
    setPrayers((prev) =>
      prev.map((p) => {
        if (p.id === prayerId) {
          const existingReaction = p.reactions.find((r) => r.userId === userId);
          if (existingReaction) {
            return {
              ...p,
              reactions: p.reactions.map((r) =>
                r.userId === userId ? { ...r, type } : r
              ),
            };
          }
          return {
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
          };
        }
        return p;
      })
    );
  }, [userId]);

  const removeReaction = useCallback(async (prayerId: string) => {
    const response = await fetch(`/api/prayer-requests/${prayerId}/react?userId=${userId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to remove reaction');
    
    setPrayers((prev) =>
      prev.map((p) => {
        if (p.id === prayerId) {
          return {
            ...p,
            reactions: p.reactions.filter((r) => r.userId !== userId),
            _count: { ...p._count, reactions: Math.max(0, p._count.reactions - 1) },
          };
        }
        return p;
      })
    );
  }, [userId]);

  const markAnswered = useCallback(async (prayerId: string) => {
    const response = await fetch(`/api/prayer-requests/${prayerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAnswered: true }),
    });
    if (!response.ok) throw new Error('Failed to mark as answered');
    
    setPrayers((prev) =>
      prev.map((p) =>
        p.id === prayerId
          ? { ...p, isAnswered: true, answeredAt: new Date() }
          : p
      )
    );
  }, []);

  return {
    prayers,
    loading,
    error,
    refetch: fetchPrayers,
    createPrayer,
    react,
    removeReaction,
    markAnswered,
  };
}

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// Types for search results
export type SearchType = 'all' | 'events' | 'users' | 'devotionals' | 'forum' | 'documents' | 'prayer_requests';

export interface SearchResult {
  id: string;
  type: 'event' | 'user' | 'devotional' | 'forum_topic' | 'document' | 'prayer_request';
  title: string;
  description?: string;
  image?: string | null;
  subtitle?: string;
  url: string;
  highlightedTitle?: string;
  highlightedDescription?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  query: string;
  type: string;
}

export interface SearchOptions {
  type?: SearchType;
  limit?: number;
  offset?: number;
  debounceMs?: number;
  minQueryLength?: number;
}

// Cache for search results
const searchCache = new Map<string, { data: SearchResponse; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Recent searches stored in localStorage
const RECENT_SEARCHES_KEY = 'busybees_recent_searches';
const MAX_RECENT_SEARCHES = 10;

export function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addRecentSearch(query: string): void {
  if (typeof window === 'undefined') return;
  try {
    const recent = getRecentSearches();
    const filtered = recent.filter(s => s.toLowerCase() !== query.toLowerCase());
    const updated = [query, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // Ignore localStorage errors
  }
}

export function clearRecentSearches(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {
    // Ignore localStorage errors
  }
}

export function useSearch(options: SearchOptions = {}) {
  const {
    type = 'all',
    limit = 20,
    offset = 0,
    debounceMs = 300,
    minQueryLength = 2,
  } = options;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // Debounced search function
  const performSearch = useCallback(async (searchQuery: string, searchOffset: number = 0) => {
    if (searchQuery.length < minQueryLength) {
      setResults([]);
      setTotal(0);
      setHasMore(false);
      return;
    }

    // Check cache first
    const cacheKey = `${searchQuery}-${type}-${searchOffset}-${limit}`;
    const cached = searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setResults(cached.data.results);
      setTotal(cached.data.total);
      setHasMore(cached.data.pagination.hasMore);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        q: searchQuery,
        type,
        limit: limit.toString(),
        offset: searchOffset.toString(),
      });

      const response = await fetch(`/api/search?${params}`, {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data: SearchResponse = await response.json();

      // Cache the results
      searchCache.set(cacheKey, { data, timestamp: Date.now() });

      if (searchOffset === 0) {
        setResults(data.results);
      } else {
        setResults(prev => [...prev, ...data.results]);
      }
      setTotal(data.total);
      setHasMore(data.pagination.hasMore);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Ignore abort errors
      }
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [type, limit, minQueryLength]);

  // Debounce the search
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (query.length >= minQueryLength) {
      debounceTimerRef.current = setTimeout(() => {
        performSearch(query, offset);
      }, debounceMs);
    } else {
      setResults([]);
      setTotal(0);
      setHasMore(false);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, offset, debounceMs, minQueryLength, performSearch]);

  // Load more results
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      performSearch(query, results.length);
    }
  }, [loading, hasMore, query, results.length, performSearch]);

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setTotal(0);
    setHasMore(false);
    setError(null);
  }, []);

  // Refresh recent searches
  const refreshRecentSearches = useCallback(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // Add to recent searches
  const saveToRecent = useCallback((searchQuery: string) => {
    addRecentSearch(searchQuery);
    refreshRecentSearches();
  }, [refreshRecentSearches]);

  // Clear recent searches
  const clearAllRecentSearches = useCallback(() => {
    clearRecentSearches();
    setRecentSearches([]);
  }, []);

  return {
    query,
    setQuery,
    results,
    total,
    loading,
    error,
    hasMore,
    loadMore,
    clearSearch,
    recentSearches,
    saveToRecent,
    clearRecentSearches: clearAllRecentSearches,
    refreshRecentSearches,
  };
}

// Quick actions for the command palette
export interface QuickAction {
  id: string;
  title: string;
  icon: string;
  shortcut?: string;
  action: () => void;
  category: string;
}

export function useQuickActions() {
  const [actions, setActions] = useState<QuickAction[]>([]);

  useEffect(() => {
    // Define quick actions
    const quickActions: QuickAction[] = [
      {
        id: 'create-event',
        title: 'Create Event',
        icon: 'calendar-plus',
        category: 'Create',
        action: () => {
          window.location.href = '/dashboard?tab=events&action=create';
        },
      },
      {
        id: 'new-post',
        title: 'New Forum Post',
        icon: 'message-square-plus',
        category: 'Create',
        action: () => {
          window.location.href = '/dashboard?tab=forum&action=create';
        },
      },
      {
        id: 'add-prayer',
        title: 'Add Prayer Request',
        icon: 'heart',
        category: 'Create',
        action: () => {
          window.location.href = '/dashboard?tab=prayer&action=create';
        },
      },
      {
        id: 'view-events',
        title: 'View All Events',
        icon: 'calendar',
        category: 'Navigate',
        action: () => {
          window.location.href = '/dashboard?tab=events';
        },
      },
      {
        id: 'view-leaderboard',
        title: 'View Leaderboard',
        icon: 'trophy',
        category: 'Navigate',
        action: () => {
          window.location.href = '/dashboard?tab=leaderboard';
        },
      },
      {
        id: 'view-devotionals',
        title: 'Read Devotionals',
        icon: 'book-open',
        category: 'Navigate',
        action: () => {
          window.location.href = '/dashboard?tab=devotionals';
        },
      },
      {
        id: 'view-prayer-wall',
        title: 'Prayer Wall',
        icon: 'heart',
        category: 'Navigate',
        action: () => {
          window.location.href = '/dashboard?tab=prayer';
        },
      },
      {
        id: 'view-rewards',
        title: 'Rewards Store',
        icon: 'gift',
        category: 'Navigate',
        action: () => {
          window.location.href = '/dashboard?tab=rewards';
        },
      },
    ];

    setActions(quickActions);
  }, []);

  return actions;
}

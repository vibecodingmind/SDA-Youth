'use client';

/**
 * React Query Provider Configuration
 * 
 * Configures TanStack Query with optimized settings for the BUSYBEES platform.
 * Includes stale times, cache times, and retry configurations.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';

/**
 * Default query configuration
 */
const defaultQueryConfig = {
  /** Stale time: Data is fresh for 30 seconds */
  staleTime: 30 * 1000,
  /** Cache time: Keep unused data for 5 minutes */
  gcTime: 5 * 60 * 1000,
  /** Retry failed requests up to 2 times */
  retry: 2,
  /** Retry delay with exponential backoff */
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  /** Refetch on window focus in production only */
  refetchOnWindowFocus: process.env.NODE_ENV === 'production',
  /** Don't refetch on mount if data is fresh */
  refetchOnMount: true,
};

/**
 * Query keys factory for type-safe query keys
 */
export const queryKeys = {
  // User related
  user: {
    all: ['user'] as const,
    profile: (id: string) => ['user', 'profile', id] as const,
    list: (filters?: Record<string, unknown>) => ['user', 'list', filters] as const,
    leaderboard: (limit?: number) => ['user', 'leaderboard', limit] as const,
  },
  
  // Events
  events: {
    all: ['events'] as const,
    list: (filters?: { status?: string; limit?: number }) => ['events', 'list', filters] as const,
    detail: (id: string) => ['events', 'detail', id] as const,
    rsvps: (eventId: string) => ['events', 'rsvps', eventId] as const,
    checkins: (eventId: string) => ['events', 'checkins', eventId] as const,
  },
  
  // Daily verse
  dailyVerse: {
    all: ['dailyVerse'] as const,
    today: () => ['dailyVerse', 'today'] as const,
    byDate: (date: string) => ['dailyVerse', date] as const,
  },
  
  // Badges
  badges: {
    all: ['badges'] as const,
    list: () => ['badges', 'list'] as const,
    userBadges: (userId: string) => ['badges', 'user', userId] as const,
  },
  
  // Prayer requests
  prayerRequests: {
    all: ['prayerRequests'] as const,
    list: (filters?: { status?: string }) => ['prayerRequests', 'list', filters] as const,
    detail: (id: string) => ['prayerRequests', 'detail', id] as const,
  },
  
  // Forum
  forum: {
    categories: () => ['forum', 'categories'] as const,
    topics: (categoryId?: string) => ['forum', 'topics', categoryId] as const,
    posts: (topicId: string) => ['forum', 'posts', topicId] as const,
  },
  
  // Devotionals
  devotionals: {
    all: ['devotionals'] as const,
    today: () => ['devotionals', 'today'] as const,
    byDate: (date: string) => ['devotionals', date] as const,
  },
  
  // Announcements
  announcements: {
    all: ['announcements'] as const,
    active: () => ['announcements', 'active'] as const,
  },
  
  // Chat
  chat: {
    rooms: () => ['chat', 'rooms'] as const,
    messages: (roomId: string) => ['chat', 'messages', roomId] as const,
  },
  
  // Notifications
  notifications: {
    all: ['notifications'] as const,
    unread: () => ['notifications', 'unread'] as const,
  },
} as const;

/**
 * Create Query Client with optimized defaults
 */
function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: defaultQueryConfig,
      mutations: {
        /** Retry mutations once */
        retry: 1,
      },
    },
  });
}

/**
 * Query Provider Component
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      )}
    </QueryClientProvider>
  );
}

/**
 * Prefetch helper functions
 */
export const prefetchHelpers = {
  /** Prefetch user profile */
  userProfile: (queryClient: QueryClient, userId: string, fetcher: () => Promise<unknown>) => {
    return queryClient.prefetchQuery({
      queryKey: queryKeys.user.profile(userId),
      queryFn: fetcher,
      staleTime: 5 * 60 * 1000,
    });
  },
  
  /** Prefetch events list */
  eventsList: (queryClient: QueryClient, fetcher: () => Promise<unknown>) => {
    return queryClient.prefetchQuery({
      queryKey: queryKeys.events.list(),
      queryFn: fetcher,
      staleTime: 60 * 1000,
    });
  },
  
  /** Prefetch daily verse */
  dailyVerse: (queryClient: QueryClient, fetcher: () => Promise<unknown>) => {
    return queryClient.prefetchQuery({
      queryKey: queryKeys.dailyVerse.today(),
      queryFn: fetcher,
      staleTime: 60 * 60 * 1000,
    });
  },
  
  /** Prefetch badges */
  badges: (queryClient: QueryClient, fetcher: () => Promise<unknown>) => {
    return queryClient.prefetchQuery({
      queryKey: queryKeys.badges.list(),
      queryFn: fetcher,
      staleTime: 60 * 60 * 1000,
    });
  },
};

/**
 * Cache invalidation helpers
 */
export const invalidateHelpers = {
  /** Invalidate all user-related queries */
  users: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
  },
  
  /** Invalidate all event-related queries */
  events: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
  },
  
  /** Invalidate specific event */
  eventDetail: (queryClient: QueryClient, eventId: string) => {
    return queryClient.invalidateQueries({ 
      queryKey: queryKeys.events.detail(eventId) 
    });
  },
  
  /** Invalidate daily verse */
  dailyVerse: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.dailyVerse.all });
  },
  
  /** Invalidate badges */
  badges: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.badges.all });
  },
  
  /** Invalidate prayer requests */
  prayerRequests: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.prayerRequests.all });
  },
  
  /** Invalidate forum */
  forum: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({ queryKey: ['forum'] });
  },
  
  /** Invalidate notifications */
  notifications: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
  },
};

export { defaultQueryConfig };

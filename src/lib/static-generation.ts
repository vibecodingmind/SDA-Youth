/**
 * Static Generation Helpers
 * 
 * Utilities for ISR (Incremental Static Regeneration) and static page generation.
 */

import { db } from './db';

/**
 * Revalidation times in seconds
 */
export const RevalidateTime = {
  /** Very short - 10 seconds */
  SHORT: 10,
  /** Medium - 1 minute */
  MEDIUM: 60,
  /** Standard - 5 minutes */
  STANDARD: 300,
  /** Long - 1 hour */
  LONG: 3600,
  /** Daily - 24 hours */
  DAILY: 86400,
  /** Weekly - 7 days */
  WEEKLY: 604800,
} as const;

/**
 * Get static params for articles
 */
export async function getArticleStaticParams() {
  const articles = await db.article.findMany({
    where: { status: 'published' },
    select: { slug: true },
  });

  return articles.map((article) => ({
    slug: article.slug,
  }));
}

/**
 * Get static params for events
 */
export async function getEventStaticParams() {
  const events = await db.event.findMany({
    where: {
      status: { in: ['upcoming', 'ongoing'] },
    },
    select: { id: true },
  });

  return events.map((event) => ({
    id: event.id,
  }));
}

/**
 * Get static params for forum topics
 */
export async function getForumTopicStaticParams() {
  const topics = await db.forumTopic.findMany({
    select: { id: true },
    take: 100, // Limit to recent/popular topics
  });

  return topics.map((topic) => ({
    id: topic.id,
  }));
}

/**
 * Get static params for badges
 */
export async function getBadgeStaticParams() {
  const badges = await db.badge.findMany({
    select: { id: true },
  });

  return badges.map((badge) => ({
    id: badge.id,
  }));
}

/**
 * Prefetch data for common queries
 * Used in generateStaticParams for pre-rendering
 */
export async function prefetchStaticData() {
  const [
    badges,
    upcomingEvents,
    dailyVerse,
    categories,
  ] = await Promise.all([
    // Badges - rarely change
    db.badge.findMany({
      orderBy: { points: 'desc' },
    }),
    // Upcoming events - changes frequently
    db.event.findMany({
      where: {
        status: 'upcoming',
        startDate: { gte: new Date() },
      },
      orderBy: { startDate: 'asc' },
      take: 10,
    }),
    // Daily verse
    db.dailyVerse.findFirst({
      where: {
        date: {
          lte: new Date(),
        },
      },
      orderBy: { date: 'desc' },
    }),
    // Forum categories - rarely change
    db.forumCategory.findMany({
      orderBy: { order: 'asc' },
    }),
  ]);

  return {
    badges,
    upcomingEvents,
    dailyVerse,
    categories,
  };
}

/**
 * Check if page should be statically generated
 */
export function shouldStaticGenerate(): boolean {
  // Only static generate in production or when explicitly enabled
  return process.env.NODE_ENV === 'production' || 
         process.env.ENABLE_STATIC_GEN === 'true';
}

/**
 * Get revalidation time based on content type
 */
export function getRevalidationTime(contentType: keyof typeof RevalidateTime): number {
  return RevalidateTime[contentType] ?? RevalidateTime.STANDARD;
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

// Type for search results
interface SearchResult {
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
  createdAt?: Date;
}

// Helper function to highlight matching text
function highlightText(text: string, query: string): string {
  if (!query || !text) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

// Helper to escape LIKE query
function escapeLikeQuery(query: string): string {
  return query.replace(/[%_]/g, '\\$&');
}

// GET /api/search - Global search across multiple entities
export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const {
      q,
      type = 'all',
      limit = '20',
      offset = '0',
    } = searchParams;

    if (!q || q.trim().length < 2) {
      return NextResponse.json({
        results: [],
        total: 0,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: false,
        },
        query: q || '',
        type,
      });
    }

    const query = q.trim();
    const searchLimit = Math.min(parseInt(limit), 50);
    const searchOffset = parseInt(offset);
    const results: SearchResult[] = [];
    let total = 0;

    // Search query pattern for SQLite LIKE
    const searchPattern = `%${escapeLikeQuery(query)}%`;

    // Search Events
    if (type === 'all' || type === 'events') {
      const events = await db.event.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { location: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          title: true,
          description: true,
          location: true,
          image: true,
          startDate: true,
          status: true,
          points: true,
          creator: {
            select: { id: true, name: true },
          },
          _count: {
            select: { rsvps: true, checkIns: true },
          },
        },
        take: type === 'all' ? 5 : searchLimit,
        skip: type === 'all' ? 0 : searchOffset,
        orderBy: { startDate: 'desc' },
      });

      events.forEach((event) => {
        results.push({
          id: event.id,
          type: 'event',
          title: event.title,
          description: event.description || event.location || undefined,
          image: event.image,
          subtitle: `Event • ${event.location || 'No location'} • ${event._count.rsvps} RSVPs`,
          url: `/dashboard?tab=events&event=${event.id}`,
          highlightedTitle: highlightText(event.title, query),
          highlightedDescription: event.description ? highlightText(event.description, query) : undefined,
          metadata: {
            startDate: event.startDate,
            status: event.status,
            points: event.points,
          },
          createdAt: event.startDate,
        });
      });

      if (type === 'events') {
        total = await db.event.count({
          where: {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
              { location: { contains: query, mode: 'insensitive' } },
            ],
          },
        });
      }
    }

    // Search Users (name only for non-admin, email for admin)
    if (type === 'all' || type === 'users') {
      const users = await db.user.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          points: true,
          createdAt: true,
        },
        take: type === 'all' ? 5 : searchLimit,
        skip: type === 'all' ? 0 : searchOffset,
        orderBy: { name: 'asc' },
      });

      users.forEach((user) => {
        results.push({
          id: user.id,
          type: 'user',
          title: user.name || 'Unknown User',
          description: user.email,
          image: user.image,
          subtitle: `Member • ${user.role} • ${user.points} points`,
          url: `/dashboard?tab=leaderboard&user=${user.id}`,
          highlightedTitle: user.name ? highlightText(user.name, query) : undefined,
          metadata: {
            role: user.role,
            points: user.points,
          },
          createdAt: user.createdAt,
        });
      });

      if (type === 'users') {
        total = await db.user.count({
          where: {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
            ],
            isActive: true,
          },
        });
      }
    }

    // Search Devotionals
    if (type === 'all' || type === 'devotionals') {
      const devotionals = await db.devotional.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
            { scripture: { contains: query, mode: 'insensitive' } },
            { verse: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          title: true,
          content: true,
          scripture: true,
          verse: true,
          date: true,
          author: true,
        },
        take: type === 'all' ? 5 : searchLimit,
        skip: type === 'all' ? 0 : searchOffset,
        orderBy: { date: 'desc' },
      });

      devotionals.forEach((devo) => {
        results.push({
          id: devo.id,
          type: 'devotional',
          title: devo.title,
          description: devo.content?.substring(0, 150) + (devo.content && devo.content.length > 150 ? '...' : ''),
          subtitle: `Devotional • ${devo.scripture}${devo.verse ? ` (${devo.verse})` : ''}`,
          url: `/dashboard?tab=devotionals&devotional=${devo.id}`,
          highlightedTitle: highlightText(devo.title, query),
          highlightedDescription: devo.content ? highlightText(devo.content.substring(0, 150), query) : undefined,
          metadata: {
            scripture: devo.scripture,
            verse: devo.verse,
            author: devo.author,
          },
          createdAt: devo.date,
        });
      });

      if (type === 'devotionals') {
        total = await db.devotional.count({
          where: {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { content: { contains: query, mode: 'insensitive' } },
              { scripture: { contains: query, mode: 'insensitive' } },
              { verse: { contains: query, mode: 'insensitive' } },
            ],
          },
        });
      }
    }

    // Search Forum Topics
    if (type === 'all' || type === 'forum') {
      const topics = await db.forumTopic.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          title: true,
          content: true,
          viewCount: true,
          createdAt: true,
          isPinned: true,
          category: {
            select: { name: true },
          },
          author: {
            select: { id: true, name: true },
          },
          _count: {
            select: { posts: true },
          },
        },
        take: type === 'all' ? 5 : searchLimit,
        skip: type === 'all' ? 0 : searchOffset,
        orderBy: { createdAt: 'desc' },
      });

      topics.forEach((topic) => {
        results.push({
          id: topic.id,
          type: 'forum_topic',
          title: topic.title,
          description: topic.content?.substring(0, 150) + (topic.content && topic.content.length > 150 ? '...' : ''),
          subtitle: `Forum • ${topic.category.name} • ${topic._count.posts} replies • ${topic.viewCount} views`,
          url: `/dashboard?tab=forum&topic=${topic.id}`,
          highlightedTitle: highlightText(topic.title, query),
          highlightedDescription: topic.content ? highlightText(topic.content.substring(0, 150), query) : undefined,
          metadata: {
            category: topic.category.name,
            viewCount: topic.viewCount,
            replyCount: topic._count.posts,
            isPinned: topic.isPinned,
          },
          createdAt: topic.createdAt,
        });
      });

      if (type === 'forum') {
        total = await db.forumTopic.count({
          where: {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { content: { contains: query, mode: 'insensitive' } },
            ],
          },
        });
      }
    }

    // Search Documents
    if (type === 'all' || type === 'documents') {
      const documents = await db.document.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          title: true,
          description: true,
          type: true,
          category: true,
          url: true,
          downloadCount: true,
          createdAt: true,
          author: {
            select: { id: true, name: true },
          },
        },
        take: type === 'all' ? 5 : searchLimit,
        skip: type === 'all' ? 0 : searchOffset,
        orderBy: { createdAt: 'desc' },
      });

      documents.forEach((doc) => {
        results.push({
          id: doc.id,
          type: 'document',
          title: doc.title,
          description: doc.description || undefined,
          subtitle: `Document • ${doc.type.toUpperCase()} • ${doc.category || 'General'} • ${doc.downloadCount} downloads`,
          url: `/dashboard?tab=media&document=${doc.id}`,
          highlightedTitle: highlightText(doc.title, query),
          highlightedDescription: doc.description ? highlightText(doc.description, query) : undefined,
          metadata: {
            fileType: doc.type,
            category: doc.category,
            downloadCount: doc.downloadCount,
          },
          createdAt: doc.createdAt,
        });
      });

      if (type === 'documents') {
        total = await db.document.count({
          where: {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
            ],
          },
        });
      }
    }

    // Search Prayer Requests
    if (type === 'all' || type === 'prayer_requests') {
      const prayerRequests = await db.prayerRequest.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
          ],
          status: 'active',
        },
        select: {
          id: true,
          title: true,
          content: true,
          isAnonymous: true,
          isAnswered: true,
          createdAt: true,
          author: {
            select: { id: true, name: true },
          },
          _count: {
            select: { reactions: true },
          },
        },
        take: type === 'all' ? 5 : searchLimit,
        skip: type === 'all' ? 0 : searchOffset,
        orderBy: { createdAt: 'desc' },
      });

      prayerRequests.forEach((pr) => {
        results.push({
          id: pr.id,
          type: 'prayer_request',
          title: pr.title,
          description: pr.content?.substring(0, 150) + (pr.content && pr.content.length > 150 ? '...' : ''),
          subtitle: `Prayer Request • by ${pr.isAnonymous ? 'Anonymous' : pr.author?.name || 'Unknown'} • ${pr._count.reactions} prayers`,
          url: `/dashboard?tab=prayer&prayer=${pr.id}`,
          highlightedTitle: highlightText(pr.title, query),
          highlightedDescription: pr.content ? highlightText(pr.content.substring(0, 150), query) : undefined,
          metadata: {
            isAnonymous: pr.isAnonymous,
            isAnswered: pr.isAnswered,
            prayerCount: pr._count.reactions,
          },
          createdAt: pr.createdAt,
        });
      });

      if (type === 'prayer_requests') {
        total = await db.prayerRequest.count({
          where: {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { content: { contains: query, mode: 'insensitive' } },
            ],
            status: 'active',
          },
        });
      }
    }

    // Sort results by relevance (exact match first, then by date)
    results.sort((a, b) => {
      // Exact title match gets priority
      const aExact = a.title.toLowerCase() === query.toLowerCase();
      const bExact = b.title.toLowerCase() === query.toLowerCase();
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      // Then by creation date
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bDate - aDate;
    });

    // For 'all' type, calculate total from all searches
    if (type === 'all') {
      total = results.length;
    }

    // Apply pagination for 'all' type
    const paginatedResults = type === 'all' 
      ? results.slice(searchOffset, searchOffset + searchLimit)
      : results;

    return NextResponse.json({
      results: paginatedResults,
      total,
      pagination: {
        limit: searchLimit,
        offset: searchOffset,
        hasMore: type === 'all' 
          ? searchOffset + paginatedResults.length < results.length
          : searchOffset + paginatedResults.length < total,
      },
      query,
      type,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

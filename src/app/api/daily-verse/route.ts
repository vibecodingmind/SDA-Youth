import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getOrSet, CacheTTL, CacheKeys } from '@/lib/cache';

// GET /api/daily-verse - Get today's daily verse (with caching)
export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateKey = today.toISOString().split('T')[0];

    const cacheKey = CacheKeys.dailyVerse(dateKey);

    const verse = await getOrSet(
      cacheKey,
      async () => {
        // Check if there's a verse scheduled for today
        let dailyVerse = await db.dailyVerse.findUnique({
          where: { date: today },
        });

        // If no verse for today, return a default verse
        if (!dailyVerse) {
          // Return a default verse
          return {
            reference: 'John 3:16',
            verse: 'For God so loved the world that He gave His only begotten Son, that whoever believes in Him should not perish but have everlasting life.',
            date: dateKey,
          };
        }

        return dailyVerse;
      },
      CacheTTL.DAILY_VERSE
    );

    return NextResponse.json(verse);
  } catch (error) {
    console.error('Error fetching daily verse:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily verse' },
      { status: 500 }
    );
  }
}

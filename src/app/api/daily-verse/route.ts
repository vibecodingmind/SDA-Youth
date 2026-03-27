import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/daily-verse - Get today's daily verse
export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if there's a verse scheduled for today
    let dailyVerse = await db.dailyVerse.findUnique({
      where: { date: today },
      include: { verse: true },
    });

    // If no verse for today, pick a random one or create a rotation
    if (!dailyVerse) {
      // Get total verses
      const totalVerses = await db.bibleVerse.count();

      if (totalVerses === 0) {
        // Return a default verse if no verses in database
        return NextResponse.json({
          reference: 'John 3:16',
          text: 'For God so loved the world that He gave His only begotten Son, that whoever believes in Him should not perish but have everlasting life.',
          translation: 'NKJV',
          category: 'salvation',
        });
      }

      // Pick a verse based on the day (pseudo-random but deterministic)
      const dayOfYear = Math.floor(
        (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
      );
      const verseIndex = dayOfYear % totalVerses;

      const verses = await db.bibleVerse.findMany({
        skip: verseIndex,
        take: 1,
      });

      const verse = verses[0];

      if (verse) {
        // Create a daily verse entry for tracking
        dailyVerse = await db.dailyVerse.create({
          data: {
            verseId: verse.id,
            date: today,
          },
          include: { verse: true },
        });
      }
    }

    if (!dailyVerse) {
      return NextResponse.json(
        { error: 'No verse available' },
        { status: 404 }
      );
    }

    return NextResponse.json(dailyVerse.verse);
  } catch (error) {
    console.error('Error fetching daily verse:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily verse' },
      { status: 500 }
    );
  }
}

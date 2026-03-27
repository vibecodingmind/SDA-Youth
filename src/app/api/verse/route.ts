import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Get daily verse
export async function GET(request: NextRequest) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let verse = await db.dailyVerse.findFirst({
      where: { date: today },
    });

    // If no verse for today, return a random/default one
    if (!verse) {
      const verses = [
        { verse: "For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you, plans to give you hope and a future.", reference: "Jeremiah 29:11" },
        { verse: "Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.", reference: "Proverbs 3:5-6" },
        { verse: "I can do all this through him who gives me strength.", reference: "Philippians 4:13" },
        { verse: "Be strong and courageous. Do not be afraid; do not be discouraged, for the LORD your God will be with you wherever you go.", reference: "Joshua 1:9" },
        { verse: "The LORD is my shepherd, I lack nothing.", reference: "Psalm 23:1" },
        { verse: "But those who hope in the LORD will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.", reference: "Isaiah 40:31" },
        { verse: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.", reference: "Romans 8:28" },
        { verse: "Commit to the LORD whatever you do, and he will establish your plans.", reference: "Proverbs 16:3" },
        { verse: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.", reference: "Philippians 4:6" },
        { verse: "The joy of the LORD is your strength.", reference: "Nehemiah 8:10" },
      ];

      const randomVerse = verses[Math.floor(Math.random() * verses.length)];
      verse = await db.dailyVerse.create({
        data: {
          verse: randomVerse.verse,
          reference: randomVerse.reference,
          date: today,
        },
      });
    }

    return NextResponse.json({ verse });
  } catch (error) {
    console.error('Verse fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch verse' }, { status: 500 });
  }
}

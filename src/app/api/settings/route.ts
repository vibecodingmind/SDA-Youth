import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Get all settings
export async function GET(request: NextRequest) {
  try {
    const settings = await db.setting.findMany();
    
    const settingsObj: Record<string, string> = {};
    settings.forEach((s) => {
      settingsObj[s.key] = s.value;
    });

    return NextResponse.json({ settings: settingsObj });
  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// Update settings (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle array of settings
    if (Array.isArray(body)) {
      for (const setting of body) {
        await db.setting.upsert({
          where: { key: setting.key },
          create: { key: setting.key, value: String(setting.value), type: setting.type || 'string' },
          update: { value: String(setting.value) },
        });
      }
      return NextResponse.json({ success: true });
    }

    // Handle single setting
    const { key, value, type } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'key and value are required' }, { status: 400 });
    }

    const setting = await db.setting.upsert({
      where: { key },
      create: { key, value: String(value), type: type || 'string' },
      update: { value: String(value) },
    });

    return NextResponse.json({ setting });
  } catch (error) {
    console.error('Setting update error:', error);
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
  }
}

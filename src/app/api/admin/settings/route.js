import { auth } from '@/auth';
import sql from '@/lib/db';
import { NextResponse } from 'next/server';

// Lazy Postgres Initialization
async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS system_settings (
      key VARCHAR(255) PRIMARY KEY,
      value TEXT NOT NULL
    )
  `;
}

export async function GET(request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await initDb();
    const rows = await sql`SELECT key, value FROM system_settings WHERE key IN ('ai_model_url', 'ai_access_token')`;
    
    const settings = {
      ai_model_url: '',
      ai_access_token: ''
    };

    rows.forEach(row => {
      if (settings[row.key] !== undefined) {
        settings[row.key] = row.value;
      }
    });

    return NextResponse.json({ ok: true, settings });
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { ai_model_url, ai_access_token } = await request.json();
    
    await initDb();

    // Upsert model URL
    if (ai_model_url !== undefined) {
      await sql`
        INSERT INTO system_settings (key, value) 
        VALUES ('ai_model_url', ${ai_model_url})
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
      `;
    }

    // Upsert Access Token
    if (ai_access_token !== undefined) {
      await sql`
        INSERT INTO system_settings (key, value) 
        VALUES ('ai_access_token', ${ai_access_token})
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
      `;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to save settings:", error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

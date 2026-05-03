import { auth } from '@/auth';
import sql from '@/lib/db';
import { NextResponse } from 'next/server';

async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS ai_models (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      url VARCHAR(500) NOT NULL,
      access_token VARCHAR(500),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    // Serialize without exposing the raw underlying credentials natively to lists.
    const models = await sql`SELECT id, name, url, created_at FROM ai_models ORDER BY created_at DESC`;
    return NextResponse.json({ ok: true, models });
  } catch (error) {
    console.error("Failed to fetch models:", error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { name, url, access_token } = await request.json();
    
    if (!name || !url) {
      return NextResponse.json({ error: 'Name and URL are required' }, { status: 400 });
    }

    await initDb();

    // Map a clean insert passing the un-exposed parameters tightly.
    const result = await sql`
      INSERT INTO ai_models (name, url, access_token) 
      VALUES (${name}, ${url}, ${access_token || null})
      RETURNING id, name, url, created_at
    `;

    return NextResponse.json({ ok: true, model: result[0] });
  } catch (error) {
    console.error("Failed to save model:", error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

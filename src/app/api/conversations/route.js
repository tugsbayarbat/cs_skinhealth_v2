import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import sql from '@/lib/db';

// GET /api/conversations — returns the current user's conversation list
export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversations = await sql`
        SELECT id, title, created_at
        FROM conversations
        WHERE user_id = ${session.user.id}
        ORDER BY created_at DESC
        LIMIT 50
    `;

    return NextResponse.json({ conversations });
}

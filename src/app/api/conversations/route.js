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

// DELETE /api/conversations — clears all conversations for the current user
export async function DELETE() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await sql`
            DELETE FROM conversations
            WHERE user_id = ${session.user.id}
        `;
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete conversations:', error);
        return NextResponse.json({ error: 'Failed to clear conversations' }, { status: 500 });
    }
}

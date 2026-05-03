import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import sql from '@/lib/db';

export async function GET(request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
        return NextResponse.json({ error: 'conversationId is required' }, { status: 400 });
    }

    try {
        // Enforce that the user can only fetch their own conversation history
        const [conv] = await sql`
            SELECT id FROM conversations WHERE id = ${conversationId} AND user_id = ${session.user.id}
        `;
        if (!conv) {
            return NextResponse.json({ error: 'Conversation not found or unauthorized' }, { status: 404 });
        }

        const messages = await sql`
            SELECT role, content, created_at
            FROM messages
            WHERE conversation_id = ${conversationId}
            ORDER BY created_at ASC
        `;

        return NextResponse.json({ messages });
    } catch (err) {
        console.error('Error fetching chat history:', err);
        return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
    }
}

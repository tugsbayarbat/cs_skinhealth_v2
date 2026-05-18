import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import sql from '@/lib/db';

export async function POST(request) {
    const session = await auth();
    const userId = session?.user?.id ?? null;

    const { message, conversation_id: existingConvId } = await request.json();
    if (message == null) {
        return NextResponse.json({ error: 'message is required' }, { status: 400 });
    }

    // ── 1. Resolve or create conversation ──────────────────────
    let conversationId = existingConvId ?? null;

    if (userId) {
        if (!conversationId) {
            // 1. Ask FastAPI to start a session and give us its session_id
            const startRes = await fetch(`${process.env.FASTAPI_BASE_URL}/session/start`, {
                method: 'POST',
                headers: { 'X-Internal-Token': process.env.FASTAPI_INTERNAL_SECRET },
            });
            if (!startRes.ok) {
                const errBody = await startRes.text();
                throw new Error(`Failed to start FastAPI session: ${startRes.status} - ${errBody}`);
            }
            const startData = await startRes.json();
            const fastapiSessionId = startData.session_id;

            // 2. New conversation — use first 60 chars of message as title
            const title = message.trim().slice(0, 60) || 'New conversation';
            const [conv] = await sql`
                INSERT INTO conversations (id, user_id, title)
                VALUES (${fastapiSessionId}, ${userId}, ${title})
                RETURNING id
            `;
            conversationId = conv.id;
        }

        // ── 2. Save user message ────────────────────────────────
        const [userMsg] = await sql`
            INSERT INTO messages (conversation_id, role, content)
            VALUES (${conversationId}, 'user', ${message.trim()})
            RETURNING id
        `;

        // ── 3. Proxy to FastAPI ─────────────────────────────────
        const fastapiRes = await fetch(`${process.env.FASTAPI_BASE_URL}/chat/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Internal-Token': process.env.FASTAPI_INTERNAL_SECRET,
            },
            body: JSON.stringify({
                session_id: conversationId.toString(),
                message: message.trim()
            })
        });

        if (!fastapiRes.ok) {
            const errBody = await fastapiRes.text();
            throw new Error(`FastAPI Error: ${fastapiRes.status} - ${errBody}`);
        }

        const backendResult = await fastapiRes.json();
        const assistantContent = backendResult.response;

        // ── 4. Save assistant message with reply_to_id ─────────
        const [assistantMsg] = await sql`
            INSERT INTO messages (conversation_id, role, content, reply_to_id)
            VALUES (${conversationId}, 'assistant', ${assistantContent}, ${userMsg.id})
            RETURNING id
        `;

        return NextResponse.json({
            // Format to match old UI expectations
            response: { intro: assistantContent, points: [] },
            conversation_id: conversationId,
            user_msg_id: userMsg.id,
            assistant_msg_id: assistantMsg.id,
            backend_metadata: backendResult
        });
    }

    // Unauthenticated — reject immediately. Do NOT proxy to FastAPI.
    return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
    );
}

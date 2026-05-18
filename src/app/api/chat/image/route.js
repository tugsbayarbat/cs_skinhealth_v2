import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import sql from '@/lib/db';

export async function POST(request) {
    const session = await auth();
    const userId = session?.user?.id ?? null;

    try {
        const formData = await request.formData();
        const file = formData.get('file');
        let conversationId = formData.get('conversation_id');

        if (!file) {
            return NextResponse.json({ error: 'file is required' }, { status: 400 });
        }

        // If no conversationId exists, create a new conversation
        if (!conversationId || conversationId === 'null') {
            const startRes = await fetch(`${process.env.FASTAPI_BASE_URL}/session/start`, {
                method: 'POST',
                headers: { 'X-Internal-Token': process.env.FASTAPI_INTERNAL_SECRET },
            });
            if (!startRes.ok) throw new Error('Failed to start FastAPI session');
            const startData = await startRes.json();
            const fastapiSessionId = startData.session_id;

            if (userId) {
                const title = file.name ? file.name.slice(0, 60) : 'Uploaded Image';
                const [conv] = await sql`
                    INSERT INTO conversations (id, user_id, title)
                    VALUES (${fastapiSessionId}, ${userId}, ${title})
                    RETURNING id
                `;
                conversationId = conv.id;
            } else {
                conversationId = fastapiSessionId;
            }
        }

        // Proxy to FastAPI
        const proxyFormData = new FormData();
        proxyFormData.append('file', file);
        proxyFormData.append('session_id', conversationId.toString());

        const fastapiRes = await fetch(`${process.env.FASTAPI_BASE_URL}/chat/upload-image`, {
            method: 'POST',
            headers: { 'X-Internal-Token': process.env.FASTAPI_INTERNAL_SECRET },
            body: proxyFormData,
        });

        if (!fastapiRes.ok) {
            const errBody = await fastapiRes.text();
            throw new Error(`FastAPI Error: ${fastapiRes.status} - ${errBody}`);
        }

        const result = await fastapiRes.json();

        return NextResponse.json({
            ...result,
            conversation_id: conversationId
        });
    } catch (err) {
        console.error('Error in /api/chat/image proxy:', err);
        return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
    }
}

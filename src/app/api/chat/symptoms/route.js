import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
        return NextResponse.json({ error: 'conversationId is required' }, { status: 400 });
    }

    try {
        const fastapiRes = await fetch(`http://model.terrst.fun/session/${conversationId}/symptoms`, {
            method: 'GET',
            headers: { 'X-Internal-Token': process.env.FASTAPI_INTERNAL_SECRET },
        });

        if (!fastapiRes.ok) {
            if (fastapiRes.status === 404) {
                return NextResponse.json({}); // Gracefully handle lost/historic sessions
            }
            const errBody = await fastapiRes.text();
            throw new Error(`FastAPI Error: ${fastapiRes.status} - ${errBody}`);
        }

        const result = await fastapiRes.json();
        return NextResponse.json(result);
    } catch (err) {
        console.error('Error in /api/chat/symptoms proxy:', err);
        return NextResponse.json({ error: 'Failed to fetch symptoms' }, { status: 500 });
    }
}

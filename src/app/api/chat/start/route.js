import { NextResponse } from 'next/server';

export async function POST() {
    try {
        const fastapiRes = await fetch(`${process.env.FASTAPI_BASE_URL}/session/start`, {
            method: 'POST',
            headers: { 'X-Internal-Token': process.env.FASTAPI_INTERNAL_SECRET },
        });

        if (!fastapiRes.ok) {
            const errBody = await fastapiRes.text();
            throw new Error(`FastAPI Error: ${fastapiRes.status} - ${errBody}`);
        }

        const result = await fastapiRes.json();
        return NextResponse.json(result);
    } catch (err) {
        console.error('Error in /api/chat/start proxy:', err);
        return NextResponse.json({ error: 'Failed to start session' }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
        return NextResponse.json({ error: 'conversationId is required' }, { status: 400 });
    }

    try {
        const fastapiRes = await fetch(`${process.env.FASTAPI_BASE_URL}/session/${conversationId}/symptoms`, {
            method: 'GET',
            headers: { 'X-Internal-Token': process.env.FASTAPI_INTERNAL_SECRET },
        });

        if (!fastapiRes.ok) {
            if (fastapiRes.status === 404) {
                // Gracefully handle lost/historic sessions by fetching from PostgreSQL
                const rows = await sql`SELECT symptoms FROM conversations WHERE id = ${conversationId}`;
                if (rows.length > 0 && rows[0].symptoms) {
                    return NextResponse.json(rows[0].symptoms);
                }
                return NextResponse.json({});
            }
            const errBody = await fastapiRes.text();
            throw new Error(`FastAPI Error: ${fastapiRes.status} - ${errBody}`);
        }

        const result = await fastapiRes.json();
        
        // Save back to PostgreSQL so historic sessions can retrieve them
        if (Object.keys(result).length > 0) {
            await sql`
                UPDATE conversations 
                SET symptoms = ${JSON.stringify(result)} 
                WHERE id = ${conversationId}
            `;
        }

        return NextResponse.json(result);
    } catch (err) {
        console.error('Error in /api/chat/symptoms proxy:', err);
        return NextResponse.json({ error: 'Failed to fetch symptoms' }, { status: 500 });
    }
}

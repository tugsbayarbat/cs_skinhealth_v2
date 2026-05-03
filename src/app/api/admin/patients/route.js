import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { auth } from '@/auth';

export async function GET(request) {
    // Check auth
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const users = await sql`
            SELECT id, name, email, role, gender, birth_year, is_approved, created_at
            FROM users
            ORDER BY created_at DESC
        `;
        return NextResponse.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(request) {
    // Check auth
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id, is_approved } = await request.json();

        if (!id || typeof is_approved !== 'boolean') {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        const result = await sql`
            UPDATE users
            SET is_approved = ${is_approved}, updated_at = NOW()
            WHERE id = ${id}
            RETURNING id, is_approved
        `;

        if (result.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(result[0]);
    } catch (error) {
        console.error('Error updating user approval status:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

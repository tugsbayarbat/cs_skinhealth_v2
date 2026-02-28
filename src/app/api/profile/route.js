import { auth } from '@/auth';
import sql from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PATCH(request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, gender, birth_year } = await request.json();

    // Basic validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
    }
    if (!gender || typeof gender !== 'string') {
        return NextResponse.json({ error: 'Gender is required.' }, { status: 400 });
    }
    const currentYear = new Date().getFullYear();
    const yearNum = Number(birth_year);
    if (!birth_year || isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear) {
        return NextResponse.json({ error: `Please enter a valid birth year (1900–${currentYear}).` }, { status: 400 });
    }

    const updated = await sql`
        UPDATE users
        SET name       = ${name.trim()},
            gender     = ${gender},
            birth_year = ${yearNum}
        WHERE id = ${session.user.id}
        RETURNING id, name, gender, birth_year
    `;

    if (updated.length === 0) {
        return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, user: updated[0] });
}

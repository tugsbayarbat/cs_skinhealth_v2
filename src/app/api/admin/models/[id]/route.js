import { auth } from '@/auth';
import sql from '@/lib/db';
import { NextResponse } from 'next/server';

export async function DELETE(request, { params }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // App Router 15+ resolution logic matching promises
  const { id } = await params;
  
  if (!id) {
    return NextResponse.json({ error: 'Model ID is required' }, { status: 400 });
  }
  
  try {
    const result = await sql`DELETE FROM ai_models WHERE id = ${id} RETURNING id`;
    
    if (result.length === 0) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete model:", error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

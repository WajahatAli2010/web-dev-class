import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import sql from '@/lib/db';

async function getAuthUserId() {
  const cookieStore = await cookies();
  return cookieStore.get('userId')?.value;
}

export async function PUT(request: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, bio, avatar_url } = await request.json();

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    await sql`
      UPDATE users 
      SET name = ${name}, bio = ${bio || ''}, avatar_url = ${avatar_url || ''}
      WHERE id = ${Number(userId)}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
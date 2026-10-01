import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import sql from '@/lib/db';

async function getAuthUserId() {
  const cookieStore = await cookies();
  return cookieStore.get('userId')?.value;
}

export async function GET() {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const currentUserId = Number(userId);

    const posts = await sql`
      SELECT 
        p.id, p.title, p.content, p.user_id, p.created_at, p.visibility,
        u.name as author_name,
        COUNT(DISTINCT l.id)::int as like_count,
        (
          SELECT reaction_type FROM likes 
          WHERE likes.post_id = p.id AND likes.user_id = ${currentUserId}
          LIMIT 1
        ) as user_reaction
      FROM bookmarks b
      JOIN posts p ON b.post_id = p.id
      JOIN users u ON p.user_id = u.id
      LEFT JOIN likes l ON p.id = l.post_id
      WHERE b.user_id = ${currentUserId}
      GROUP BY p.id, u.name, b.created_at
      ORDER BY b.created_at DESC
    `;

    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch bookmarks' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const currentUserId = Number(userId);
    const { postId } = await request.json();

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const existing = await sql`
      SELECT id FROM bookmarks 
      WHERE user_id = ${currentUserId} AND post_id = ${Number(postId)}
    `;

    if (existing.length > 0) {
      await sql`
        DELETE FROM bookmarks 
        WHERE user_id = ${currentUserId} AND post_id = ${Number(postId)}
      `;
      return NextResponse.json({ bookmarked: false });
    } else {
      await sql`
        INSERT INTO bookmarks (user_id, post_id) 
        VALUES (${currentUserId}, ${Number(postId)})
      `;
      return NextResponse.json({ bookmarked: true });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to toggle bookmark' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import sql from '@/lib/db';

async function getAuthUserId() {
  const cookieStore = await cookies();
  return cookieStore.get('userId')?.value;
}

export async function GET(request: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const currentUserId = Number(userId);
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim() || '';

    if (!q) {
      return NextResponse.json({ users: [], posts: [] });
    }

    const queryPattern = `%${q}%`;

    // 1. Search Users (excluding self)
    const users = await sql`
      SELECT 
        u.id, u.name, u.username, u.avatar_url, u.bio,
        f.id as friendship_id,
        f.status as friendship_status,
        f.sender_id
      FROM users u
      LEFT JOIN friendships f ON 
        (f.sender_id = ${currentUserId} AND f.receiver_id = u.id) OR
        (f.sender_id = u.id AND f.receiver_id = ${currentUserId})
      WHERE u.id != ${currentUserId}
        AND (u.name ILIKE ${queryPattern} OR u.username ILIKE ${queryPattern})
      LIMIT 20
    `;

    const formattedUsers = users.map((u) => {
      let status = 'none';
      if (u.friendship_status === 'accepted') {
        status = 'accepted';
      } else if (u.friendship_status === 'pending') {
        status = u.sender_id === currentUserId ? 'pending_sent' : 'pending_received';
      }
      return {
        id: u.id,
        name: u.name,
        username: u.username,
        avatar_url: u.avatar_url,
        bio: u.bio,
        status,
        friendshipId: u.friendship_id,
      };
    });

    // 2. Search Posts (title & content)
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
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN likes l ON p.id = l.post_id
      WHERE (p.title ILIKE ${queryPattern} OR p.content ILIKE ${queryPattern})
        AND (
          p.user_id = ${currentUserId}
          OR p.visibility = 'everyone'
        )
      GROUP BY p.id, u.name
      ORDER BY p.created_at DESC
      LIMIT 20
    `;

    return NextResponse.json({ users: formattedUsers, posts });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to perform search' }, { status: 500 });
  }
}
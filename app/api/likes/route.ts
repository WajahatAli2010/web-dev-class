import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import sql from '@/lib/db';

async function getAuthUserId() {
  const cookieStore = await cookies();
  return cookieStore.get('userId')?.value;
}

// POST: Toggle like/unlike on a post
export async function POST(request: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { postId } = await request.json();
    if (!postId) return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });

    const currentUserId = Number(userId);

    // Check if the user already liked this post
    const existingLike = await sql`
      SELECT id FROM likes 
      WHERE post_id = ${postId} AND user_id = ${currentUserId}
    `;

    if (existingLike.length > 0) {
      // Unlike
      await sql`
        DELETE FROM likes 
        WHERE post_id = ${postId} AND user_id = ${currentUserId}
      `;
      return NextResponse.json({ liked: false }, { status: 200 });
    } else {
      // Like
      await sql`
        INSERT INTO likes (post_id, user_id) 
        VALUES (${postId}, ${currentUserId})
      `;
      return NextResponse.json({ liked: true }, { status: 201 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
  }
}
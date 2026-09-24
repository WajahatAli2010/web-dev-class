import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import sql from '@/lib/db';

async function getAuthUserId() {
  const cookieStore = await cookies();
  return cookieStore.get('userId')?.value;
}

// GET: Fetch list of users with their reaction types for a post
export async function GET(request: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const likers = await sql`
      SELECT users.id, users.name, users.username, likes.reaction_type
      FROM likes
      JOIN users ON likes.user_id = users.id
      WHERE likes.post_id = ${Number(postId)}
      ORDER BY likes.created_at DESC
    `;

    return NextResponse.json(likers, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reactions' }, { status: 500 });
  }
}

// POST: Add, change, or remove reaction
export async function POST(request: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { postId, reactionType = 'like' } = await request.json();
    if (!postId) return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });

    const currentUserId = Number(userId);

    const existingLike = await sql`
      SELECT id, reaction_type FROM likes 
      WHERE post_id = ${postId} AND user_id = ${currentUserId}
    `;

    if (existingLike.length > 0) {
      if (existingLike[0].reaction_type === reactionType) {
        // Tapping same reaction removes it
        await sql`
          DELETE FROM likes 
          WHERE post_id = ${postId} AND user_id = ${currentUserId}
        `;
        return NextResponse.json({ action: 'removed' }, { status: 200 });
      } else {
        // Switch reaction type
        await sql`
          UPDATE likes 
          SET reaction_type = ${reactionType}
          WHERE post_id = ${postId} AND user_id = ${currentUserId}
        `;
        return NextResponse.json({ action: 'updated', reactionType }, { status: 200 });
      }
    } else {
      // Add reaction
      await sql`
        INSERT INTO likes (post_id, user_id, reaction_type) 
        VALUES (${postId}, ${currentUserId}, ${reactionType})
      `;
      return NextResponse.json({ action: 'added', reactionType }, { status: 201 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process reaction' }, { status: 500 });
  }
}
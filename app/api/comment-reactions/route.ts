import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import sql from '@/lib/db';

async function getAuthUserId() {
  const cookieStore = await cookies();
  return cookieStore.get('userId')?.value;
}

// POST: Add, change, or remove a comment reaction
export async function POST(request: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { commentId, reactionType = 'like' } = await request.json();
    if (!commentId) return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });

    const currentUserId = Number(userId);

    const existingReaction = await sql`
      SELECT id, reaction_type FROM comment_reactions 
      WHERE comment_id = ${commentId} AND user_id = ${currentUserId}
    `;

    if (existingReaction.length > 0) {
      if (existingReaction[0].reaction_type === reactionType) {
        // Tapping same reaction removes it
        await sql`
          DELETE FROM comment_reactions 
          WHERE comment_id = ${commentId} AND user_id = ${currentUserId}
        `;
        return NextResponse.json({ action: 'removed' }, { status: 200 });
      } else {
        // Update to new reaction type
        await sql`
          UPDATE comment_reactions 
          SET reaction_type = ${reactionType}
          WHERE comment_id = ${commentId} AND user_id = ${currentUserId}
        `;
        return NextResponse.json({ action: 'updated', reactionType }, { status: 200 });
      }
    } else {
      // Add new reaction
      await sql`
        INSERT INTO comment_reactions (comment_id, user_id, reaction_type) 
        VALUES (${commentId}, ${currentUserId}, ${reactionType})
      `;
      return NextResponse.json({ action: 'added', reactionType }, { status: 201 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process reaction' }, { status: 500 });
  }
}
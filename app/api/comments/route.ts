import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import sql from '@/lib/db';

async function getAuthUserId() {
  const cookieStore = await cookies();
  return cookieStore.get('userId')?.value;
}

// GET: Fetch all comments with author names
export async function GET() {
  try {
    const comments = await sql`
      SELECT 
        comments.id, 
        comments.post_id, 
        comments.user_id, 
        comments.content, 
        comments.created_at, 
        users.name as author_name
      FROM comments
      JOIN users ON comments.user_id = users.id
      ORDER BY comments.created_at ASC
    `;
    return NextResponse.json(comments, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

// POST: Add a new comment to a post
export async function POST(request: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { postId, content } = await request.json();
    if (!postId || !content) {
      return NextResponse.json({ error: 'Post ID and content required' }, { status: 400 });
    }

    await sql`
      INSERT INTO comments (post_id, user_id, content) 
      VALUES (${postId}, ${Number(userId)}, ${content})
    `;
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}

// PUT: Edit comment (STRICT: Comment Owner Only)
export async function PUT(request: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id, content } = await request.json();

    const result = await sql`
      UPDATE comments 
      SET content = ${content} 
      WHERE id = ${id} AND user_id = ${Number(userId)}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Unauthorized or comment not found' }, { status: 403 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 });
  }
}

// DELETE: Remove comment (ALLOWS: Comment Owner OR Post Owner)
export async function DELETE(request: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const result = await sql`
      DELETE FROM comments 
      WHERE id = ${id} 
      AND (
        user_id = ${Number(userId)} 
        OR post_id IN (SELECT id FROM posts WHERE user_id = ${Number(userId)})
      )
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Unauthorized or comment not found' }, { status: 403 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}
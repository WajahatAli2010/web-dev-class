import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import sql from '@/lib/db';

async function getAuthUserId() {
  const cookieStore = await cookies();
  return cookieStore.get('userId')?.value;
}

// GET: Fetch posts with visibility logic, total like count, and user liked status
export async function GET() {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const currentUserId = Number(userId);

    const posts = await sql`
      SELECT 
        posts.id, 
        posts.title, 
        posts.content, 
        posts.user_id, 
        posts.visibility,
        posts.created_at, 
        users.name as author_name,
        COUNT(DISTINCT likes.id)::int as like_count,
        EXISTS(
          SELECT 1 FROM likes 
          WHERE likes.post_id = posts.id AND likes.user_id = ${currentUserId}
        ) as has_liked
      FROM posts 
      JOIN users ON posts.user_id = users.id 
      LEFT JOIN likes ON posts.id = likes.post_id
      WHERE 
        posts.user_id = ${currentUserId}
        OR posts.visibility = 'everyone'
        OR (
          posts.visibility = 'friends' 
          AND EXISTS (
            SELECT 1 FROM friendships 
            WHERE status = 'accepted' 
            AND (
              (sender_id = ${currentUserId} AND receiver_id = posts.user_id)
              OR (receiver_id = ${currentUserId} AND sender_id = posts.user_id)
            )
          )
        )
      GROUP BY posts.id, users.name
      ORDER BY posts.created_at DESC
    `;

    return NextResponse.json(posts, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

// POST: Create a post with visibility setting
export async function POST(request: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { title, content, visibility } = await request.json();
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    await sql`
      INSERT INTO posts (title, content, user_id, visibility) 
      VALUES (${title}, ${content}, ${Number(userId)}, ${visibility || 'everyone'})
    `;
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}

// PUT: Edit post details and visibility (Owner Only)
export async function PUT(request: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id, title, content, visibility } = await request.json();

    const result = await sql`
      UPDATE posts 
      SET title = ${title}, content = ${content}, visibility = ${visibility || 'everyone'}
      WHERE id = ${id} AND user_id = ${Number(userId)}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Post not found or unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

// DELETE: Remove post (Owner Only)
export async function DELETE(request: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const result = await sql`
      DELETE FROM posts 
      WHERE id = ${id} AND user_id = ${Number(userId)}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Post not found or unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
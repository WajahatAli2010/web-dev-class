import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import sql from '@/lib/db';

async function getAuthUserId() {
  const cookieStore = await cookies();
  return cookieStore.get('userId')?.value;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const currentUserId = Number(userId);
    const { username } = await params;

    // 1. Fetch user info
    const targetUsers = await sql`
      SELECT id, name, username, bio, avatar_url, created_at 
      FROM users 
      WHERE username = ${username}
    `;

    if (targetUsers.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const targetUser = targetUsers[0];
    const isSelf = targetUser.id === currentUserId;

    // 2. Fetch stats
    const postCountRes = await sql`
      SELECT COUNT(*)::int as count FROM posts WHERE user_id = ${targetUser.id}
    `;
    
    const friendCountRes = await sql`
      SELECT COUNT(*)::int as count FROM friendships 
      WHERE status = 'accepted' 
      AND (sender_id = ${targetUser.id} OR receiver_id = ${targetUser.id})
    `;

    // 3. Friendship status check
    let friendshipStatus = 'none';
    let friendshipId: number | undefined = undefined;

    if (!isSelf) {
      const friendship = await sql`
        SELECT id, sender_id, receiver_id, status FROM friendships
        WHERE (sender_id = ${currentUserId} AND receiver_id = ${targetUser.id})
           OR (sender_id = ${targetUser.id} AND receiver_id = ${currentUserId})
      `;

      if (friendship.length > 0) {
        friendshipId = friendship[0].id;
        if (friendship[0].status === 'accepted') {
          friendshipStatus = 'accepted';
        } else if (friendship[0].sender_id === currentUserId) {
          friendshipStatus = 'pending_sent';
        } else {
          friendshipStatus = 'pending_received';
        }
      }
    }

    // 4. Fetch target user's visible posts
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
        (
          SELECT reaction_type FROM likes 
          WHERE likes.post_id = posts.id AND likes.user_id = ${currentUserId}
          LIMIT 1
        ) as user_reaction
      FROM posts 
      JOIN users ON posts.user_id = users.id 
      LEFT JOIN likes ON posts.id = likes.post_id
      WHERE posts.user_id = ${targetUser.id}
        AND (
          ${isSelf} = true
          OR posts.visibility = 'everyone'
          OR (posts.visibility = 'friends' AND ${friendshipStatus} = 'accepted')
        )
      GROUP BY posts.id, users.name
      ORDER BY posts.created_at DESC
    `;

    return NextResponse.json({
      profile: {
        user: targetUser,
        post_count: postCountRes[0].count,
        friend_count: friendCountRes[0].count,
        is_self: isSelf,
        friendship_status: friendshipStatus,
        friendship_id: friendshipId,
      },
      posts,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
  }
}
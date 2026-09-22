import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import sql from '@/lib/db';

async function getAuthUserId() {
  const cookieStore = await cookies();
  return cookieStore.get('userId')?.value;
}

// GET: Fetch all registered users with their friendship status relative to the logged-in user
export async function GET() {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const currentUserId = Number(userId);

    const usersWithFriendships = await sql`
      SELECT 
        u.id, 
        u.name, 
        u.username,
        f.id as friendship_id,
        f.sender_id,
        f.receiver_id,
        f.status as friendship_status
      FROM users u
      LEFT JOIN friendships f ON 
        (f.sender_id = ${currentUserId} AND f.receiver_id = u.id) OR 
        (f.receiver_id = ${currentUserId} AND f.sender_id = u.id)
      WHERE u.id != ${currentUserId}
      ORDER BY u.name ASC
    `;

    const formattedUsers = usersWithFriendships.map((row) => {
      let status: 'none' | 'pending_sent' | 'pending_received' | 'accepted' = 'none';

      if (row.friendship_id) {
        if (row.friendship_status === 'accepted') {
          status = 'accepted';
        } else if (row.friendship_status === 'pending') {
          status = row.sender_id === currentUserId ? 'pending_sent' : 'pending_received';
        }
      }

      return {
        id: row.id,
        name: row.name,
        username: row.username,
        friendshipId: row.friendship_id || undefined,
        status,
      };
    });

    return NextResponse.json(formattedUsers, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users and friendships' }, { status: 500 });
  }
}

// POST: Send a friend request
export async function POST(request: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { receiverId } = await request.json();

    await sql`
      INSERT INTO friendships (sender_id, receiver_id, status)
      VALUES (${Number(userId)}, ${Number(receiverId)}, 'pending')
    `;

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send friend request' }, { status: 500 });
  }
}

// PUT: Accept a friend request
export async function PUT(request: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { friendshipId } = await request.json();

    await sql`
      UPDATE friendships 
      SET status = 'accepted'
      WHERE id = ${Number(friendshipId)} AND receiver_id = ${Number(userId)}
    `;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to accept friend request' }, { status: 500 });
  }
}

// DELETE: Reject, cancel request, or unfriend
export async function DELETE(request: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const friendshipId = searchParams.get('id');

    await sql`
      DELETE FROM friendships
      WHERE id = ${Number(friendshipId)} 
      AND (sender_id = ${Number(userId)} OR receiver_id = ${Number(userId)})
    `;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove friendship' }, { status: 500 });
  }
}
import sql from '@/lib/db';

export async function createNotification({
  userId,
  actorId,
  type,
  entityId,
}: {
  userId: number;
  actorId: number;
  type: 'friend_request' | 'friend_accept' | 'like' | 'comment' | 'comment_like';
  entityId?: number;
}) {
  // Don't notify users of their own actions
  if (userId === actorId) return;

  await sql`
    INSERT INTO notifications (user_id, actor_id, type, entity_id)
    VALUES (${userId}, ${actorId}, ${type}, ${entityId || null})
  `;
}
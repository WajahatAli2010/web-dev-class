'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface NotificationItem {
  id: number;
  type: 'friend_request' | 'friend_accept' | 'like' | 'comment' | 'comment_like';
  entity_id: number | null;
  is_read: boolean;
  created_at: string;
  actor_name: string;
  actor_username: string;
  actor_avatar: string | null;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/notifications')
      .then((res) => res.json())
      .then((data) => {
        setNotifications(Array.isArray(data) ? data : []);
        setIsLoading(false);
      });

    // Mark unread notifications as read when page loads
    fetch('/api/notifications', { method: 'PATCH' });
  }, []);

  const getNotificationText = (item: NotificationItem) => {
    switch (item.type) {
      case 'friend_request':
        return 'sent you a friend request.';
      case 'friend_accept':
        return 'accepted your friend request.';
      case 'like':
        return 'reacted to your post.';
      case 'comment_like':
        return 'liked your comment.';
      case 'comment':
        return 'commented on your post.';
      default:
        return 'interacted with you.';
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <Link href="/dashboard" className="text-sm font-medium hover:underline">
          ← Back to Feed
        </Link>
        <h1 className="font-bold text-lg">Notifications</h1>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-sm">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 border rounded-2xl">
          <p className="font-semibold">No notifications yet</p>
          <p className="text-sm">When people interact with you, alerts will appear here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`p-4 border rounded-xl flex items-center justify-between transition ${
                !item.is_read ? 'font-semibold border-2' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border flex items-center justify-center font-bold text-sm">
                  {item.actor_avatar ? (
                    <img
                      src={item.actor_avatar}
                      alt={item.actor_name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    item.actor_name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="text-sm">
                  <Link
                    href={`/profile/${item.actor_username}`}
                    className="hover:underline font-bold"
                  >
                    {item.actor_name}
                  </Link>{' '}
                  <span>{getNotificationText(item)}</span>
                  <div className="text-xs opacity-60">
                    {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {!item.is_read && (
                <span className="w-2.5 h-2.5 rounded-full border border-current"></span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { User } from '../types';

interface Props {
  user: User;
  onLogout: () => void;
}

export default function DashboardHeader({ user, onLogout }: Props) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetch('/api/notifications')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setUnreadCount(data.filter((n) => !n.is_read).length);
        }
      });
  }, []);

  return (
    <header className="flex justify-between items-center mb-6 border rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="text-xl font-extrabold">
          SocialApp
        </Link>
        <Link href="/explore" className="text-sm font-semibold hover:underline flex items-center gap-1">
          🔍 Explore
        </Link>
        <Link href="/bookmarks" className="text-sm font-semibold hover:underline flex items-center gap-1">
          🔖 Saved
        </Link>
        <Link
          href="/notifications"
          className="text-sm font-semibold hover:underline flex items-center gap-1 relative"
        >
          🔔 Notifications
          {unreadCount > 0 && (
            <span className="text-xs border px-1.5 py-0.5 rounded-full font-bold">
              {unreadCount}
            </span>
          )}
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href={`/profile/${user.username}`}
          className="flex items-center gap-2 transition"
        >
          <div className="w-8 h-8 rounded-full border flex items-center justify-center font-bold text-sm overflow-hidden">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </div>
          <span className="font-semibold text-sm hidden sm:inline">{user.name}</span>
        </Link>

        <button
          onClick={onLogout}
          className="text-xs border px-3 py-1.5 rounded-lg font-medium transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
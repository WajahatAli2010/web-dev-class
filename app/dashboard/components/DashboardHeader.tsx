import Link from 'next/link';
import { User } from '../types';

interface Props {
  user: User;
  onLogout: () => void;
}

export default function DashboardHeader({ user, onLogout }: Props) {
  return (
    <header className="flex justify-between items-center mb-6 bg-white p-4 border rounded-xl shadow-sm">
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="text-xl font-extrabold text-blue-600">
          SocialApp
        </Link>
        <Link
          href="/explore"
          className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition flex items-center gap-1"
        >
          🔍 Explore
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href={`/profile/${user.username}`}
          className="flex items-center gap-2 hover:opacity-80 transition"
        >
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-sm overflow-hidden">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </div>
          <span className="font-semibold text-sm text-gray-800 hidden sm:inline">
            {user.name}
          </span>
        </Link>

        <button
          onClick={onLogout}
          className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 transition font-medium"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
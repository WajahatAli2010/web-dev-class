'use client';

import { User } from '../types';

interface Props {
  user: User;
  onLogout: () => void;
}

export default function DashboardHeader({ user, onLogout }: Props) {
  return (
    <div className="flex justify-between items-center mb-6 pb-4 border-b">
      <div>
        <h1 className="text-2xl font-bold">Community Feed</h1>
        <p className="text-sm text-gray-500">Logged in as: {user.name}</p>
      </div>
      <button 
        onClick={onLogout}
        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded text-sm"
      >
        Logout
      </button>
    </div>
  );
}
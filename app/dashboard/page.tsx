'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  name: string;
  username: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // Check active session via cookies
    fetch('/api/me')
      .then((res) => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then((data) => setCurrentUser(data.user))
      .catch(() => router.push('/'));
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/');
  };

  if (!currentUser) return <p className="text-center mt-10">Loading session...</p>;

  return (
    <div className="max-w-xl mx-auto p-6 border rounded mt-10 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Welcome, {currentUser.name}!</h2>
        <button 
          onClick={handleLogout}
          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
        >
          Logout
        </button>
      </div>
      <p className="text-gray-600">Username: @{currentUser.username}</p>
      <p className="text-gray-600">User ID: {currentUser.id}</p>
    </div>
  );
}
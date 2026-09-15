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
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/');
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  if (!user) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</p>;

  return (
    <div className="p-6">

        <button 
          onClick={handleLogout}
         className="bg-red-500 text-white px-4 py-2 "
        >
          Logout
        </button>

      <div >
        <h3>Welcome back, {user.name}! 👋</h3>
        <p>Username: @{user.username}</p>
        <p>User ID: {user.id}</p>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    const endpoint = isRegister ? '/api/register' : '/api/login';
    const body = isRegister 
      ? { name, username, password } 
      : { username, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        if (isRegister) {
          setMessage('Registered successfully! Please log in.');
          setIsRegister(false);
        } else {
          // The HttpOnly cookie is set automatically by the server response headers
          router.push('/dashboard');
          router.refresh(); // Refresh router state so middleware picks up the new cookie
        }
        setName('');
        setUsername('');
        setPassword('');
      } else {
        setMessage(data.error || 'Something went wrong');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">{isRegister ? 'Register' : 'Login'}</h2>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {isRegister && (
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Full Name" 
            required 
            className="p-2 border rounded"
          />
        )}

        <input 
          type="text" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          placeholder="Username" 
          required 
          className="p-2 border rounded"
        />

        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Password" 
          required 
          className="p-2 border rounded"
        />

        <button 
          type="submit" 
          disabled={loading}
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
        >
          {loading ? 'Please wait...' : (isRegister ? 'Register' : 'Login')}
        </button>
      </form>

      {message && (
        <p className={`mt-4 ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}

      <hr className="my-6 border-gray-300" />

      <div className="text-center">
        <button 
          type="button" 
          onClick={() => {
            setIsRegister(!isRegister);
            setMessage('');
          }}
          className="p-2 border rounded text-sm hover:bg-gray-50 transition-colors"
        >
          {isRegister ? 'Switch to Login' : 'Register Here'}
        </button>
      </div>
    </div>
  );
}
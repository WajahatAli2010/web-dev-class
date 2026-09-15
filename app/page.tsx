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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

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
          // Save user info locally and navigate to Dashboard
          localStorage.setItem('user', JSON.stringify(data.user));
          router.push('/dashboard');
        }
        setName('');
        setUsername('');
        setPassword('');
      } else {
        setMessage(data.error || 'Something went wrong');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border">
      <h2>{isRegister ? 'Register' : 'Login'}</h2>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {isRegister && (
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Full Name" 
            required 
            className="p-2 border "

          />
        )}

        <input 
          type="text" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          placeholder="Username" 
          required 
          className="p-2 border "
        />

        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Password" 
          required 
          className="p-2 border "
        />

        <button 
          type="submit" 
          className="bg-blue-500 text-white p-2 "
        >
          {isRegister ? 'Register' : 'Login'}
        </button>
      </form>

      {message && <p style={{ marginTop: '16px', color: message.includes('success') ? 'green' : 'red' }}>{message}</p>}

      <hr className="border-0 border-t border-gray-300 margin-20px-0 my-10" />

      <div className="text-center">
 
        <button 
          type="button" 
          onClick={() => {
            setIsRegister(!isRegister);
            setMessage('');
          }}
          className="p-2 border "
        >
          {isRegister ? 'Switch to Login' : 'Register Here'}
        </button>
      </div>
    </div>
  );
}
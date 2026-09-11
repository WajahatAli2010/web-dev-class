'use client';

import { useState, useEffect } from 'react';

interface Message {
  id: number;
  name: string;
}

export default function Page() {
  const [name, setName] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  // Function to fetch all messages (GET)
  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/message');
      const data = await res.json();
      if (Array.isArray(data)) setMessages(data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  // Load messages on component mount
  useEffect(() => {
    fetchMessages();
  }, []);

  // Handle form submit (POST)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const res = await fetch('/api/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });

    if (res.ok) {
      setName('');
      fetchMessages();
    }
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/message?id=${id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      fetchMessages();
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="Enter name..." 
          required 
        />
        <button type="submit">Save</button>
      </form>

      <hr style={{ margin: '20px 0' }} />

      <h3>Saved Names</h3>
      <ul>
        {messages.map((item) => (
          <li key={item.id} style={{ marginBottom: '8px' }}>
            <span>{item.name}</span>{' '}
            <button onClick={() => handleDelete(item.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

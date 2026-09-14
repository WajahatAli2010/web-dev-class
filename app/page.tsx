'use client';

import { useState, useEffect } from 'react';

interface Message {
  id: number;
  name: string;
  username: string;
}

export default function Page() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/message');
      const data = await res.json();
      if (Array.isArray(data)) setMessages(data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !username) return;

    const res = await fetch('/api/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, username }),
    });

    if (res.ok) {
      setName('');
      setUsername('');
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

  const handleStartEdit = (item: Message) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditUsername(item.username);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditUsername('');
  };

  const handleUpdatePut = async (id: number) => {
    const res = await fetch('/api/message', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name: editName, username: editUsername }),
    });

    if (res.ok) {
      setEditingId(null);
      fetchMessages();
    }
  };

  const handleUpdatePatch = async (id: number) => {
    const res = await fetch('/api/message', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name: editName, username: editUsername }),
    });

    if (res.ok) {
      setEditingId(null);
      fetchMessages();
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '30px auto', fontFamily: 'sans-serif', padding: '0 16px' }}>
      <h2>User Management</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <input 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="Name..." 
          required 
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', flex: 1 }}
        />
        <input 
          type="text" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          placeholder="Username..." 
          required 
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', flex: 1 }}
        />
        <button type="submit" style={{ padding: '8px 16px', cursor: 'pointer' }}>Save</button>
      </form>

      <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '20px 0' }} />

      <h3>Saved Users</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {messages.map((item) => (
          <li 
            key={item.id} 
            style={{ 
              marginBottom: '10px', 
              padding: '12px', 
              border: '1px solid #e2e8f0', 
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px'
            }}
          >
            {editingId === item.id ? (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', width: '100%' }}>
                <input 
                  type="text" 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)} 
                  style={{ padding: '4px 8px', flex: 1 }}
                />
                <input 
                  type="text" 
                  value={editUsername} 
                  onChange={(e) => setEditUsername(e.target.value)} 
                  style={{ padding: '4px 8px', flex: 1 }}
                />
                <button onClick={() => handleUpdatePut(item.id)}>PUT</button>
                <button onClick={() => handleUpdatePatch(item.id)}>PATCH</button>
                <button onClick={handleCancelEdit}>Cancel</button>
              </div>
            ) : (
              <>
                <div>
                  <strong>{item.name}</strong> <span style={{ color: '#666' }}>(@{item.username})</span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => handleStartEdit(item)}>Edit</button>
                  <button onClick={() => handleDelete(item.id)}>Delete</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
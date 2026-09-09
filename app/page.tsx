'use client';
import { useState } from 'react';

export default function Page() {
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!name) return;

    await fetch('/api/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),

    });

    setName('');
    alert('Saved!');
  }

  return (
    <form onSubmit={handleSubmit} >
      <input 
        type="text" 
        value={name} 
        onChange={(e) => setName(e.target.value)} 
        placeholder="Enter name..." 
        required 
      />
      <button type="submit">Save</button>
    </form>
  );
}
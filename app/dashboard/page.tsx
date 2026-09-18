'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  name: string;
  username: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  user_id: number;
  author_name: string;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingPostId, setEditingPostId] = useState<number | null>(null);

  // Fetch session user and posts list
  const loadData = async () => {
    try {
      const userRes = await fetch('/api/me');
      if (!userRes.ok) throw new Error();
      const userData = await userRes.json();
      setCurrentUser(userData.user);

      const postsRes = await fetch('/api/posts');
      const postsData = await postsRes.json();
      if (Array.isArray(postsData)) setPosts(postsData);
    } catch {
      router.push('/');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    if (editingPostId) {
      // EDIT existing post
      await fetch('/api/posts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingPostId, title, content }),
      });
      setEditingPostId(null);
    } else {
      // CREATE new post
      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });
    }

    setTitle('');
    setContent('');
    loadData();
  };

  const handleStartEdit = (post: Post) => {
    setEditingPostId(post.id);
    setTitle(post.title);
    setContent(post.content);
  };

  const handleDeletePost = async (id: number) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    await fetch(`/api/posts?id=${id}`, { method: 'DELETE' });
    loadData();
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/');
  };

  if (!currentUser) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <div>
          <h1 className="text-2xl font-bold">Community Feed</h1>
          <p className="text-sm text-gray-500">Welcome, {currentUser.name}</p>
        </div>
        <button 
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded text-sm"
        >
          Logout
        </button>
      </div>

      {/* Create / Edit Form */}
      <form onSubmit={handleSavePost} className="p-4 rounded-lg border mb-8 flex flex-col gap-3">
        <h2 className="font-semibold">{editingPostId ? 'Edit Post' : 'Create a Post'}</h2>
        <input 
          type="text" 
          placeholder="Title" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          required 
          className="p-2 border rounded"
        />
        <textarea 
          placeholder="What's on your mind?" 
          value={content} 
          onChange={(e) => setContent(e.target.value)} 
          required 
          rows={3} 
          className="p-2 border rounded resize-none"
        />
        <div className="flex gap-2">
          <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm">
            {editingPostId ? 'Update Post' : 'Publish Post'}
          </button>
          {editingPostId && (
            <button 
              type="button" 
              onClick={() => { setEditingPostId(null); setTitle(''); setContent(''); }}
              className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded text-sm"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map((post) => {
          const isOwner = post.user_id === currentUser.id;
          return (
            <div key={post.id} className="p-4 border rounded-lg shadow-sm ">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-lg">{post.title}</h3>
                  <span className="text-xs text-gray-500">By {post.author_name}</span>
                </div>

                {/* Conditional rendering for Post Owners */}
                {isOwner && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleStartEdit(post)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeletePost(post.id)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
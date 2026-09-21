'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Post, Comment } from './types';
import DashboardHeader from './components/DashboardHeader';
import PostForm from './components/PostForm';
import PostItem from './components/PostItem';

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingPostId, setEditingPostId] = useState<number | null>(null);

  const loadData = async () => {
    try {
      const userRes = await fetch('/api/me');
      if (!userRes.ok) throw new Error();
      const userData = await userRes.json();
      setCurrentUser(userData.user);

      const [postsRes, commentsRes] = await Promise.all([
        fetch('/api/posts'),
        fetch('/api/comments'),
      ]);

      setPosts(await postsRes.json());
      setComments(await commentsRes.json());
    } catch {
      router.push('/');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Post Actions
  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    if (editingPostId) {
      await fetch('/api/posts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingPostId, title, content }),
      });
      setEditingPostId(null);
    } else {
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

  const handleDeletePost = async (id: number) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    await fetch(`/api/posts?id=${id}`, { method: 'DELETE' });
    loadData();
  };

  // Comment Actions
  const handleAddComment = async (postId: number, contentText: string) => {
    await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, content: contentText }),
    });
    loadData();
  };

  const handleUpdateComment = async (commentId: number, contentText: string) => {
    await fetch('/api/comments', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: commentId, content: contentText }),
    });
    loadData();
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('Delete this comment?')) return;
    await fetch(`/api/comments?id=${commentId}`, { method: 'DELETE' });
    loadData();
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/');
  };

  if (!currentUser) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <DashboardHeader user={currentUser} onLogout={handleLogout} />

      <PostForm 
        title={title}
        content={content}
        isEditing={Boolean(editingPostId)}
        setTitle={setTitle}
        setContent={setContent}
        onSubmit={handleSavePost}
        onCancel={() => { setEditingPostId(null); setTitle(''); setContent(''); }}
      />

      <div className="space-y-6">
        {posts.map((post) => (
          <PostItem 
            key={post.id}
            post={post}
            currentUserId={currentUser.id}
            comments={comments.filter((c) => c.post_id === post.id)}
            onStartEdit={(p) => {
              setEditingPostId(p.id);
              setTitle(p.title);
              setContent(p.content);
            }}
            onDeletePost={handleDeletePost}
            onAddComment={handleAddComment}
            onUpdateComment={handleUpdateComment}
            onDeleteComment={handleDeleteComment}
          />
        ))}
      </div>
    </div>
  );
}
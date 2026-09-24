'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Post, Comment, UserWithFriendStatus, PostVisibility, ReactionType } from './types';
import DashboardHeader from './components/DashboardHeader';
import PostForm from './components/PostForm';
import PostItem from './components/PostItem';
import FriendsSidebar from './components/FriendsSidebar';

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [users, setUsers] = useState<UserWithFriendStatus[]>([]);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<PostVisibility>('everyone');
  const [editingPostId, setEditingPostId] = useState<number | null>(null);

  const loadData = async () => {
    try {
      const userRes = await fetch('/api/me');
      if (!userRes.ok) throw new Error();
      const userData = await userRes.json();
      setCurrentUser(userData.user);

      const [postsRes, commentsRes, friendsRes] = await Promise.all([
        fetch('/api/posts'),
        fetch('/api/comments'),
        fetch('/api/friends'),
      ]);

      setPosts(await postsRes.json());
      setComments(await commentsRes.json());
      setUsers(await friendsRes.json());
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
      await fetch('/api/posts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingPostId, title, content, visibility }),
      });
      setEditingPostId(null);
    } else {
      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, visibility }),
      });
    }

    setTitle('');
    setContent('');
    setVisibility('everyone');
    loadData();
  };

  const handleDeletePost = async (id: number) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    await fetch(`/api/posts?id=${id}`, { method: 'DELETE' });
    loadData();
  };

  // Toggle Reaction Handler
  const handleToggleReaction = async (postId: number, reactionType: ReactionType) => {
    await fetch('/api/likes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, reactionType }),
    });
    loadData();
  };

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

  const handleSendFriendRequest = async (receiverId: number) => {
    await fetch('/api/friends', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiverId }),
    });
    loadData();
  };

  const handleAcceptFriendRequest = async (friendshipId: number) => {
    await fetch('/api/friends', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ friendshipId }),
    });
    loadData();
  };

  const handleRemoveFriendship = async (friendshipId: number) => {
    await fetch(`/api/friends?id=${friendshipId}`, { method: 'DELETE' });
    loadData();
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/');
  };

  if (!currentUser) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <DashboardHeader user={currentUser} onLogout={handleLogout} />

      <div className="flex flex-col lg:flex-row gap-6">
        <FriendsSidebar
          users={users}
          onSendRequest={handleSendFriendRequest}
          onAcceptRequest={handleAcceptFriendRequest}
          onRemoveFriendship={handleRemoveFriendship}
        />

        <main className="flex-1">
          <PostForm
            title={title}
            content={content}
            visibility={visibility}
            isEditing={Boolean(editingPostId)}
            setTitle={setTitle}
            setContent={setContent}
            setVisibility={setVisibility}
            onSubmit={handleSavePost}
            onCancel={() => {
              setEditingPostId(null);
              setTitle('');
              setContent('');
              setVisibility('everyone');
            }}
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
                  setVisibility(p.visibility || 'everyone');
                }}
                onDeletePost={handleDeletePost}
                onToggleReaction={handleToggleReaction}
                onAddComment={handleAddComment}
                onUpdateComment={handleUpdateComment}
                onDeleteComment={handleDeleteComment}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
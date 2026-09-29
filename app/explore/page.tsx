'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserWithFriendStatus, Post, Comment, ReactionType } from '@/app/dashboard/types';
import PostItem from '@/app/dashboard/components/PostItem';

export default function ExplorePage() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<UserWithFriendStatus[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'users' | 'posts'>('all');

  useEffect(() => {
    fetch('/api/me')
      .then((res) => res.json())
      .then((data) => setCurrentUserId(data.user?.id));

    fetch('/api/comments')
      .then((res) => res.json())
      .then((data) => setComments(data));
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setUsers([]);
      setPosts([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/explore?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setUsers(data.users);
          setPosts(data.posts);
        }
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSendRequest = async (receiverId: number) => {
    await fetch('/api/friends', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'send', receiverId }),
    });
    // Refresh search results
    const res = await fetch(`/api/explore?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    setUsers(data.users);
  };

  const handleToggleReaction = async (postId: number, reactionType: ReactionType) => {
    await fetch('/api/likes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, reactionType }),
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <Link href="/dashboard" className="text-sm font-medium hover:underline">
          ← Back to Feed
        </Link>
        <h1 className="font-bold text-lg">Explore & Search</h1>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search for people, posts, topics..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full border-2 rounded-2xl px-4 py-3 pl-11 text-sm focus:outline-none focus:border shadow-sm"
        />
        <span className="absolute left-4 top-3.5">🔍</span>
        {isSearching && (
          <span className="absolute right-4 top-3.5 text-xs">Searching...</span>
        )}
      </div>

      {/* Tab Filter */}
      {query.trim() && (
        <div className="flex gap-2 border-b text-sm font-medium">
          {(['all', 'users', 'posts'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 px-3 capitalize transition border-b-2 ${
                activeTab === tab
                  ? 'border-b-2 font-semibold'
                  : 'border-transparent'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!query.trim() && (
        <div className="text-center py-16 rounded-2xl border">
          <p className="text-lg font-semibold">Find anything on SocialApp</p>
          <p className="text-sm">Type a name, username, or post keyword in the search bar above.</p>
        </div>
      )}

      {/* People Results */}
      {(activeTab === 'all' || activeTab === 'users') && users.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-bold text-base">People</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="border rounded-xl p-4 flex items-center justify-between shadow-sm"
              >
                <Link href={`/profile/${user.username}`} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border font-bold flex items-center justify-center text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm hover:underline">
                      {user.name}
                    </h3>
                    <p className="text-xs">@{user.username}</p>
                  </div>
                </Link>

                {user.status === 'none' && (
                  <button
                    onClick={() => handleSendRequest(user.id)}
                    className="px-3 py-1.5 border rounded-lg text-xs font-medium transition"
                  >
                    + Add
                  </button>
                )}
                {user.status === 'pending_sent' && (
                  <span className="text-xs border px-2.5 py-1 rounded-md">
                    Sent
                  </span>
                )}
                {user.status === 'accepted' && (
                  <span className="text-xs font-medium border px-2.5 py-1 rounded-md">
                    Friends
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Posts Results */}
      {(activeTab === 'all' || activeTab === 'posts') && posts.length > 0 && currentUserId && (
        <div className="space-y-4">
          <h2 className="font-bold text-base">Posts</h2>
          {posts.map((post) => (
            <PostItem
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              comments={comments.filter((c) => c.post_id === post.id)}
              onStartEdit={() => {}}
              onDeletePost={() => {}}
              onToggleReaction={handleToggleReaction}
              onAddComment={async () => {}}
              onUpdateComment={async () => {}}
              onDeleteComment={async () => {}}
            />
          ))}
        </div>
      )}

      {/* No Results Found */}
      {query.trim() && !isSearching && users.length === 0 && posts.length === 0 && (
        <div className="text-center py-12 border rounded-xl">
          No matches found for &quot;{query}&quot;.
        </div>
      )}
    </div>
  );
}
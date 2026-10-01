'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Post, Comment, ReactionType } from '@/app/dashboard/types';
import PostItem from '@/app/dashboard/components/PostItem';

export default function BookmarksPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/me')
      .then((res) => res.json())
      .then((data) => setCurrentUserId(data.user?.id));

    fetch('/api/comments')
      .then((res) => res.json())
      .then((data) => setComments(data));

    fetch('/api/bookmarks')
      .then((res) => res.json())
      .then((data) => {
        setPosts(Array.isArray(data) ? data : []);
        setIsLoading(false);
      });
  }, []);

  const handleToggleReaction = async (postId: number, reactionType: ReactionType) => {
    await fetch('/api/likes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, reactionType }),
    });
  };

  const handleRemoveBookmark = async (postId: number) => {
    await fetch('/api/bookmarks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId }),
    });
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <Link href="/dashboard" className="text-sm font-medium hover:underline">
          ← Back to Feed
        </Link>
        <h1 className="font-bold text-lg">Saved Posts</h1>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-sm">Loading saved posts...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 border rounded-2xl">
          <p className="font-semibold">No saved posts yet</p>
          <p className="text-sm">Click the bookmark button on any post to save it for later.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentUserId &&
            posts.map((post) => (
              <div key={post.id} className="relative">
                <PostItem
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
                <button
                  onClick={() => handleRemoveBookmark(post.id)}
                  className="absolute top-4 right-4 border px-2.5 py-1 rounded-lg text-xs font-medium"
                >
                  Unsave
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProfileData, Post, Comment, ReactionType } from '@/app/dashboard/types';
import PostItem from '@/app/dashboard/components/PostItem';
import EditProfileModal from '@/app/dashboard/components/EditProfileModal';

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const router = useRouter();

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    try {
      const [meRes, profileRes, commentsRes] = await Promise.all([
        fetch('/api/me'),
        fetch(`/api/profile/${username}`),
        fetch('/api/comments'),
      ]);

      if (!profileRes.ok) {
        router.push('/dashboard');
        return;
      }

      const meData = await meRes.json();
      const pData = await profileRes.json();

      setCurrentUserId(meData.user.id);
      setProfileData(pData.profile);
      setPosts(pData.posts);
      setComments(await commentsRes.json());
    } catch {
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [username]);

  const handleToggleReaction = async (postId: number, reactionType: ReactionType) => {
    await fetch('/api/likes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, reactionType }),
    });
    loadProfile();
  };

  const handleAddComment = async (postId: number, content: string) => {
    await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, content }),
    });
    loadProfile();
  };

  const handleUpdateComment = async (commentId: number, content: string) => {
    await fetch('/api/comments', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: commentId, content }),
    });
    loadProfile();
  };

  const handleDeleteComment = async (commentId: number) => {
    await fetch(`/api/comments?id=${commentId}`, { method: 'DELETE' });
    loadProfile();
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm('Delete this post?')) return;
    await fetch(`/api/posts?id=${postId}`, { method: 'DELETE' });
    loadProfile();
  };

  if (loading) return <div className="text-center mt-20 text-gray-500">Loading profile...</div>;
  if (!profileData || !currentUserId) return null;

  const { user, post_count, friend_count, is_self, friendship_status } = profileData;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between border-b pb-4">
        <Link href="/dashboard" className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1">
          ← Back to Feed
        </Link>
        <h1 className="font-bold text-gray-800 text-lg">Profile</h1>
      </div>

      {/* Profile Header Card */}
      <div className="border rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-3xl font-bold text-blue-600 overflow-hidden border-2 border-blue-200 shrink-0">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </div>

          {/* User Information */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <p className="text-sm ">@{user.username}</p>
              </div>

              {/* Actions */}
              {is_self ? (
                <button
                  onClick={() => setIsEditOpen(true)}
                  className="px-4 py-2 border rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
                >
                  Edit Profile
                </button>
              ) : (
                <span className="text-xs px-3 py-1.5 rounded-full  font-medium text-gray-600 self-center sm:self-auto">
                  {friendship_status === 'accepted' && '👥 Friends'}
                  {friendship_status === 'pending_sent' && '⏳ Request Sent'}
                  {friendship_status === 'pending_received' && '📩 Request Received'}
                  {friendship_status === 'none' && '👤 Not Friends'}
                </span>
              )}
            </div>

            {/* Bio */}
            <p className=" text-sm whitespace-pre-line pt-1">
              {user.bio || 'No bio provided yet.'}
            </p>

            {/* Stats */}
            <div className="flex justify-center sm:justify-start gap-6 text-xs text-gray-600 font-medium pt-3 border-t">
              <span><strong>{post_count}</strong> Posts</span>
              <span><strong>{friend_count}</strong> Friends</span>
            </div>
          </div>
        </div>
      </div>

      {/* User Posts Timeline */}
      <div className="space-y-4">
        <h3 className="font-bold text-gray-800 text-lg">Posts</h3>
        {posts.length === 0 ? (
          <div className="p-8 border rounded-xl text-center text-gray-500 bg-white">
            No posts to display.
          </div>
        ) : (
          posts.map((post) => (
            <PostItem
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              comments={comments.filter((c) => c.post_id === post.id)}
              onStartEdit={() => {}}
              onDeletePost={handleDeletePost}
              onToggleReaction={handleToggleReaction}
              onAddComment={handleAddComment}
              onUpdateComment={handleUpdateComment}
              onDeleteComment={handleDeleteComment}
            />
          ))
        )}
      </div>

      {/* Edit Profile Modal */}
      {is_self && (
        <EditProfileModal
          isOpen={isEditOpen}
          user={user}
          onClose={() => setIsEditOpen(false)}
          onSave={loadProfile}
        />
      )}
    </div>
  );
}
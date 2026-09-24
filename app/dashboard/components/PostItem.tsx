'use client';

import { useState } from 'react';
import { Post, Comment, ReactionUser, PostVisibility, ReactionType, REACTION_EMOJIS } from '../types';
import CommentSection from './CommentSection';
import LikesModal from './LikesModal';

interface Props {
  post: Post;
  currentUserId: number;
  comments: Comment[];
  onStartEdit: (post: Post) => void;
  onDeletePost: (postId: number) => void;
  onToggleReaction: (postId: number, reactionType: ReactionType) => void;
  onAddComment: (postId: number, content: string) => void;
  onUpdateComment: (commentId: number, content: string) => void;
  onDeleteComment: (commentId: number) => void;
}

const visibilityLabels: Record<PostVisibility, string> = {
  everyone: '🌐 Everyone',
  friends: '👥 Friends',
  no_one: '🔒 Only Me',
};

const reactionKeys: ReactionType[] = ['like', 'love', 'haha', 'wow', 'sad', 'angry'];

export default function PostItem({
  post,
  currentUserId,
  comments,
  onStartEdit,
  onDeletePost,
  onToggleReaction,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
}: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const [isLikesModalOpen, setIsLikesModalOpen] = useState(false);
  const [likers, setLikers] = useState<ReactionUser[]>([]);
  const [isLoadingLikers, setIsLoadingLikers] = useState(false);

  const isPostOwner = post.user_id === currentUserId;
  const currentReaction = post.user_reaction ? REACTION_EMOJIS[post.user_reaction] : null;

  const handleOpenLikesModal = async () => {
    if (post.like_count === 0) return;
    setIsLikesModalOpen(true);
    setIsLoadingLikers(true);

    try {
      const res = await fetch(`/api/likes?postId=${post.id}`);
      if (res.ok) {
        setLikers(await res.json());
      }
    } catch {
      console.error('Failed to fetch reactions list');
    } finally {
      setIsLoadingLikers(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm ">
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-bold text-lg">{post.title}</h3>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>By {post.author_name}</span>
            <span>•</span>
            <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[11px]">
              {visibilityLabels[post.visibility || 'everyone']}
            </span>
          </div>
        </div>

        {isPostOwner && (
          <div className="flex gap-2">
            <button onClick={() => onStartEdit(post)} className="text-xs text-blue-600 hover:underline">
              Edit
            </button>
            <button onClick={() => onDeletePost(post.id)} className="text-xs text-red-600 hover:underline">
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Body */}
      <p className="text-gray-700 mb-4 whitespace-pre-wrap">{post.content}</p>

      {/* Reaction Bar */}
      <div className="flex items-center gap-3 mb-3 border-t pt-2 border-b pb-2 text-xs relative">
        <div
          className="relative"
          onMouseEnter={() => setShowPicker(true)}
          onMouseLeave={() => setShowPicker(false)}
        >
          {/* Reaction Picker Popover */}
          {showPicker && (
            <div className="absolute bottom-full left-0 mb-1 flex items-center gap-1 bg-white border shadow-lg rounded-full px-2 py-1 z-20 animate-in fade-in slide-in-from-bottom-2 duration-150">
              {reactionKeys.map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    onToggleReaction(post.id, key);
                    setShowPicker(false);
                  }}
                  title={REACTION_EMOJIS[key].label}
                  className="text-xl hover:scale-125 transition-transform duration-100 p-1"
                >
                  {REACTION_EMOJIS[key].emoji}
                </button>
              ))}
            </div>
          )}

          {/* Main Reaction Button */}
          <button
            onClick={() => onToggleReaction(post.id, post.user_reaction || 'like')}
            className={`flex items-center gap-1.5 font-medium px-2.5 py-1 rounded transition-colors ${
              currentReaction ? 'bg-gray-100' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="text-base">{currentReaction ? currentReaction.emoji : '👍'}</span>
            <span className={currentReaction ? currentReaction.color : ''}>
              {currentReaction ? currentReaction.label : 'Like'}
            </span>
          </button>
        </div>

        {/* Reaction Count Trigger */}
        {post.like_count > 0 && (
          <button
            onClick={handleOpenLikesModal}
            className="text-gray-500 hover:text-gray-800 hover:underline font-medium"
          >
            {post.like_count} {post.like_count === 1 ? 'reaction' : 'reactions'}
          </button>
        )}
      </div>

      {/* Embedded Comments */}
      <CommentSection
        postId={post.id}
        postOwnerId={post.user_id}
        comments={comments}
        currentUserId={currentUserId}
        onAddComment={onAddComment}
        onUpdateComment={onUpdateComment}
        onDeleteComment={onDeleteComment}
      />

      {/* Likes Modal */}
      <LikesModal
        isOpen={isLikesModalOpen}
        onClose={() => setIsLikesModalOpen(false)}
        likers={likers}
        isLoading={isLoadingLikers}
      />
    </div>
  );
}
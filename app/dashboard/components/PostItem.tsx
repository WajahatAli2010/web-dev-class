'use client';

import { Post, Comment, PostVisibility } from '../types';
import CommentSection from './CommentSection';

interface Props {
  post: Post;
  currentUserId: number;
  comments: Comment[];
  onStartEdit: (post: Post) => void;
  onDeletePost: (postId: number) => void;
  onAddComment: (postId: number, content: string) => void;
  onUpdateComment: (commentId: number, content: string) => void;
  onDeleteComment: (commentId: number) => void;
}

const visibilityLabels: Record<PostVisibility, string> = {
  everyone: '🌐 Everyone',
  friends: '👥 Friends',
  no_one: '🔒 Only Me',
};

export default function PostItem({
  post,
  currentUserId,
  comments,
  onStartEdit,
  onDeletePost,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
}: Props) {
  const isPostOwner = post.user_id === currentUserId;

  return (
    <div className="p-4 border rounded-lg shadow-sm ">
      {/* Post Header */}
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
    </div>
  );
}
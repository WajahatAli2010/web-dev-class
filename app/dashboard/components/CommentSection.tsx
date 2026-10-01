'use client';

import { useState } from 'react';
import { Comment } from '../types';

interface CommentSectionProps {
  postId: number;
  postOwnerId: number;
  comments: Comment[];
  currentUserId: number;
  onAddComment: (postId: number, content: string) => void;
  onUpdateComment: (commentId: number, content: string) => void;
  onDeleteComment: (commentId: number) => void;
}

export default function CommentSection({
  postId,
  postOwnerId,
  comments,
  currentUserId,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    onAddComment(postId, newComment.trim());
    setNewComment('');
  };

  const handleEditSubmit = (commentId: number, e: React.FormEvent) => {
    e.preventDefault();
    if (!editContent.trim()) return;
    onUpdateComment(commentId, editContent.trim());
    setEditingCommentId(null);
    setEditContent('');
  };

  return (
    <div className="space-y-3 pt-2">
      {/* Add Comment Form */}
      <form onSubmit={handleAddSubmit} className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 border px-3 py-1.5 rounded text-xs focus:outline-none focus:border-2"
        />
        <button
          type="submit"
          className="border px-3 py-1.5 rounded text-xs font-medium hover:border-2 transition"
        >
          Comment
        </button>
      </form>

      {/* Comment List */}
      {comments.length > 0 && (
        <div className="space-y-2 border-t pt-3">
          {comments.map((comment) => {
            const isCommentOwner = comment.user_id === currentUserId;
            const canDelete = isCommentOwner || currentUserId === postOwnerId;
            const isEditing = editingCommentId === comment.id;

            return (
              <div key={comment.id} className="border rounded p-2.5 text-xs space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">
                    {comment.author_name || `User #${comment.user_id}`}
                  </span>
                  <div className="flex gap-1.5">
                    {isCommentOwner && !isEditing && (
                      <button
                        onClick={() => {
                          setEditingCommentId(comment.id);
                          setEditContent(comment.content);
                        }}
                        className="border px-1.5 py-0.5 rounded text-[11px] font-medium"
                      >
                        Edit
                      </button>
                    )}
                    {canDelete && !isEditing && (
                      <button
                        onClick={() => onDeleteComment(comment.id)}
                        className="border px-1.5 py-0.5 rounded text-[11px] font-medium"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <form onSubmit={(e) => handleEditSubmit(comment.id, e)} className="flex gap-2 mt-1">
                    <input
                      type="text"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="flex-1 border px-2 py-1 rounded text-xs focus:outline-none focus:border-2"
                    />
                    <button
                      type="submit"
                      className="border px-2 py-1 rounded text-xs font-medium"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingCommentId(null)}
                      className="border px-2 py-1 rounded text-xs font-medium"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <p className="whitespace-pre-wrap">{comment.content}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
'use client';

import { useState } from 'react';
import { Comment } from '../types';

interface Props {
  comment: Comment;
  currentUserId: number;
  isPostOwner: boolean;
  onUpdate: (commentId: number, content: string) => void;
  onDelete: (commentId: number) => void;
}

export default function CommentItem({ comment, currentUserId, isPostOwner, onUpdate, onDelete }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);

  const isCommentOwner = comment.user_id === currentUserId;
  const canDelete = isCommentOwner || isPostOwner;

  const handleSave = () => {
    if (!editText.trim()) return;
    onUpdate(comment.id, editText);
    setIsEditing(false);
  };

  return (
    <div className="p-2 border rounded text-sm">
      <div className="flex justify-between items-center mb-1">
        <span className="font-semibold text-xs ">{comment.author_name}</span>
        <div className="flex gap-2 text-xs">
          {isCommentOwner && !isEditing && (
            <button onClick={() => setIsEditing(true)} className="text-blue-600 hover:underline">
              Edit
            </button>
          )}
          {canDelete && (
            <button onClick={() => onDelete(comment.id)} className="text-red-600 hover:underline">
              Delete
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="flex gap-2 mt-1">
          <input 
            type="text" 
            value={editText} 
            onChange={(e) => setEditText(e.target.value)} 
            className="border p-1 rounded text-xs flex-1"
          />
          <button onClick={handleSave} className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs">
            Save
          </button>
          <button onClick={() => setIsEditing(false)} className="bg-gray-300 px-2 py-0.5 rounded text-xs">
            Cancel
          </button>
        </div>
      ) : (
        <p >{comment.content}</p>
      )}
    </div>
  );
}
'use client';

import { useState } from 'react';
import { Comment } from '../types';
import CommentItem from './CommentItem';

interface Props {
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
}: Props) {
  const [inputText, setInputText] = useState('');

  const handleAdd = () => {
    if (!inputText.trim()) return;
    onAddComment(postId, inputText);
    setInputText('');
  };

  return (
    <div className="border-t pt-3 mt-4 p-3 rounded">
      <h4 className="text-sm font-semibold mb-2">Comments ({comments.length})</h4>

      {/* Comment List */}
      <div className="space-y-2 mb-3">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            currentUserId={currentUserId}
            isPostOwner={postOwnerId === currentUserId}
            onUpdate={onUpdateComment}
            onDelete={onDeleteComment}
          />
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input 
          type="text" 
          placeholder="Write a comment..." 
          value={inputText} 
          onChange={(e) => setInputText(e.target.value)} 
          className="p-1.5 border rounded text-sm flex-1"
        />
        <button 
          onClick={handleAdd}
          className="bg-blue-500 text-white px-3 py-1.5 rounded text-xs hover:bg-blue-600"
        >
          Comment
        </button>
      </div>
    </div>
  );
}
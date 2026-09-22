'use client';

import { PostVisibility } from '../types';

interface Props {
  title: string;
  content: string;
  visibility: PostVisibility;
  isEditing: boolean;
  setTitle: (val: string) => void;
  setContent: (val: string) => void;
  setVisibility: (val: PostVisibility) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export default function PostForm({
  title,
  content,
  visibility,
  isEditing,
  setTitle,
  setContent,
  setVisibility,
  onSubmit,
  onCancel,
}: Props) {
  return (
    <form onSubmit={onSubmit} className="p-4 rounded-lg border mb-8 flex flex-col gap-3 ">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold">{isEditing ? 'Edit Post' : 'Create a Post'}</h2>
        
        {/* Visibility Selector */}
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <label htmlFor="visibility-select" className="font-medium">Who can see this?</label>
          <select
            id="visibility-select"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as PostVisibility)}
            className="p-1 border rounded bg-white text-xs"
          >
            <option value="everyone">🌐 Everyone</option>
            <option value="friends">👥 Friends Only</option>
            <option value="no_one">🔒 Only Me</option>
          </select>
        </div>
      </div>

      <input 
        type="text" 
        placeholder="Title" 
        value={title} 
        onChange={(e) => setTitle(e.target.value)} 
        required 
        className="p-2 border rounded"
      />
      <textarea 
        placeholder="What's on your mind?" 
        value={content} 
        onChange={(e) => setContent(e.target.value)} 
        required 
        rows={3} 
        className="p-2 border rounded resize-none"
      />
      <div className="flex gap-2">
        <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm">
          {isEditing ? 'Update Post' : 'Publish Post'}
        </button>
        {isEditing && (
          <button 
            type="button" 
            onClick={onCancel}
            className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded text-sm"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
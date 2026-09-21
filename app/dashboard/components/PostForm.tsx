'use client';

interface Props {
  title: string;
  content: string;
  isEditing: boolean;
  setTitle: (val: string) => void;
  setContent: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export default function PostForm({
  title,
  content,
  isEditing,
  setTitle,
  setContent,
  onSubmit,
  onCancel,
}: Props) {
  return (
    <form onSubmit={onSubmit} className="p-4 rounded-lg border mb-8 flex flex-col gap-3 ">
      <h2 className="font-semibold">{isEditing ? 'Edit Post' : 'Create a Post'}</h2>
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
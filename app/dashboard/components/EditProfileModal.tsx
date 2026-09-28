'use client';

import { useState } from 'react';
import { User } from '../types';

interface Props {
  isOpen: boolean;
  user: User;
  onClose: () => void;
  onSave: () => void;
}

export default function EditProfileModal({ isOpen, user, onClose, onSave }: Props) {
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, bio, avatar_url: avatarUrl }),
      });

      if (res.ok) {
        onSave();
        onClose();
      }
    } catch {
      console.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">Edit Profile</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg p-2 text-sm focus:outline-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Avatar Image URL</label>
            <input
              type="url"
              placeholder="https://example.com/avatar.png"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full border rounded-lg p-2 text-sm focus:outline-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Bio</label>
            <textarea
              rows={3}
              placeholder="Tell people about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full border rounded-lg p-2 text-sm focus:outline-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
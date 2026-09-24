'use client';

import { ReactionUser, REACTION_EMOJIS } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  likers: ReactionUser[];
  isLoading: boolean;
}

export default function LikesModal({ isOpen, onClose, likers, isLoading }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-150">
        <div className="flex justify-between items-center px-4 py-3 border-b bg-gray-50">
          <h3 className="font-semibold text-gray-800 text-sm">Reactions</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 font-bold text-lg leading-none"
          >
            &times;
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            <p className="text-xs text-gray-500 text-center py-4">Loading reactions...</p>
          ) : likers.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-4">No reactions yet.</p>
          ) : (
            likers.map((user) => (
              <div key={user.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">@{user.username}</p>
                </div>
                <span className="text-xl">
                  {REACTION_EMOJIS[user.reaction_type]?.emoji || '👍'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
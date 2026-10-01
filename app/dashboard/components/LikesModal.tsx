'use client';

import { ReactionUser, REACTION_EMOJIS } from '../types';

interface LikesModalProps {
  isOpen: boolean;
  onClose: () => void;
  likers: ReactionUser[];
  isLoading: boolean;
}

export default function LikesModal({
  isOpen,
  onClose,
  likers,
  isLoading,
}: LikesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <div className="bg-white border-2 rounded-xl p-4 w-full max-w-sm space-y-4 shadow-sm">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b pb-2">
          <h3 className="font-bold text-sm">Reactions</h3>
          <button
            onClick={onClose}
            className="border px-2 py-0.5 rounded text-xs font-medium"
          >
            Close
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <p className="text-xs text-center py-4">Loading reactions...</p>
        ) : likers.length === 0 ? (
          <p className="text-xs text-center py-4">No reactions yet.</p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {likers.map((user) => {
              const reaction = REACTION_EMOJIS[user.reaction_type];
              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between border rounded p-2 text-xs"
                >
                  <span className="font-medium">{user.name}</span>
                  <span className="border px-1.5 py-0.5 rounded text-xs flex items-center gap-1">
                    <span>{reaction?.emoji || '👍'}</span>
                    <span className="capitalize">{user.reaction_type}</span>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
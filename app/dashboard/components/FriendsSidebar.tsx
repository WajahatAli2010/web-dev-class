'use client';

import { UserWithFriendStatus } from '../types';

interface Props {
  users: UserWithFriendStatus[];
  onSendRequest: (receiverId: number) => void;
  onAcceptRequest: (friendshipId: number) => void;
  onRemoveFriendship: (friendshipId: number) => void;
}

export default function FriendsSidebar({
  users,
  onSendRequest,
  onAcceptRequest,
  onRemoveFriendship,
}: Props) {
  const friends = users.filter((u) => u.status === 'accepted');
  const pendingRequests = users.filter((u) => u.status === 'pending_received');
  const otherUsers = users.filter((u) => u.status === 'none' || u.status === 'pending_sent');

  return (
    <aside className="w-full lg:w-72  p-4 border rounded-lg shadow-sm flex flex-col gap-6 h-fit">
      {/* 1. Pending Incoming Requests */}
      {pendingRequests.length > 0 && (
        <div>
          <h3 className="font-bold text-sm text-amber-600 mb-2 flex items-center gap-1.5">
            <span>Friend Requests</span>
            <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-semibold">
              {pendingRequests.length}
            </span>
          </h3>
          <div className="space-y-2">
            {pendingRequests.map((user) => (
              <div key={user.id} className="p-2 border rounded-md  flex flex-col gap-1.5">
                <div className="text-xs font-semibold">{user.name}</div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => user.friendshipId && onAcceptRequest(user.friendshipId)}
                    className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 rounded flex-1"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => user.friendshipId && onRemoveFriendship(user.friendshipId)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs px-2 py-1 rounded"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. My Friends */}
      <div>
        <h3 className="font-bold text-sm  mb-2">
          My Friends ({friends.length})
        </h3>
        {friends.length === 0 ? (
          <p className="text-xs text-gray-400 italic">No friends added yet.</p>
        ) : (
          <div className="space-y-2">
            {friends.map((friend) => (
              <div key={friend.id} className="flex justify-between items-center p-2 border rounded-md text-xs">
                <div>
                  <p className="font-medium">{friend.name}</p>
                  <p className="text-[10px]">@{friend.username}</p>
                </div>
                <button
                  onClick={() => friend.friendshipId && onRemoveFriendship(friend.friendshipId)}
                  className="text-red-500 hover:underline text-[11px]"
                >
                  Unfriend
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Community Directory / Discover Users */}
      <div>
        <h3 className="font-bold text-sm  mb-2">Registered Users</h3>
        {otherUsers.length === 0 ? (
          <p className="text-xs text-gray-400 italic">No other users found.</p>
        ) : (
          <div className="space-y-2">
            {otherUsers.map((user) => (
              <div key={user.id} className="flex justify-between items-center p-2 border rounded-md text-xs">
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-gray-400 text-[10px]">@{user.username}</p>
                </div>

                {user.status === 'none' && (
                  <button
                    onClick={() => onSendRequest(user.id)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-[11px]"
                  >
                    + Add
                  </button>
                )}

                {user.status === 'pending_sent' && (
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400 text-[10px]">Pending</span>
                    <button
                      onClick={() => user.friendshipId && onRemoveFriendship(user.friendshipId)}
                      className="text-red-500 hover:underline text-[10px]"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
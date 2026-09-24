export type ReactionType = 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';

export const REACTION_EMOJIS: Record<ReactionType, { emoji: string; label: string; color: string }> = {
  like: { emoji: '👍', label: 'Like', color: 'text-blue-600' },
  love: { emoji: '❤️', label: 'Love', color: 'text-red-500' },
  haha: { emoji: '😂', label: 'Haha', color: 'text-yellow-500' },
  wow: { emoji: '😮', label: 'Wow', color: 'text-yellow-500' },
  sad: { emoji: '😢', label: 'Sad', color: 'text-yellow-500' },
  angry: { emoji: '😡', label: 'Angry', color: 'text-orange-600' },
};

export interface User {
  id: number;
  name: string;
  username: string;
}

export interface ReactionUser extends User {
  reaction_type: ReactionType;
}

export type FriendshipStatus = 'none' | 'pending_sent' | 'pending_received' | 'accepted';

export interface UserWithFriendStatus {
  id: number;
  name: string;
  username: string;
  friendshipId?: number;
  status: FriendshipStatus;
}

export type PostVisibility = 'everyone' | 'friends' | 'no_one';

export interface Post {
  id: number;
  title: string;
  content: string;
  user_id: number;
  author_name: string;
  created_at: string;
  visibility: PostVisibility;
  like_count: number;
  user_reaction: ReactionType | null;
}

export interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  author_name: string;
  created_at: string;
}
export interface User {
  id: number;
  name: string;
  username: string;
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
}

export interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  author_name: string;
  created_at: string;
}
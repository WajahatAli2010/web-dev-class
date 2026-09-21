export interface User {
  id: number;
  name: string;
  username: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  user_id: number;
  author_name: string;
  created_at: string;
}

export interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  author_name: string;
  created_at: string;
}
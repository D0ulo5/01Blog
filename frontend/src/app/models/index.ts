export interface UserDTO {
  id: number;
  username: string;
  email: string;
  bio?: string;
  role: 'USER' | 'ADMIN';
  banned: boolean;
  createdAt: string;
}

export interface UserAdminDTO extends UserDTO {
  postsCount?: number;
}

export interface ProfileDTO {
  id: number;
  username: string;
  bio?: string;
  createdAt: string;
}

export interface PostDTO {
  id: number;
  userId: number;
  username: string;
  title: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'IMAGE' | 'VIDEO';
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  commentCount: number;
  likedByCurrentUser: boolean;
  hidden: boolean;
}

export interface CommentDTO {
  id: number;
  postId: number;
  userId: number;
  username: string;
  content: string;
  createdAt: string;
}

export interface NotificationDTO {
  id: number;
  message: string;
  read: boolean;
  createdAt: string;
  type?: string;
}

export interface ReportDTO {
  id: number;
  reporterId: number;
  reporterUsername: string;
  reportedUserId: number;
  reportedUsername: string;
  reportedPostId?: number;
  reason: string;
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
}

export interface SubscriptionStats {
  followers: number;
  following: number;
}

export interface AuthResponse {
  token: string;
  user: UserDTO;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

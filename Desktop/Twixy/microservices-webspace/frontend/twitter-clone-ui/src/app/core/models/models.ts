export interface User {
  id: number; username: string; email?: string; firstName: string; lastName: string;
  bio?: string | null; profileImage?: string | null; bannerImage?: string | null;
}
export interface LoginResponse { token: string; user: User; }
export interface Tweet {
  id: number; userId: number; username: string; name: string; profileImage?: string | null;
  content: string; imageUrl?: string | null; createdAt: string; updatedAt: string;
  likeCount: number; commentCount: number; likedByMe: boolean;
}
export interface TweetComment {
  id: number; tweetId: number; userId: number; username: string; name: string;
  profileImage?: string | null; content: string; createdAt: string; updatedAt: string;
}
export interface Follow { id: number; followerId: number; followingId: number; createdAt: string; }
export interface FollowStatus { following: boolean; followedBy: boolean; }
export interface FollowCount { followers: number; following: number; }

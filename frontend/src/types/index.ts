// src/types/index.ts

export interface Post {
  id: number;
  imageUrl: string;
  description: string | null; // <-- ADD THIS
  price: number;
  creatorWallet: string;
  isPurchased: boolean;
}

export interface UserProfile {
  walletAddress: string;
  username: string | null;
  profileImage: string | null;
  bio: string | null; // <-- ADD THIS
  posts: Post[];
}
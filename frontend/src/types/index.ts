// src/types/index.ts

export interface Post {
  id: number;
  imageUrl: string;
  price: number;
  creatorWallet: string;
  isPurchased: boolean; // This comes from the backend logic
}

export interface UserProfile {
  walletAddress: string;
  username: string | null;
  profileImage: string | null;
  posts: Post[];
}
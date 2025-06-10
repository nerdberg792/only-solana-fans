"use client";

import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { SystemProgram, Transaction, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import toast from 'react-hot-toast';
import { Lock, Check, Loader2, Trash, ImageIcon } from 'lucide-react';
import { Post } from '@/types';
import api from '@/lib/api'
import Image from 'next/image';

interface PostCardProps {
  post: Post;
  isOwner: boolean;
  onDelete?: (postId: string) => void;
  onPurchaseSuccess?: (postId: number) => void;
}

export function PostCard({ post, isOwner, onDelete, onPurchaseSuccess }: PostCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  // Calculate unlock state based on props (more reliable than useState)
  const isUnlocked = post.isPurchased || isOwner;
  
  // Check if we have access to the image URL
  const hasImageAccess = post.imageUrl && (post.isPurchased || isOwner);

  const handleUnlock = async () => {
    if (!publicKey) {
        toast.error('Please connect your wallet to unlock content.');
        return;
    }
    setIsProcessing(true);
    const toastId = toast.loading('Preparing transaction...');

    try {
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey: new PublicKey(post.creatorWallet),
                lamports: Math.round(post.price * LAMPORTS_PER_SOL),
            })
        );
        toast.loading('Please approve transaction...', { id: toastId });
        const signature = await sendTransaction(transaction, connection);
        toast.loading('Verifying purchase...', { id: toastId });
        
        const response = await api.post('/posts/verify-purchase', {
            transactionSignature: signature,
            postId: post.id,
        });

        toast.success('Purchase successful!', { id: toastId });
        
        // Notify parent component about the successful purchase
        if (onPurchaseSuccess) {
            onPurchaseSuccess(post.id);
        }
        
    } catch (error: any) {
        toast.error(error.response?.data?.error || 'Purchase failed.', { id: toastId });
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <div className="group relative aspect-square rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow bg-gray-200">
      
      {/* Show image if we have access, otherwise show placeholder */}
      {hasImageAccess ? (
        <img
          height={400}
          width={400}
          src={post.imageUrl}
          alt="Post content"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
          <ImageIcon size={48} className="text-gray-500" />
        </div>
      )}

      {/* Delete button for owner */}
      {isOwner && onDelete && (
        <button
          onClick={() => onDelete(String(post.id))}
          className="absolute top-2 left-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full shadow-sm transition-colors"
          title="Delete post"
        >
          <Trash size={16} />
        </button>
      )}

      {/* Unlock overlay for non-purchased posts */}
      {!isUnlocked && !isOwner && (
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4">
          <button 
            onClick={handleUnlock} 
            disabled={isProcessing} 
            className="bg-purple-600 text-white px-5 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-center shadow-lg"
          >
            {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <Lock size={20} />}
            {isProcessing ? 'Processing...' : `Unlock for ${post.price} SOL`}
          </button>
        </div>
      )}

      {/* Success indicator for unlocked posts */}
      {(isUnlocked || isOwner) && (
        <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full shadow-sm">
          <Check size={16} />
        </div>
      )}

      {/* Post description if available */}
      {post.description && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
          <p className="text-white text-sm">{post.description}</p>
        </div>
      )}
    </div>
  );
};
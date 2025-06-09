"use client";

import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { SystemProgram, Transaction, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import toast from 'react-hot-toast';
import { Lock, Check, Loader2 ,Trash, Undo} from 'lucide-react';
import { Post } from '@/types';
import api from '@/lib/api'
import Image from 'next/image';
interface PostCardProps {
  post: Post;
  isOwner: boolean;
  onDelete?: (postId:string) => void ; 
}

export function PostCard({ post, isOwner , onDelete}: PostCardProps) {
  const [isUnlocked, setIsUnlocked] = useState(post.isPurchased || isOwner);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

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
        await api.post('/posts/verify-purchase', {
            transactionSignature: signature,
            postId: post.id,
        });

        toast.success('Purchase successful!', { id: toastId });
        setIsUnlocked(true);
    } catch (error : any ) {
        toast.error(error.response?.data?.error || 'Purchase failed.', { id: toastId });
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <div className="group relative aspect-square rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow bg-gray-200">
      <Image
        height={10}
        width={10}
        src={post.imageUrl}
        alt="Post content"
        className={`w-full h-full object-cover transition-all duration-500 ${
          !isUnlocked ? 'blur-2xl scale-105' : 'blur-none scale-100'
        }`}
      />
      {isOwner && onDelete && (
  <button
    onClick={() => onDelete(String(post.id))}
    className="absolute top-2 left-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full shadow-sm transition-colors"
    title="Delete post"
  >
    <Trash size={16} />
  </button>
)}

      {!isUnlocked && (
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4">
          <button onClick={handleUnlock} disabled={isProcessing} className="bg-purple-600 text-white px-5 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-center shadow-lg">
            {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <Lock size={20} />}
            {isProcessing ? 'Processing...' : `Unlock for ${post.price} SOL`}
          </button>
        </div>
      )}
      {isUnlocked && (
        <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full shadow-sm">
          <Check size={16} />
        </div>
      )}
    </div>
  );
};
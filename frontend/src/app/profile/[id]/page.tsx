"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import api from '../../../lib/api';
import { UserProfile } from '../../../types';
import { PostCard } from '@/components/layout/features/PostCard';
import { Copy, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
export default function ProfilePage() {
    const params = useParams();
    const { id } = params;
    const { publicKey } = useWallet();
  
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
  
    const isOwnProfile = profile && publicKey && profile.walletAddress === publicKey.toBase58();

    useEffect(() => {
      if (typeof id !== 'string') return;
      setLoading(true);
      setError(null);
      const viewerWalletQuery = publicKey ? `?viewerWallet=${publicKey.toBase58()}` : '';
      api.get(`/users/${id}/profile${viewerWalletQuery}`)
        .then(res => setProfile(res.data))
        .catch(() => setError('Profile not found.'))
        .finally(() => setLoading(false));
    }, [id, publicKey]);

    const copyAddress = () => {
        if (!profile) return;
        navigator.clipboard.writeText(profile.walletAddress);
        toast.success('Address copied!');
    };

    if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin w-10 h-10 border-4 border-gray-300 border-t-purple-600 rounded-full mx-auto"></div></div>;
    if (error) return <div className="text-center p-10 text-xl text-red-500">{error}</div>;

    // TODO: Implement Creator Setup Flow when the backend supports it.
    // if (isOwnProfile && !profile?.username) {
    //   return <CreatorSetupForm />;
    // }

    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <header className="flex items-center gap-6 p-8 mb-8 bg-white rounded-xl shadow-sm">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
            <img
              src={profile?.profileImage || `https://api.dicebear.com/7.x/identicon/svg?seed=${profile?.walletAddress}`}
              alt={profile?.username || 'Profile'}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">
              @{profile?.username || 'unnamed'}
            </h1>
            <div className="flex items-center gap-2 text-gray-500 mt-2">
              <code className="text-sm bg-gray-100 px-2 py-1 rounded-md font-mono break-all">
                {profile?.walletAddress}
              </code>
              <button onClick={copyAddress} className="p-1 hover:bg-gray-200 rounded transition-colors" title="Copy address">
                <Copy size={16} />
              </button>
            </div>
          </div>
        </header>

        <main>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Posts</h2>
          {profile?.posts?.length&&profile?.posts?.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {profile.posts.map(post => (
                <PostCard key={post.id} post={post} isOwner={!!isOwnProfile} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                <ImageIcon size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">This creator hasn't posted anything yet.</p>
            </div>
          )}
        </main>
      </div>
    );
}
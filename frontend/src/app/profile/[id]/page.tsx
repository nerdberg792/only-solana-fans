"use client";

import { useEffect, useState, useMemo } from 'react'; // <-- Import useMemo
import { useParams } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import api from '@/lib/api';
import { UserProfile } from '@/types';
import { PostCard } from '@/components/layout/features/PostCard';
import { CreatorSetupForm } from '@/components/layout/features/CreatorSetupForm';
import { EditProfileForm } from "@/components/layout/features/EditProfileForm" ; 
import { Copy, Image as ImageIcon, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
    const params = useParams();
    const { id } = params;
    const { publicKey } = useWallet();
  
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
    // --- THE FIX IS HERE: Create a stable, primitive dependency ---
    // We get the string value of the public key. This value will only change
    // if the user connects or disconnects their wallet.
    const walletAddressString = useMemo(() => publicKey?.toBase58() || null, [publicKey]);
    // --- END OF FIX ---

    const isOwnProfile = profile && walletAddressString && profile.walletAddress === walletAddressString;

    useEffect(() => {
        // This effect will now only re-run if the URL `id` changes,
        // or if the connected wallet address string changes.
        if (typeof id !== 'string') {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        
        const viewerWalletQuery = walletAddressString ? `?viewerWallet=${walletAddressString}` : '';
        
        api.get(`/users/${id}/profile${viewerWalletQuery}`)
            .then(res => setProfile(res.data))
            .catch((err) => {
                console.error("Fetch profile error:", err);
                setError('Profile not found.');
            })
            .finally(() => setLoading(false));

    }, [id, walletAddressString]); // <-- Use the stable string in the dependency array

    const copyAddress = () => {
        if (!profile) return;
        navigator.clipboard.writeText(profile.walletAddress);
        toast.success('Address copied!');
    };

    if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin w-10 h-10 border-4 border-gray-300 border-t-purple-600 rounded-full mx-auto"></div></div>;
    
    // Check if the current user is viewing their own profile AND needs to set it up.
    // The `profile` must be loaded first to make this check.
    if (isOwnProfile && profile && !profile.username) {
        return <CreatorSetupForm />;
    }

    if (error || !profile) return <div className="text-center p-10 text-xl text-red-500">{error || 'Profile could not be loaded.'}</div>;
    
    return (
      <>
        <div className="max-w-6xl mx-auto px-6 py-8">
            <header className="flex flex-col md:flex-row items-center gap-6 p-8 mb-8 bg-white rounded-xl shadow-sm">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                    <img src={profile.profileImage || `https://api.dicebear.com/7.x/identicon/svg?seed=${profile.walletAddress}`} alt={profile.username || 'Profile'} className="w-full h-full object-cover"/>
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-3xl font-bold text-gray-900">@{profile.username}</h1>
                    <div className="flex items-center justify-center md:justify-start gap-2 text-gray-500 mt-2">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded-md font-mono break-all">{profile.walletAddress}</code>
                        <button onClick={copyAddress} className="p-1 hover:bg-gray-200 rounded transition-colors" title="Copy address"><Copy size={16} /></button>
                    </div>
                    {profile.bio && <p className="text-gray-600 mt-4 max-w-prose">{profile.bio}</p>}
                </div>
                {isOwnProfile && (
                    <button  className="btn btn-outline btn-sm">
                        <Edit size={16} /> Edit Profile
                    </button>
                )}
            </header>
            <main>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Posts</h2>
                {profile.posts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {profile.posts.map(post => <PostCard key={post.id} post={post} isOwner={!!isOwnProfile} />)}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                        <ImageIcon size={48} className="text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg">{isOwnProfile ? "You haven't posted anything yet." : "This creator hasn't posted anything yet."}</p>
                    </div>
                )}
            </main>
        </div>

        {isOwnProfile && isEditModalOpen && (
            <div className="modal modal-open">
                <div className="modal-box">
                    <EditProfileForm profile={profile} onClose={() => setIsEditModalOpen(false)} />
                </div>
                <div className="modal-backdrop" onClick={() => setIsEditModalOpen(false)}></div>
            </div>
        )}
      </>
    );
}
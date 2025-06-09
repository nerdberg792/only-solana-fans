"use client";

import { useState, useCallback, FormEvent, ChangeEvent, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Check, X, Loader2, UploadCloud } from 'lucide-react';
import { UserProfile } from '@/types';
import Image from "next/image"
const debounce = (func: (name: string) => void, delay: number) => { let timeout: NodeJS.Timeout; return (...args: [string]) => { clearTimeout(timeout); timeout = setTimeout(() => func(...args), delay); }; };

interface EditProfileFormProps {
  profile: UserProfile;
  onClose: () => void; // Function to close the modal
}

export function EditProfileForm({ profile, onClose }: EditProfileFormProps) {
    const router = useRouter();
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>(profile.profileImage || '');
    const [username, setUsername] = useState(profile.username || '');
    const [bio, setBio] = useState(profile.bio || '');
    const [usernameStatus, setUsernameStatus] = useState<'checking' | 'available' | 'taken' | 'idle'>('available'); // Assume current username is available
    const [isLoading, setIsLoading] = useState(false);

    const checkUsername = async (name: string) => {
        if (name === profile.username) { setUsernameStatus('available'); return; }
        if (name.length < 3) { setUsernameStatus('idle'); return; }
        setUsernameStatus('checking');
        try {
            await api.get(`/users/check-username?username=${name}`);
            setUsernameStatus('available');
        } catch (error) { setUsernameStatus('taken'); }
    };
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedCheck = useCallback(debounce(checkUsername, 400), [profile.username]);

    const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newUsername = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
        setUsername(newUsername);
        debouncedCheck(newUsername);
    };

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (usernameStatus !== 'available') { toast.error('Please choose an available username.'); return; }
        setIsLoading(true);
        const toastId = toast.loading('Updating your profile...');

        let newProfileImageUrl = profile.profileImage;

        try {
            // Only upload a new image if one was selected
            if (imageFile) {
                const { data: { signedUrl, publicUrl } } = await api.get(`/posts/signed-url?fileType=${imageFile.type}`);
                await fetch(signedUrl, { method: 'PUT', headers: { 'Content-Type': imageFile.type }, body: imageFile });
                newProfileImageUrl = publicUrl;
            }

            // Send all data to the update endpoint
            await api.put('/users/profile', { 
                username, 
                bio, 
                profileImage: newProfileImageUrl 
            });

            toast.success('Profile updated successfully!', { id: toastId });
            onClose(); // Close the modal
            router.refresh(); // Refresh page to show changes
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Profile update failed.', { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-4">
            <h2 className="text-2xl font-bold text-center">Edit Profile</h2>
            {/* Form fields are very similar to CreatorSetupForm, but pre-filled */}
            {/* ... JSX for profile picture, username, and bio inputs ... */}
             <div className="flex flex-col items-center gap-4">
             <div className="avatar">
  <div className="w-24 rounded-full ring ring-primary">
    {imagePreview.endsWith('.svg') ? (
      <img
        src={profile.profileImage|| `https://api.dicebear.com/7.x/identicon/svg?seed=${profile.walletAddress}`}
        alt="Profile Preview"
        className="w-full h-full object-cover rounded-full"
      />
    ) : (
      <img
        src={profile.profileImage||`https://api.dicebear.com/7.x/identicon/svg?seed=${profile.walletAddress}` }
        width={96}
        height={96}
        alt="Profile Preview"
        className="w-full h-full object-cover"
      />
    )}
  </div>
</div>

                <input type="file" id="edit-profile-image" accept="image/*" onChange={handleImageChange} className="hidden" />
                <label htmlFor="edit-profile-image" className="btn btn-sm btn-outline">Change Picture</label>
            </div>
             <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <div className="relative">
                <input
  id="username"
  type="text"
  value={username}
  onChange={handleUsernameChange}
  placeholder={profile.username|| "Enter username"}
  className="input input-bordered w-full"
  required
/>
                     <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {usernameStatus === 'checking' && <Loader2 className="animate-spin text-gray-400" />}
                        {usernameStatus === 'available' && <Check className="text-green-500" />}
                        {usernameStatus === 'taken' && <X className="text-red-500" />}
                    </div>
                </div>
            </div>
             <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea
  id="bio"
  value={bio}
  onChange={(e) => setBio(e.target.value)}
  placeholder={profile.bio || "Tell us about yourself..."}
  rows={3}
  className="textarea textarea-bordered w-full"
/>
            </div>
            <div className="flex gap-4">
                 <button type="button" onClick={onClose} className="btn w-full">Cancel</button>
                 <button type="submit" disabled={isLoading || usernameStatus !== 'available'} className="btn btn-primary w-full">
                    {isLoading ? <Loader2 className="animate-spin" /> : 'Save Changes'}
                </button>
            </div>
        </form>
    );
}
"use client";

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Check, X, Loader2, UploadCloud } from 'lucide-react';

const debounce = (func: (name: string) => void, delay: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: [string]) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
};

export function CreatorSetupForm() {
    const router = useRouter();
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [username, setUsername] = useState('');
    const [bio, setBio] = useState('');
    const [usernameStatus, setUsernameStatus] = useState<'checking' | 'available' | 'taken' | 'idle'>('idle');
    const [isLoading, setIsLoading] = useState(false);

    const checkUsername = async (name: string) => {
        if (name.length < 3) { setUsernameStatus('idle'); return; }
        setUsernameStatus('checking');
        try {
            await api.get(`/users/check-username?username=${name}`);
            setUsernameStatus('available');
        } catch (error) { setUsernameStatus('taken'); }
    };
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedCheck = useCallback(debounce(checkUsername, 400), []);

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newUsername = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
        setUsername(newUsername);
        debouncedCheck(newUsername);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!imageFile || usernameStatus !== 'available') { toast.error('Please upload a profile picture and choose an available username.'); return; }
        setIsLoading(true);
        const toastId = toast.loading('Setting up your profile...');

        try {
            const { data: { signedUrl, publicUrl } } = await api.post(`/posts/signed-url?fileType=${imageFile.type}`);
            await fetch(signedUrl, { method: 'PUT', headers: { 'Content-Type': imageFile.type }, body: imageFile });
            await api.put('/users/profile', { username, bio, profileImage: publicUrl });

            toast.success('Profile created successfully!', { id: toastId });
            router.refresh();
        } catch (error:any) {
            toast.error(error.response?.data?.error || 'Profile setup failed.', { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-6 py-12">
            <div className="bg-white rounded-xl shadow-sm p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Set Up Your Creator Profile</h1>
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="flex flex-col items-center gap-4">
                        <div className="avatar">
                            <div className="w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                                <img src={imagePreview || `https://api.dicebear.com/7.x/identicon/svg?seed=default`} />
                            </div>
                        </div>
                        <input type="file" id="profile-image-upload" accept="image/*" onChange={handleImageChange} className="hidden" required />
                        <label htmlFor="profile-image-upload" className="btn btn-outline">Upload Picture</label>
                    </div>

                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">Choose a unique username</label>
                        <div className="relative">
                            <input id="username" type="text" value={username} onChange={handleUsernameChange} placeholder="e.g., alice_creates" className="input input-bordered w-full" required />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                {usernameStatus === 'checking' && <Loader2 className="animate-spin text-gray-400" />}
                                {usernameStatus === 'available' && <Check className="text-green-500" />}
                                {usernameStatus === 'taken' && <X className="text-red-500" />}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">Bio (Optional)</label>
                        <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="Tell your fans a little about yourself..." className="textarea textarea-bordered w-full"></textarea>
                    </div>

                    <button type="submit" disabled={isLoading || usernameStatus !== 'available' || !imageFile} className="btn btn-primary w-full">
                        {isLoading ? <Loader2 className="animate-spin" /> : 'Save and Continue'}
                    </button>
                </form>
            </div>
        </div>
    );
}
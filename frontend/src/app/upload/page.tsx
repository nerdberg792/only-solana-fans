"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../stores/useAuthStore';
import { useWallet } from '@solana/wallet-adapter-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Upload, ImageIcon, Loader2 } from 'lucide-react';
import Image from "next/image"
export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>('');
    const [price, setPrice] = useState<string>('');
    const [description, setDescription] = useState(''); // <-- ADD THIS
    const [isUploading, setIsUploading] = useState(false);
    
    const token = useAuthStore((state) => state.token);
    const { publicKey } = useWallet();
    const router = useRouter();

    useEffect(() => {
        if (!token) {
            toast.error("Please log in to upload content.");
            router.push('/');
        }
    }, [token, router]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !price || isNaN(Number(price))) return;
        setIsUploading(true);
        const toastId = toast.loading('Preparing upload...');
        
        try {
            const { data: { signedUrl, publicUrl } } = await api.post(`/posts/signed-url?fileType=${file.type}`);
            toast.loading('Uploading image...', { id: toastId });
            await fetch(signedUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
            toast.loading('Creating post...', { id: toastId });
            
            // --- UPDATE THIS API CALL ---
            await api.post('/posts', { 
                imageUrl: publicUrl, 
                price: Number(price),
                description: description // Send the description
            });
            
            toast.success('Post created successfully!', { id: toastId });
            router.push(`/profile/${publicKey?.toBase58()}`);
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Upload failed.', { id: toastId });
        } finally {
            setIsUploading(false);
        }
    };

    if (!token) return null;

    return (
        <div className="max-w-2xl mx-auto px-6 py-12">
            <div className="bg-white rounded-xl shadow-sm p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Create a New Post</h1>
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Image Upload Section (no change) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image</label>
                        <div className="relative aspect-square border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
                            {preview ? <Image src={preview} alt="Upload preview" className="w-full h-full object-cover rounded-xl" unoptimized/> : <div className="text-center text-gray-500"><ImageIcon size={48} className="mx-auto mb-2" /><p>Click or drag file</p></div>}
                            <input type="file" accept="image/*" onChange={handleImageChange} required className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        </div>
                    </div>
                    
                    {/* --- ADD DESCRIPTION TEXTAREA --- */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Caption (Optional)</label>
                        <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Add a caption to your post..." className="textarea textarea-bordered w-full"></textarea>
                    </div>

                    {/* Price Input (no change) */}
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">Price (SOL)</label>
                        <input type="number" id="price" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.1" step="0.01" min="0" required className="input input-bordered w-full" />
                    </div>

                    <button type="submit" disabled={!file || !price || isUploading} className="btn btn-primary w-full">
                        {isUploading ? <Loader2 className="animate-spin" /> : <Upload size={20} />}
                        {isUploading ? 'Creating Post...' : 'Create Post'}
                    </button>
                </form>
            </div>
        </div>
    );
}
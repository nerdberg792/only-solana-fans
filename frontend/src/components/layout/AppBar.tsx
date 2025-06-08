"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useCallback, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { useAuthStore } from "../../stores/useAuthStore";
import api from "../../lib/api";
import { User, ChevronDown, Upload } from 'lucide-react';
import { useRouter } from "next/navigation";

export function AppBar() {
    const { publicKey, signMessage, connected, disconnect } = useWallet();
    const { token, setToken, logout } = useAuthStore();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const router = useRouter();

    const handleLogin = useCallback(async () => {
        if (!publicKey || !signMessage) return;
        try {
            const { data: { message } } = await api.post('/auth/challenge', { walletAddress: publicKey.toBase58() });
            const encodedMessage = new TextEncoder().encode(message);
            const signature = await signMessage(encodedMessage);
            const { data } = await api.post('/auth/verify', { walletAddress: publicKey.toBase58(), signature: Array.from(signature) });
            if (data.token) {
                setToken(data.token);
                toast.success('Logged in successfully!');
            }
        } catch (error : any ) {
            toast.error(error.response?.data?.error || 'Login failed.');
            disconnect();
        }
    }, [publicKey, signMessage, setToken, disconnect]);

    useEffect(() => {
        if (connected && publicKey && !token) {
            handleLogin();
        }
    }, [connected, publicKey, token, handleLogin]);

    const handleLogout = () => {
        logout();
        disconnect();
        setIsDropdownOpen(false);
        toast.success('Logged out.');
        router.push('/');
    };

    return (
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-3 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-purple-600 transition-colors">
                    SolanaFans
                </Link>
                <div className="flex items-center gap-4">
                    {!token ? (
                        <WalletMultiButton className="!bg-purple-600 !text-white !px-5 !py-2 !rounded-lg !font-medium hover:!bg-purple-700 !transition-colors" />
                    ) : (
                        <>
                            <Link href="/upload" className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2">
                                <Upload size={18} />
                                <span>Upload</span>
                            </Link>
                            <div className="relative">
                                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                    <User size={20} className="text-gray-600" />
                                    <ChevronDown size={16} className={`text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-lg shadow-lg py-1">
                                        <Link href={`/profile/${publicKey?.toBase58()}`} onClick={() => setIsDropdownOpen(false)} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                            My Profile
                                        </Link>
                                        <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50">
                                            Disconnect
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};
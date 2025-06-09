"use client";

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Image from 'next/image';
export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/profile/${searchQuery.trim()}`);
    } else {
      toast.error('Please enter a username or wallet address.');
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-white">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          The Future of
          <br />
          <span className="text-purple-600">Creator Monetization</span>
        </h1>
        <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
          A decentralized platform for creators to connect directly with their audience. No middlemen. Instant payouts. All powered by Solana.
        </p>
        <form onSubmit={handleSearch} className="max-w-lg mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by username or wallet address..."
              className="w-full pl-12 pr-32 py-4 text-lg border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
            />
            <button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-6 py-2 rounded-lg font-semibold hover:bg-black transition-colors">
              Explore
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
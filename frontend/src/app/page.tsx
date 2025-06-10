"use client";

import React, { useState } from 'react';
import { Search, Wallet, Zap, Users, ArrowRight, X, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {Tweet} from 'react-tweet'
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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="flex-grow flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="mb-8">
            <span className="inline-flex items-center bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Zap size={16} className="mr-2" />
              Powered by Solana Micropayments
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Support Creators
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Instantly
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Discover amazing creators, explore their posts, and support them directly with instant Solana micropayments. 
            No fees, no delays – just pure creator-to-fan connection.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-16">
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" size={24} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search creators by username or wallet address..."
                className="w-full pl-16 pr-40 py-6 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-purple-500 shadow-sm hover:shadow-md transition-all duration-200 bg-white"
              />
              <button 
                type="submit" 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-500 to-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
              >
                <span>Explore</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </form>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-20">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Users className="text-purple-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Discover Creators</h3>
              <p className="text-gray-600">Find and explore creators by searching their usernames or wallet addresses. Browse their latest posts and content.</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Zap className="text-blue-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Instant Payments</h3>
              <p className="text-gray-600">Support creators instantly with Solana micropayments. Lightning-fast transactions with minimal fees.</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Wallet className="text-green-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Direct Connection</h3>
              <p className="text-gray-600">Connect directly with creators without intermediaries. Your support goes straight to the creator's wallet.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Twitter Embed Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-xl text-gray-600 mb-12">See our complete flow explained step by step</p>
          
          {/* Placeholder for Twitter Embed */}
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto border border-gray-200">
            <div className="flex items-center justify-center mb-6">
            </div>
            
            <div className="bg-gray-50 rounded-xl p-8 mb-6">
              <div className="flex items-center justify-center mb-4">
                <Play className="text-purple-600" size={48} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Flow Explainer</h3>
              <Tweet id="1932126964875456823"></Tweet>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Join thousands of creators and supporters already using our platform for instant, direct monetization.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold text-white">SolanaFans</span>
            </div>
            <div className="flex space-x-8">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 SolanaFans. Built on Solana for instant creator monetization.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/auth-context';
import { getUserDisplayName, getUserInitials } from '@/lib/firebase-utils';
import AuthModal from '@/components/auth/auth-modal';
import { User, LogOut, FolderOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const { user, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowUserMenu(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800/30 bg-zinc-950/90 backdrop-blur-2xl">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo with animated dots */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex gap-1.5">
              <motion.div 
                className="w-2 h-2 bg-indigo-500 rounded-full"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [1, 0.6, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div 
                className="w-2 h-2 bg-purple-500 rounded-full"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [1, 0.6, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.2
                }}
              />
              <motion.div 
                className="w-2 h-2 bg-pink-500 rounded-full"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [1, 0.6, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.4
                }}
              />
            </div>
            
            <div className="flex flex-col">
              <span className="text-xl font-bold text-zinc-100 group-hover:text-indigo-400 transition-colors">
                VibeArchitect
              </span>
              <span className="text-xs text-zinc-500 font-light tracking-wide">
                <span className="text-indigo-400 font-medium">AI-First</span> Boilerplate Generator
              </span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/generator"
              className="text-sm font-medium text-zinc-400 hover:text-indigo-400 transition-colors relative group"
            >
              Generator
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
            {user && (
              <Link
                href="/projects"
                className="text-sm font-medium text-zinc-400 hover:text-indigo-400 transition-colors relative group"
              >
                My Projects
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-400 group-hover:w-full transition-all duration-300"></span>
              </Link>
            )}
            <button
              onClick={() => {
                const element = document.getElementById('features');
                element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="text-sm font-medium text-zinc-400 hover:text-indigo-400 transition-colors relative group"
            >
              Features
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-400 group-hover:w-full transition-all duration-300"></span>
            </button>
          </nav>

          {/* Auth Section */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 rounded-lg transition-colors"
                >
                  <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-500">
                    {user.photoURL ? (
                      <Image 
                        src={user.photoURL} 
                        alt={getUserDisplayName(user)}
                        width={28}
                        height={28}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <span className="text-white text-xs font-semibold">
                        {getUserInitials(user)}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-zinc-300 hidden sm:block">
                    {getUserDisplayName(user)}
                  </span>
                </button>

                {/* User Menu Dropdown */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl overflow-hidden"
                    >
                      <div className="p-3 border-b border-zinc-800">
                        <p className="text-sm font-medium text-zinc-100">{getUserDisplayName(user)}</p>
                        <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                      </div>
                      <div className="p-1">
                        <Link
                          href="/projects"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded-md transition-colors"
                        >
                          <FolderOpen className="w-4 h-4" />
                          My Projects
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-zinc-800 rounded-md transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.button
                onClick={() => setShowAuthModal(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative overflow-hidden px-5 py-2.5 rounded-full font-medium text-sm transition-all"
              >
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-100 group-hover:opacity-90 transition-opacity"></div>
                
                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{
                    x: ['-200%', '200%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                    repeatDelay: 1
                  }}
                />
                
                {/* Content */}
                <span className="relative flex items-center gap-2 text-white">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </span>
                
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 blur-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 -z-10 transition-opacity duration-300"></div>
              </motion.button>
            )}
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}

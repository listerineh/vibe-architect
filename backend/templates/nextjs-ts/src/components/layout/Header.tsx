/**
 * Header Component
 * 
 * Main navigation header for the application.
 * Includes logo, navigation links, and user actions.
 * 
 * @example
 * <Header />
 */

import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-indigo-500 flex items-center justify-center">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <span className="font-semibold text-lg">My App</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            href="/" 
            className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
          >
            Home
          </Link>
          <Link 
            href="/about" 
            className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
          >
            About
          </Link>
          <Link 
            href="/contact" 
            className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
          >
            Contact
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
            Sign In
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-500 rounded-lg hover:bg-indigo-600 transition-colors">
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
}

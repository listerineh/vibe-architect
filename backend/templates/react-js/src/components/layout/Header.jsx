/**
 * Header Component
 * 
 * Main navigation header for the application.
 * Includes logo, navigation links, and user actions.
 * 
 * @example
 * <Header />
 */

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-indigo-500 flex items-center justify-center">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <span className="font-semibold text-lg">My App</span>
        </a>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <a 
            href="/" 
            className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
          >
            Home
          </a>
          <a 
            href="/about" 
            className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
          >
            About
          </a>
          <a 
            href="/contact" 
            className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
          >
            Contact
          </a>
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

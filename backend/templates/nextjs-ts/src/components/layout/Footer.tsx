/**
 * Footer Component
 * 
 * Application footer with links and information.
 * Typically placed at the bottom of every page.
 * 
 * @example
 * <Footer />
 */

import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="font-semibold text-lg">My App</span>
            </div>
            <p className="text-sm text-gray-600">
              Building amazing experiences with modern web technologies.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-sm text-gray-900 mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/features" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                  Documentation
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-sm text-gray-900 mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-sm text-gray-900 mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                  Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            © {currentYear} My App. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

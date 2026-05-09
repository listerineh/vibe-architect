/**
 * Sidebar Component
 * 
 * Collapsible sidebar for navigation or additional content.
 * Responsive with mobile drawer functionality.
 * 
 * @example
 * <Sidebar>
 *   <nav>Navigation items...</nav>
 * </Sidebar>
 */

'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  children: React.ReactNode;
  className?: string;
  defaultOpen?: boolean;
}

export function Sidebar({ children, className, defaultOpen = true }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-200 transition-transform duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          className
        )}
      >
        <div className="flex flex-col h-full p-4">
          {/* Toggle button (mobile) */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
      </aside>

      {/* Toggle button (when closed) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}
    </>
  );
}

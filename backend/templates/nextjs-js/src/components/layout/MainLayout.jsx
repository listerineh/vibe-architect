/**
 * MainLayout Component
 * 
 * Primary layout wrapper that includes Header and Footer.
 * Use this as the main layout for most pages.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Page content
 * 
 * @example
 * <MainLayout>
 *   <YourPageContent />
 * </MainLayout>
 */

import { Header } from './Header';
import { Footer } from './Footer';

export function MainLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

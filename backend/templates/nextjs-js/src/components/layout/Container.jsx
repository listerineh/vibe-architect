/**
 * Container Component
 * 
 * Responsive container wrapper with max-width and padding.
 * Centers content and provides consistent spacing.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child elements
 * @param {string} [props.className] - Additional CSS classes
 * @param {'sm'|'md'|'lg'|'xl'|'full'} [props.size='lg'] - Container size
 * 
 * @example
 * <Container>
 *   <h1>Content goes here</h1>
 * </Container>
 */

import { cn } from '@/lib/utils';

const sizeClasses = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-7xl',
  xl: 'max-w-screen-2xl',
  full: 'max-w-full',
};

export function Container({ children, className, size = 'lg' }) {
  return (
    <div className={cn('container mx-auto px-4 sm:px-6 lg:px-8', sizeClasses[size], className)}>
      {children}
    </div>
  );
}

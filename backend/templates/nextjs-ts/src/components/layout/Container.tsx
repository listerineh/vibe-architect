/**
 * Container Component
 * 
 * Responsive container wrapper with max-width and padding.
 * Centers content and provides consistent spacing.
 * 
 * @example
 * <Container>
 *   <h1>Content goes here</h1>
 * </Container>
 */

import { cn } from '@/lib/utils';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const sizeClasses = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-7xl',
  xl: 'max-w-screen-2xl',
  full: 'max-w-full',
};

export function Container({ children, className, size = 'lg' }: ContainerProps) {
  return (
    <div className={cn('container mx-auto px-4 sm:px-6 lg:px-8', sizeClasses[size], className)}>
      {children}
    </div>
  );
}

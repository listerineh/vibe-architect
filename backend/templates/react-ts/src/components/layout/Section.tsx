/**
 * Section Component
 * 
 * Semantic section wrapper with consistent spacing.
 * Useful for organizing page content into logical sections.
 * 
 * @example
 * <Section>
 *   <h2>Section Title</h2>
 *   <p>Section content...</p>
 * </Section>
 */

import { cn } from '@/lib/utils';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
  id?: string;
}

const spacingClasses = {
  sm: 'py-8',
  md: 'py-12',
  lg: 'py-16',
  xl: 'py-24',
};

export function Section({ children, className, spacing = 'lg', id }: SectionProps) {
  return (
    <section id={id} className={cn(spacingClasses[spacing], className)}>
      {children}
    </section>
  );
}

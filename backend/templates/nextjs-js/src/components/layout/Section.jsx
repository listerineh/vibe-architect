/**
 * Section Component
 * 
 * Semantic section wrapper with consistent spacing.
 * Useful for organizing page content into logical sections.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child elements
 * @param {string} [props.className] - Additional CSS classes
 * @param {'sm'|'md'|'lg'|'xl'} [props.spacing='lg'] - Vertical spacing
 * @param {string} [props.id] - Section ID for anchor links
 * 
 * @example
 * <Section>
 *   <h2>Section Title</h2>
 *   <p>Section content...</p>
 * </Section>
 */

import { cn } from '@/lib/utils';

const spacingClasses = {
  sm: 'py-8',
  md: 'py-12',
  lg: 'py-16',
  xl: 'py-24',
};

export function Section({ children, className, spacing = 'lg', id }) {
  return (
    <section id={id} className={cn(spacingClasses[spacing], className)}>
      {children}
    </section>
  );
}

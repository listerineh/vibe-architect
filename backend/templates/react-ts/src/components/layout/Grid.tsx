/**
 * Grid Component
 * 
 * Responsive grid layout with customizable columns.
 * Simplifies creating responsive grid layouts.
 * 
 * @example
 * <Grid cols={{ sm: 1, md: 2, lg: 3 }}>
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 *   <div>Item 3</div>
 * </Grid>
 */

import { cn } from '@/lib/utils';

interface GridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'sm' | 'md' | 'lg' | 'xl';
}

const gapClasses = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
};

export function Grid({ children, className, cols = { sm: 1, md: 2, lg: 3 }, gap = 'md' }: GridProps) {
  const gridCols = cn(
    'grid',
    cols.sm && `grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
    gapClasses[gap],
    className
  );

  return (
    <div className={gridCols}>
      {children}
    </div>
  );
}

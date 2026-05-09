/**
 * Grid Component
 * 
 * Responsive grid layout with customizable columns.
 * Simplifies creating responsive grid layouts.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Grid items
 * @param {string} [props.className] - Additional CSS classes
 * @param {Object} [props.cols] - Column configuration per breakpoint
 * @param {number} [props.cols.sm] - Columns on small screens
 * @param {number} [props.cols.md] - Columns on medium screens
 * @param {number} [props.cols.lg] - Columns on large screens
 * @param {number} [props.cols.xl] - Columns on extra large screens
 * @param {'sm'|'md'|'lg'|'xl'} [props.gap='md'] - Gap between items
 * 
 * @example
 * <Grid cols={{ sm: 1, md: 2, lg: 3 }}>
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 *   <div>Item 3</div>
 * </Grid>
 */

import { cn } from '@/lib/utils';

const gapClasses = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
};

export function Grid({ children, className, cols = { sm: 1, md: 2, lg: 3 }, gap = 'md' }) {
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

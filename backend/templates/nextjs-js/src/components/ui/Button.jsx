/**
 * Button Component
 * 
 * Reusable button component with multiple variants and sizes.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button content
 * @param {'primary'|'secondary'|'outline'|'ghost'} [props.variant='primary'] - Button style variant
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Button size
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.disabled] - Disabled state
 * @param {Function} [props.onClick] - Click handler
 * 
 * @example
 * <Button variant="primary" size="md" onClick={() => console.log('clicked')}>
 *   Click me
 * </Button>
 */

import { cn } from '@/lib/utils';

const variantClasses = {
  primary: 'bg-indigo-500 text-white hover:bg-indigo-600',
  secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
  outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
  ghost: 'text-gray-700 hover:bg-gray-100',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  onClick,
  ...props
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

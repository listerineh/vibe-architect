/**
 * Utility Functions
 * 
 * Common helper functions used throughout the application.
 * These utilities promote code reuse and maintain consistency.
 */

/**
 * Merges class names conditionally
 * Useful for dynamic Tailwind CSS classes
 * 
 * @example
 * cn('base-class', isActive && 'active-class', 'another-class')
 */
export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Formats a date to a readable string
 * @param date - Date object or ISO string
 * @param locale - Locale for formatting (default: 'en-US')
 * 
 * @example
 * formatDate(new Date()) // "Jan 1, 2024"
 */
export function formatDate(date: Date | string, locale = 'en-US'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(dateObj);
}

/**
 * Delays execution for a specified time
 * Useful for animations or API rate limiting
 * 
 * @example
 * await sleep(1000); // Wait 1 second
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Truncates text to a specified length
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @param suffix - Suffix to add when truncated (default: '...')
 * 
 * @example
 * truncate('Long text here', 10) // "Long text..."
 */
export function truncate(text: string, maxLength: number, suffix = '...'): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Capitalizes the first letter of a string
 * 
 * @example
 * capitalize('hello world') // "Hello world"
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Formats a number as currency
 * @param amount - Number to format
 * @param currency - Currency code (default: 'USD')
 * @param locale - Locale for formatting (default: 'en-US')
 * 
 * @example
 * formatCurrency(1234.56) // "$1,234.56"
 */
export function formatCurrency(
  amount: number,
  currency = 'USD',
  locale = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Debounces a function call
 * Useful for search inputs or resize handlers
 * 
 * @example
 * const debouncedSearch = debounce((query) => search(query), 300);
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Generates a random ID
 * Useful for temporary keys or unique identifiers
 * 
 * @example
 * generateId() // "abc123def456"
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

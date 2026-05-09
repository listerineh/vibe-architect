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
 * @param {...(string|undefined|null|false)} classes - Class names to merge
 * @returns {string} Merged class names
 * 
 * @example
 * cn('base-class', isActive && 'active-class', 'another-class')
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Formats a date to a readable string
 * @param {Date|string} date - Date object or ISO string
 * @param {string} locale - Locale for formatting (default: 'en-US')
 * @returns {string} Formatted date string
 * 
 * @example
 * formatDate(new Date()) // "Jan 1, 2024"
 */
export function formatDate(date, locale = 'en-US') {
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
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 * 
 * @example
 * await sleep(1000); // Wait 1 second
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Truncates text to a specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @param {string} suffix - Suffix to add when truncated (default: '...')
 * @returns {string} Truncated text
 * 
 * @example
 * truncate('Long text here', 10) // "Long text..."
 */
export function truncate(text, maxLength, suffix = '...') {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Capitalizes the first letter of a string
 * 
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 * 
 * @example
 * capitalize('hello world') // "Hello world"
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Formats a number as currency
 * @param {number} amount - Number to format
 * @param {string} currency - Currency code (default: 'USD')
 * @param {string} locale - Locale for formatting (default: 'en-US')
 * @returns {string} Formatted currency string
 * 
 * @example
 * formatCurrency(1234.56) // "$1,234.56"
 */
export function formatCurrency(amount, currency = 'USD', locale = 'en-US') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Debounces a function call
 * Useful for search inputs or resize handlers
 * 
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait
 * @returns {Function} Debounced function
 * 
 * @example
 * const debouncedSearch = debounce((query) => search(query), 300);
 */
export function debounce(func, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Generates a random ID
 * Useful for temporary keys or unique identifiers
 * 
 * @returns {string} Random ID
 * 
 * @example
 * generateId() // "abc123def456"
 */
export function generateId() {
  return Math.random().toString(36).substring(2, 15);
}

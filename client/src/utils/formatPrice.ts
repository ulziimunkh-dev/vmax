/**
 * Utility functions for Mongolian price formatting and parsing
 */

/**
 * Format a number or numeric string with thousand separators (e.g. 850000000 -> "850,000,000")
 */
export function formatPriceWithCommas(value: number | string | undefined | null): string {
  if (value === undefined || value === null || value === '') return '';
  const numStr = value.toString().replace(/\D/g, '');
  if (!numStr) return '';
  return Number(numStr).toLocaleString('en-US');
}

/**
 * Extract raw digits from formatted price string (e.g. "850,000,000" -> "850000000")
 */
export function parsePrice(formatted: string | undefined | null): string {
  if (!formatted) return '';
  return formatted.toString().replace(/\D/g, '');
}

/**
 * Convert a numeric price into human-friendly Mongolian words:
 * - 3000000000 -> "3 тэрбум ₮"
 * - 850000000 -> "850 сая ₮"
 * - 1800000 -> "1.8 сая ₮"
 * - 350000 -> "350 мянга ₮"
 */
export function formatPriceMongolianWords(value: number | string | undefined | null): string {
  if (value === undefined || value === null || value === '') return '';
  const num = typeof value === 'number' ? value : Number(value.toString().replace(/\D/g, ''));
  if (isNaN(num) || num <= 0) return '';

  if (num >= 1_000_000_000) {
    const billions = num / 1_000_000_000;
    const rounded = Number.isInteger(billions) ? billions.toString() : billions.toFixed(2).replace(/\.?0+$/, '');
    return `${rounded}\u00A0тэрбум\u00A0₮`;
  }

  if (num >= 1_000_000) {
    const millions = num / 1_000_000;
    const rounded = Number.isInteger(millions) ? millions.toString() : millions.toFixed(2).replace(/\.?0+$/, '');
    return `${rounded}\u00A0сая\u00A0₮`;
  }

  if (num >= 1_000) {
    const thousands = num / 1_000;
    const rounded = Number.isInteger(thousands) ? thousands.toString() : thousands.toFixed(1).replace(/\.?0+$/, '');
    return `${rounded}\u00A0мянга\u00A0₮`;
  }

  return `${num.toLocaleString('en-US')}\u00A0₮`;
}

/**
 * Format price with currency symbol (e.g. "850,000,000 ₮")
 */
export function formatPriceFull(value: number | string | undefined | null): string {
  if (value === undefined || value === null || value === '') return '0 ₮';
  const num = typeof value === 'number' ? value : Number(value.toString().replace(/\D/g, ''));
  if (isNaN(num)) return '0 ₮';
  return `${num.toLocaleString('en-US')} ₮`;
}

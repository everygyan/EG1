/**
 * Shared formatting utilities for EveryGyan
 * Provides standardized, consistent human-readable date and reading time formatting across all components.
 */

/**
 * Formats any date input (string, Date, timestamp) into standard human-readable format:
 * "Oct 18, 2026"
 *
 * Handles:
 * - Pre-formatted strings like "Oct 18, 2026" or "Oct 09, 2026"
 * - Numeric slash dates like "10/18/2026" or "6/18/2026"
 * - ISO strings like "2026-10-18T14:30:00Z"
 * - Date objects and millisecond timestamps
 */
export function formatArticleDate(dateInput: string | Date | number | undefined | null): string {
  if (!dateInput) return 'Recent';

  if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim();
    // Return immediately if already formatted cleanly as "Mmm DD, YYYY"
    if (/^[A-Za-z]{3}\s+\d{1,2},\s+\d{4}$/.test(trimmed)) {
      return trimmed;
    }
  }

  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) {
      return typeof dateInput === 'string' ? dateInput : 'Recent';
    }
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return typeof dateInput === 'string' ? dateInput : 'Recent';
  }
}

/**
 * Standardizes reading time into a uniform "X min read" format.
 *
 * Handles:
 * - "3 MIN READ" -> "3 min read"
 * - "3 MIN" -> "3 min read"
 * - "3 min read" -> "3 min read"
 * - Numbers like 5 -> "5 min read"
 */
export function formatReadingTime(readTimeInput: string | number | undefined | null): string {
  if (readTimeInput === undefined || readTimeInput === null || readTimeInput === '') {
    return '3 min read';
  }

  if (typeof readTimeInput === 'number') {
    return `${Math.max(1, Math.round(readTimeInput))} min read`;
  }

  const match = String(readTimeInput).match(/\d+/);
  if (match) {
    return `${match[0]} min read`;
  }

  return '3 min read';
}

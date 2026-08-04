/**
 * `new Date("2026-08-15")` parses date-only strings as UTC midnight, which `toLocaleDateString()`
 * then renders in the browser's local timezone -- for any timezone behind UTC, that rolls the
 * displayed calendar date back a day. Parsing the components directly and constructing a local
 * `Date` avoids the round trip through UTC entirely.
 */
export function parseDateOnly(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Formats a "YYYY-MM-DD" date-only string using the local calendar date, not UTC. */
export function formatDateOnly(
  dateStr: string,
  locale?: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  return parseDateOnly(dateStr).toLocaleDateString(locale, options);
}

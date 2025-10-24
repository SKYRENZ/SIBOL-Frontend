/**
 * Phone utilities for Philippine numbers (local format with leading 0).
 * - formatForDisplay("09171234567") => "0917 123 4567"
 * - normalizeToLocal09("09171234567"|"9171234567"|"639171234567") => "09171234567" or null
 */
export const formatContactDisplay = (input: string | undefined | null): string => {
  const d = String(input ?? '').replace(/\D/g, '');
  if (!d) return '';
  if (d.length <= 4) return d;
  if (d.length <= 7) return `${d.slice(0,4)} ${d.slice(4)}`;
  return `${d.slice(0,4)} ${d.slice(4,7)} ${d.slice(7,11)}`;
};

export const normalizeToLocal09 = (input: string | undefined | null): string | null => {
  const digits = String(input ?? '').replace(/\D/g, '');
  if (!digits) return null;
  // 09xxxxxxxxx (11) -> keep
  if (digits.length === 11 && digits.startsWith('09')) return digits;
  // 9xxxxxxxxx (10) -> prefix 0
  if (digits.length === 10 && digits.startsWith('9')) return '0' + digits;
  // 639xxxxxxxxx (12) -> convert to 09...
  if (digits.length === 12 && digits.startsWith('63')) return '0' + digits.slice(2);
  return null;
};
export function normalizeBarangayId(value?: number | string | null): number | null {
  if (value === null || value === undefined) return null;
  const n = typeof value === 'string' ? Number(value) : value;
  return Number.isFinite(n) ? (n as number) : null;
}

export function filterByBarangay<T extends { Barangay_id?: number | string | null }>(
  items: T[],
  barangayId?: number | string | null
): T[] {
  const target = normalizeBarangayId(barangayId);
  if (!target) return [];
  return items.filter((item) => normalizeBarangayId(item.Barangay_id) === target);
}

export function sortByBarangayName<T extends { Barangay_Name?: string | null }>(items: T[]): T[] {
  return [...items].sort((a, b) => String(a.Barangay_Name ?? '').localeCompare(String(b.Barangay_Name ?? '')));
}

export function filterAndSortByBarangay<T extends { Barangay_id?: number | string | null; Barangay_Name?: string | null }>(
  items: T[],
  barangayId?: number | string | null
): T[] {
  return sortByBarangayName(filterByBarangay(items, barangayId));
}

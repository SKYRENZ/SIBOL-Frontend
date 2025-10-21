
// filepath: c:\Users\Renz\OneDrive\Documents\GitHub\SIBOL\SIBOL-Frontend\src\services/normalizeModules.ts
export type ModuleItem = { id?: number; key?: string; path?: string; name?: string };

/**
 * Normalize modules payload returned by API into an array and provide
 * a safe hasModule() helper used by components.
 */
export function normalizeModules(payload: any) {
  let list: ModuleItem[] = [];

  if (!payload) list = [];
  else if (Array.isArray(payload)) list = payload;
  else if (typeof payload === 'object') {
    // If API returns an object where keys are module keys
    // convert to array of { key, ...value }
    list = Object.entries(payload).map(([k, v]) =>
      typeof v === 'object' ? { key: k, ...(v as any) } : { key: k, value: v }
    );
  }

  const byKey = new Map<string, ModuleItem>();
  for (const item of list) {
    if (item.key) byKey.set(String(item.key), item);
    if (item.path) byKey.set(String(item.path), item);
    if (item.id != null) byKey.set(String(item.id), item);
    if (item.name) byKey.set(String(item.name).toLowerCase(), item);
  }

  return {
    list,
    get: (k: string | number) => byKey.get(String(k)),
    has: (k: string | number) => byKey.has(String(k)),
  };
}
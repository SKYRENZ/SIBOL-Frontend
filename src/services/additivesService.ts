export const listAdditives = async (machine_id?: number) => {
  const url = machine_id ? `/api/additives?machine_id=${machine_id}` : '/api/additives';
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error(`listAdditives failed: ${res.status}`);
  return res.json();
};

export const createAdditive = async (payload: any) => {
  const res = await fetch('/api/additives', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`createAdditive failed: ${res.status}`);
  return res.json();
};
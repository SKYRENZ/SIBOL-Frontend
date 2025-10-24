// new file
export async function getProfileByAccountId(accountId: number) {
  if (!accountId) return null;
  const res = await fetch(`/api/profile/${accountId}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data?.data ?? null;
}
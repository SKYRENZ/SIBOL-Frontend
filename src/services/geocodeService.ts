import { fetchJson } from './apiClient';

export const searchBoundaryGeoJSON = async (query: string, limit = 1) => {
  const normalizedLimit = Math.max(1, Math.min(5, Math.floor(limit)));
  return fetchJson<any>(
    `/api/map/geocode/search?query=${encodeURIComponent(query)}&limit=${normalizedLimit}`
  );
};

export const reverseGeocode = async (lat: number, lon: number) => {
  return fetchJson<any>(
    `/api/map/geocode/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&zoom=18&addressdetails=1`
  );
};

import { useState, useEffect } from 'react';
import FiltersService, { FilterItem } from '../../services/filtersService';

// ✅ Add index signature to match FilterData from service
type FilterData = Record<string, FilterItem[]>;

const useFilters = (types?: string | string[]) => {
  const [filters, setFilters] = useState<FilterData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFilters = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!types) {
          // Fetch all filters
          const data = await FiltersService.getAllFilters();
          // ✅ Convert FilterData to Record<string, FilterItem[]>
          setFilters(data as Record<string, FilterItem[]>);
        } else if (typeof types === 'string') {
          // Fetch single filter type
          const data = await FiltersService.getFilter(types);
          setFilters({ [types]: data });
        } else {
          // Fetch multiple specific filter types
          const data = await FiltersService.getFiltersByTypes(types);
          setFilters(data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load filters');
        console.error('Filter fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilters();
  }, [types?.toString()]); // ✅ Better dependency

  const get = (key: string) => filters[key] || [];

  return { filters, get, loading, error };
};

export default useFilters;
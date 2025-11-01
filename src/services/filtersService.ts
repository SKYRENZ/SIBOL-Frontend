import apiClient from './apiClient';

export type FilterItem = { id: number; name: string };
export type AllFilters = {
  machineStatuses: FilterItem[];
  maintenancePriorities: FilterItem[];
  maintenanceStatuses: FilterItem[];
  scheduleStatuses: FilterItem[];
};

const BASE = '/api/filters';

const FiltersService = {
  async getAllFilters(): Promise<AllFilters> {
    const res = await apiClient.get(BASE);
    if (!res?.data?.success) throw new Error(res?.data?.message || 'Failed to load filters');
    return res.data.data as AllFilters;
  },

  async getFilter(type: string): Promise<FilterItem[]> {
    const res = await apiClient.get(`${BASE}/${encodeURIComponent(type)}`);
    if (!res?.data?.success) throw new Error(res?.data?.message || 'Failed to load filter');
    return res.data.data as FilterItem[];
  },

  // New method: fetch multiple specific filter types
  async getFiltersByTypes(types: string[]): Promise<Record<string, FilterItem[]>> {
    const promises = types.map(type => 
      this.getFilter(type).then(data => ({ type, data }))
    );
    const results = await Promise.all(promises);
    
    const filters: Record<string, FilterItem[]> = {};
    results.forEach(({ type, data }) => {
      filters[type] = data;
    });
    return filters;
  },

  toOptions(items: FilterItem[]) {
    return items.map(i => ({ value: String(i.id), label: i.name }));
  }
};

export default FiltersService;
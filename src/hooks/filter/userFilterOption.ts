import { useEffect, useState } from "react";
import api from "../../services/apiClient"; // <-- adjust the import path to your api client

export interface FilterCategories {
  [category: string]: string[];
}

export const useFilterOptions = () => {
  const [categories, setCategories] = useState<FilterCategories>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        setLoading(true);
        // <-- FIX: call the correct mounted backend route
        const res = await api.get("/api/filters");

        // res.data is the parsed payload from the backend.
        // Backend shape is commonly: { success: true, data: { machineStatuses: [{id,name}, ...], ... } }
        const payload = res.data ?? {};
        const dataObj = payload?.data ?? payload;

        // Normalize to { category: string[] } where each option is a display string
        const normalized: FilterCategories = {};
        if (dataObj && typeof dataObj === "object") {
          Object.entries(dataObj).forEach(([key, val]) => {
            if (Array.isArray(val)) {
              normalized[key] = val.map((it: any) =>
                typeof it === "string" ? it : (it?.name ?? it?.label ?? String(it))
              );
            } else {
              normalized[key] = [];
            }
          });
        }

        setCategories(normalized);
      } catch (err: any) {
        console.error("Failed to load filter data", err);
        setError("Failed to load filters");
      } finally {
        setLoading(false);
      }
    };

    fetchFilters();
  }, []);

  return { categories, loading, error };
};

export default useFilterOptions;

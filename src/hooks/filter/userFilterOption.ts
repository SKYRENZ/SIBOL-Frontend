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
        const res = await api.get("/filters"); // ✅ backend endpoint (adjust path)
        // Expected format: { Status: ["Claimed","Unclaimed"], Reward: [...], "Date Claimed": [...] }
        setCategories(res.data);
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

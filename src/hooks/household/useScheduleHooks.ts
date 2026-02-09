import { useEffect, useState } from "react";
import * as areaService from "../../services/Schedule/areaService";
import * as operatorService from "../../services/Schedule/operatorService";

export function useAreas() {
  const [areas, setAreas] = useState<areaService.Area[]>([]);
  const [idToName, setIdToName] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await areaService.getAllAreas();
      const list = response.data; // Extract the data array
      setAreas(list);
      const map: Record<string, string> = {};
      list.forEach(a => { map[String(a.Area_id)] = a.Area_Name; });
      setIdToName(map);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load areas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const areaMap: Record<number | string, string> = {};
  Object.entries(idToName).forEach(([k, v]) => { areaMap[Number(k)] = v; areaMap[k] = v; });

  return { areas, idToName, areaMap, loading, error, reload: load };
}

export function useOperators() {
  const [operators, setOperators] = useState<operatorService.Operator[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await operatorService.getAllOperators();
      setOperators(list ?? []);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load operators");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return { operators, loading, error, reload: load };
}
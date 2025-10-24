import { useEffect, useState } from "react";
import * as scheduleService from "../../services/Schedule/scheduleService";
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
      const list = await areaService.getAllAreas();
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

  // convenience map typed as number -> name too
  const areaMap: Record<number | string, string> = {};
  Object.entries(idToName).forEach(([k, v]) => { areaMap[Number(k)] = v; areaMap[k] = v; });

  return { areas, idToName, areaMap, loading, error, reload: load };
}

export function useSchedules() {
  const [schedules, setSchedules] = useState<scheduleService.Schedule[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const normalizeToLocal09 = (input: any): string => {
    const digits = String(input ?? '').replace(/\D/g, '');
    if (digits.length === 12 && digits.startsWith('63')) return '0' + digits.slice(2); // 639xxxxxxxxx -> 09xxxxxxxxx
    if (digits.length === 11 && digits.startsWith('09')) return digits; // already local
    if (digits.length === 10 && digits.startsWith('9')) return '0' + digits; // 9xxxxxxxxx -> 09xxxxxxxxx
    // fallback: return raw digits (keeps existing value so you can spot bad data)
    return digits;
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await scheduleService.getAllSchedules();
      // normalize Contact to local '09xxxxxxxxx' string to keep UI consistent
      const normalized = (data ?? []).map((s: any) => ({
        ...s,
        Contact: normalizeToLocal09(s?.Contact),
      }));
      setSchedules(normalized);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load schedules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return { schedules, setSchedules, loading, error, reload: load };
}

// NEW: hook to fetch operators (used by AddSchedule modal)
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

export function useEditScheduleForm(initialData: any, idToName: Record<string, string>) {
  const [formData, setFormData] = useState({
    maintenance: "",
    contact: "",
    area: [] as string[],
    date: "",
  });

  useEffect(() => {
    if (!initialData) {
      setFormData({ maintenance: "", contact: "", area: [], date: "" });
      return;
    }
    const incomingAreas = Array.isArray(initialData.area) ? initialData.area : (initialData.area ? [initialData.area] : []);
    const mapped = incomingAreas.map((a: any) => idToName[String(a)] ?? String(a));
    setFormData({
      maintenance: initialData.maintenance ?? "",
      contact: initialData.contact ?? "",
      area: mapped,
      date: initialData.date ?? "",
    });
  }, [initialData, idToName]);

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (selected: string[]) => {
    setFormData(prev => ({ ...prev, area: selected }));
  };

  const addArea = (name: string) => {
    if (!name) return;
    setFormData(prev => prev.area.includes(name) ? prev : ({ ...prev, area: [...prev.area, name] }));
  };

  const removeArea = (name: string) => {
    setFormData(prev => ({ ...prev, area: prev.area.filter(a => a !== name) }));
  };

  const reset = () => setFormData({ maintenance: "", contact: "", area: [], date: "" });

  return {
    formData,
    setFormData,
    handleChange,
    handleSelectChange,
    addArea,
    removeArea,
    reset,
  };
}
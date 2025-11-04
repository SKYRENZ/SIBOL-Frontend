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

export function useSchedules() {
  const [schedules, setSchedules] = useState<scheduleService.Schedule[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      // First load areas to get the mapping
      const areaResponse = await areaService.getAllAreas();
      const areaList = areaResponse.data; // Extract the data array
      const areaMap: Record<number | string, string> = {};
      areaList.forEach(a => { 
        areaMap[a.Area_id] = a.Area_Name; 
        areaMap[String(a.Area_id)] = a.Area_Name;
      });

      const data = await scheduleService.getAllSchedules();
      
      // Map area IDs to names
      const enriched = (data ?? []).map((schedule: any) => {
        let mappedArea: any = schedule.Area;
        
        if (typeof schedule.Area === 'number') {
          mappedArea = areaMap[schedule.Area] ?? String(schedule.Area);
        } else if (typeof schedule.Area === 'string' && schedule.Area.includes(',')) {
          mappedArea = schedule.Area.split(',')
            .map((id: string) => areaMap[id.trim()] ?? id.trim())
            .join(', ');
        } else if (Array.isArray(schedule.Area)) {
          mappedArea = schedule.Area
            .map((id: any) => areaMap[id] ?? String(id))
            .join(', ');
        }
        
        return {
          ...schedule,
          Area: mappedArea,
        };
      });
      
      setSchedules(enriched);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load schedules");
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return { schedules, setSchedules, loading, error, reload: load };
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
    
    // Handle area as comma-separated string or array
    let incomingAreas: string[] = [];
    if (Array.isArray(initialData.area)) {
      incomingAreas = initialData.area;
    } else if (typeof initialData.area === 'string') {
      // Split by comma and trim whitespace
      incomingAreas = initialData.area.split(',').map((a: string) => a.trim()).filter((a: string) => a);
    } else if (initialData.area) {
      incomingAreas = [String(initialData.area)];
    }
    
    // Map IDs to names if needed
    const mapped = incomingAreas.map((a: any) => idToName[String(a)] ?? a);
    
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
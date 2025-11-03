import React, { useState, useEffect, useRef } from "react";
import { CalendarDays } from "lucide-react";
import FormModal from "../common/FormModal";
import FormField from "../common/FormField";
import * as scheduleService from '../../services/Schedule/scheduleService';

import { useAreas, useOperators, useSchedules } from '../../hooks/household/useScheduleHooks';

interface AddScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddScheduleModal: React.FC<AddScheduleModalProps> = ({
  isOpen,
  onClose,
}) => {
  // form state
  const [formData, setFormData] = useState({
    Account_id: '',
    Area: [] as string[],
    sched_stat_id: 2,
    Date_of_collection: '',
  });
  const [saving, setSaving] = useState(false);

  // hooks must be unconditional
  const { areas } = useAreas();
  const { operators } = useOperators();
  const { reload: reloadSchedules } = useSchedules();

  useEffect(() => {
    if (isOpen) {
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 2);
      setFormData(prev => ({ ...prev, Date_of_collection: defaultDate.toISOString().split('T')[0] }));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Area helpers (same behavior as EditScheduleModal)
  const handleAreaAdd = (areaName: string) => {
    if (!areaName) return;
    setFormData(prev => {
      if ((prev.Area as string[]).includes(areaName)) return prev;
      return { ...prev, Area: [...(prev.Area as string[]), areaName] };
    });
  };

  const handleAreaRemove = (areaName: string) => {
    setFormData(prev => ({ ...prev, Area: (prev.Area as string[]).filter(a => a !== areaName) }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const accountId = Number(formData.Account_id);
      if (!accountId) {
        alert('Please select an operator.');
        setSaving(false);
        return;
      }

      // Map selected area names -> numeric IDs when possible
      const nameToId = new Map<string, number>();
      areas.forEach(a => nameToId.set(a.Area_Name, a.Area_id));
      const mappedIds = (formData.Area as string[]).map(n => nameToId.get(n)).filter((v): v is number => typeof v === 'number');

      let areaForPayload: number | string | number[] | string[] = formData.Area as string[];
      if (mappedIds.length === 1) areaForPayload = mappedIds[0];
      else if (mappedIds.length > 1) areaForPayload = mappedIds.join(',');

      const payload: Omit<scheduleService.Schedule, 'Schedule_id'> = {
        Account_id: accountId,
        Collector: operators.find(op => String(op.Account_id) === formData.Account_id)?.Username || '',
        Contact: '', // Backend will fetch from profile
        Area: areaForPayload,
        sched_stat_id: Number(formData.sched_stat_id),
        Date_of_collection: formData.Date_of_collection,
      };

      // Send to backend
      await scheduleService.createSchedule(payload);

      // reload schedules so UI shows server-truth
      await reloadSchedules();

      onClose();
    } catch (err: any) {
      alert(`Failed to create schedule: ${err?.message ?? 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const operatorOptions = operators.map(op => ({ value: String(op.Account_id), label: op.Username }));

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Schedule"
      subtitle="Fill out the form below to add a new collection schedule."
      icon={<CalendarDays size={22} />}
      width="600px"
    >
      <form className="space-y-4">
        <FormField
          label="Maintenance Person (Operator)"
          name="Account_id"
          type="select"
          value={formData.Account_id}
          onChange={handleChange}
          options={operatorOptions}
        />

        {/* Contact removed — contact fetched from profile table by operator selection */}

        {/* Area combobox (tags + searchable input) — same UX as EditScheduleModal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
          <div className="w-full border border-gray-300 rounded-md px-3 py-2 bg-transparent relative">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {(formData.Area as string[]).map((areaName, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center bg-green-100 text-green-800 text-sm font-medium rounded-full px-3 py-1 mr-2 mb-2"
                >
                  {areaName}
                  <button
                    type="button"
                    onClick={() => handleAreaRemove(areaName)}
                    className="ml-2 text-green-800 hover:text-green-600 focus:outline-none bg-transparent p-0"
                    aria-label={`Remove ${areaName}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* reuse same AreaCombobox implementation inline */}
            <AreaCombobox
              available={areas}
              valueList={formData.Area as string[]}
              onAdd={(name: string) => handleAreaAdd(name)}
            />
          </div>
        </div>

        <FormField
          label="Date of Collection (defaults to every 2 days, editable)"
          name="Date_of_collection"
          type="date"
          value={formData.Date_of_collection}
          onChange={handleChange}
        />

        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="bg-[#2E523A] hover:bg-[#3b6b4c] text-white font-medium px-8 py-2.5 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#AFC8AD]/40"
          >
            {saving ? 'Saving...' : 'Save Schedule'}
          </button>
        </div>
      </form>
    </FormModal>
  );
};

export default AddScheduleModal;

/* Place AreaCombobox helper here (copied from editScheduleModal) */
const AreaCombobox: React.FC<{
  available: { Area_id: number; Area_Name: string }[];
  valueList: string[];
  onAdd: (name: string) => void;
}> = ({ available, valueList, onAdd }) => {
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const suggestions = available
    .map(a => a.Area_Name)
    .filter(name => name.toLowerCase().includes(input.trim().toLowerCase()) && !valueList.includes(name));

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => { setInput(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const val = input.trim();
              if (val) {
                onAdd(val);
                setInput("");
                setOpen(false);
                e.preventDefault();
              }
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          placeholder="Search or type area name and hit Enter"
          className="w-full bg-transparent border-none focus:outline-none text-sm py-1 text-gray-900 placeholder-gray-400 caret-gray-900"
        />
      </div>

      {open && (suggestions.length > 0) && (
        <ul className="absolute z-20 left-0 right-0 mt-1 max-h-40 overflow-auto bg-white border border-gray-200 rounded-md shadow-sm">
          {suggestions.map((s, i) => (
            <li
              key={i}
              onMouseDown={(e) => { e.preventDefault(); onAdd(s); setInput(""); setOpen(false); }}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-900"
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

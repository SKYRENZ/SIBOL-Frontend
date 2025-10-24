import React, { useState, useRef, useEffect } from "react";
import FormModal from "../common/FormModal";
import FormField from "../common/FormField";
import * as areaService from '../../services/Schedule/areaService';
import { normalizeToLocal09 } from '../../utils/phone';

interface EditScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: {
    maintenance: string;
    // include Account_id so we can later fetch profile contact from backend
    Account_id?: number;
    area: string[];
    date: string;
  } | null;
  onSave: (data: {
    maintenance: string;
    // include Account_id so parent can fetch contact
    Account_id?: number;
    area: string[];
    date: string;
  }) => void;
}

const EditScheduleModal: React.FC<EditScheduleModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    maintenance: "",
    // store digits-only local form (e.g. "09171234567" or "9171234567")
    contact: "",
    area: [] as string[],
    date: "",
  });

  const [contactError, setContactError] = useState<string | null>(null);

  const [areas, setAreas] = useState<{ Area_id: number; Area_Name: string }[]>([]);
  const [idToName, setIdToName] = useState<Record<string, string>>({});

  useEffect(() => {
    // load area list once (used to map IDs -> names and populate select)
    const loadAreas = async () => {
      try {
        const list = await areaService.getAllAreas();
        setAreas(list);
        const map: Record<string, string> = {};
        list.forEach(a => {
          map[String(a.Area_id)] = a.Area_Name;
        });
        setIdToName(map);
      } catch (err) {
        console.error('Failed to load areas', err);
      }
    };
    loadAreas();
  }, []);

  useEffect(() => {
    if (initialData) {
      const incomingAreas = Array.isArray(initialData.area) ? initialData.area : (initialData.area ? [initialData.area] : []);
      const mapped = incomingAreas.map((a: any) => idToName[String(a)] ?? String(a));

      setFormData({
        maintenance: initialData.maintenance ?? '',
        contact: '',
        area: mapped,
        date: initialData.date ?? '',
      });
    } else {
      setFormData({ maintenance: '', contact: '', area: [], date: '' });
    }
  }, [initialData, idToName]);

  // handleChange sanitizes contact input digits only
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'contact') {
      const digits = value.replace(/\D/g, '').slice(0, 11);
      setFormData(prev => ({ ...prev, [name]: digits }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAreaAdd = (areaName: string) => {
    if (!areaName) return;
    setFormData((prev) => {
      if (prev.area.includes(areaName)) return prev;
      return {
        ...prev,
        area: [...prev.area, areaName],
      };
    });
  };

  const handleAreaRemove = (areaName: string) => {
    setFormData((prev) => ({
      ...prev,
      area: prev.area.filter((a) => a !== areaName),
    }));
  };

  const handleSave = () => {
    // Contact not edited here — return Account_id (if provided) so parent can fetch profile contact
    onSave({ maintenance: formData.maintenance, Account_id: initialData?.Account_id, area: formData.area, date: formData.date });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Schedule"
      subtitle="Modify your scheduled collection area or assignment."
      width="720px"
    >
      <form className="grid grid-cols-2 gap-x-8 gap-y-4">
        <FormField
          label="Maintenance"
          name="maintenance"
          type="text"
          value={formData.maintenance}
          onChange={handleChange}
          placeholder="Enter maintenance name"
        />

        {/* Contact removed — contact comes from profile table */}

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Area
          </label>

          {/* Combobox / typeahead alternative */}
          <div className="w-full border border-gray-300 rounded-md px-3 py-2 bg-transparent relative">
            {/* selected tags */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {formData.area.map((areaName, idx) => (
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

            {/* Searchable input */}
            <AreaCombobox
              available={areas}
              valueList={formData.area}
              onAdd={(name: string) => handleAreaAdd(name)}
            />
          </div>
        </div>

        <FormField
          label="Date of Collection"
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
        />
      </form>

      <div className="mt-8 flex justify-end gap-4">
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="bg-green-800 text-white px-6 py-2 rounded-md hover:bg-green-900 transition"
        >
          Save
        </button>
      </div>
    </FormModal>
  );
};

const AreaCombobox: React.FC<{
  available: { Area_id: number; Area_Name: string }[];
  valueList: string[];
  onAdd: (name: string) => void;
}> = ({ available, valueList, onAdd }) => {
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

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

  const addAndRefocus = (val: string) => {
    onAdd(val);
    setInput("");
    setOpen(true);
    // refocus input next tick
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => { setInput(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const val = input.trim();
              if (val) {
                e.preventDefault();
                addAndRefocus(val);
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
              onMouseDown={(e) => { e.preventDefault(); addAndRefocus(s); }}
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

export default EditScheduleModal;

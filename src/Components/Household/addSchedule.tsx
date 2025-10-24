import React, { useState, useEffect } from "react";
import { CalendarDays } from "lucide-react";
import FormModal from "../common/FormModal";
import FormField from "../common/FormField";
import * as scheduleService from '../../services/Schedule/scheduleService';
import { formatContactDisplay, normalizeToLocal09 } from '../../utils/phone';
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
    Contact: '',
    Area: '',
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

  // sanitize contact input: digits only, max 11
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'Contact') {
      const digits = value.replace(/\D/g, '').slice(0, 11);
      setFormData(prev => ({ ...prev, [name]: digits }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const normalized = normalizeToLocal09(formData.Contact);
      if (!normalized) {
        alert('Contact must be a valid Philippine mobile number (09XXXXXXXXX)');
        setSaving(false);
        return;
      }

      const payload: Omit<scheduleService.Schedule, 'Schedule_id'> = {
        Account_id: Number(formData.Account_id),
        Contact: normalized, // send local "09..." string
        Area: Number(formData.Area) ? Number(formData.Area) : String(formData.Area),
        sched_stat_id: Number(formData.sched_stat_id),
        Date_of_collection: formData.Date_of_collection,
      };

      const created = await scheduleService.createSchedule(payload);

      // reload schedules so UI shows server-truth (and prevents mismatch)
      await reloadSchedules();

      onClose();
    } catch (err: any) {
      alert(`Failed to create schedule: ${err?.message ?? 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const operatorOptions = operators.map(op => ({ value: String(op.Account_id), label: op.Username }));
  const areaOptions = areas.map(a => ({ value: String(a.Area_id), label: a.Area_Name }));

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

        <FormField
          label="Contact"
          name="Contact"
          type="text"
          value={formatContactDisplay(formData.Contact)}
          onChange={handleChange}
          placeholder="0917 123 4567"
          inputMode="numeric"
          maxLength={14}
        />

        <FormField
          label="Area"
          name="Area"
          type="select"
          value={formData.Area}
          onChange={handleChange}
          options={areaOptions}
        />

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

import React, { useState, useEffect } from "react";
import { CalendarDays } from "lucide-react";
import FormModal from "../common/FormModal";
import FormField from "../common/FormField";
import * as scheduleService from '../../services/Schedule/scheduleService';
import * as areaService from '../../services/Schedule/areaService';
import * as operatorService from '../../services/Schedule/operatorService';

interface AddScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddScheduleModal: React.FC<AddScheduleModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    Account_id: '', 
    Contact: '',
    Area: '',
    sched_stat_id: 2,
    Date_of_collection: '',
  });
  const [saving, setSaving] = useState(false);
  const [areas, setAreas] = useState<areaService.Area[]>([]);
  const [operators, setOperators] = useState<operatorService.Operator[]>([]);

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          const [areasData, operatorsData] = await Promise.all([
            areaService.getAllAreas(),
            operatorService.getAllOperators(),
          ]);
          setAreas(areasData);
          setOperators(operatorsData);
        } catch (err) {
          console.error('Failed to load data:', err);
        }
      };
      fetchData();

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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...formData,
        Account_id: Number(formData.Account_id),
        Contact: formData.Contact,
        Area: Number(formData.Area),
      };
      await scheduleService.createSchedule(payload);
      alert('Schedule created successfully!');
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
          value={formData.Contact}
          onChange={handleChange}
          placeholder="Enter contact number"
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

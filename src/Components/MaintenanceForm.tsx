import React, { useState } from 'react';
import FormModal from './common/FormModal';
import FormField from './common/FormField';

interface MaintenanceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => void;
}

const MaintenanceForm: React.FC<MaintenanceFormProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    assignedTo: '',
    issue: '',
    priority: '',
    dueDate: '',
    file: null as File | null,
  });

  const assignedOptions = ['Justine Bryan M. Peralta', 'Mark Johnson', 'Karl Smith', 'Sarah Wilson'];
  const priorityOptions = [
    { value: 'Urgent', text: 'Urgent' },
    { value: 'Critical', text: 'Critical' },
    { value: 'Mild', text: 'Mild' },
  ];

  const generateRequestNumber = () => Math.floor(Math.random() * 100000) + 100000;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ requestNumber: generateRequestNumber(), ...formData });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  if (!isOpen) return null;

  const requestNumber = generateRequestNumber();

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Maintenance"
      subtitle="Fill up the forms for request maintenance"
      icon={
        <img
          src={new URL('../assets/images/tools 1.png', import.meta.url).href}
          alt="Tools"
          className="w-8 h-8"
        />
      }
      width="900px"
    >
      <div className="flex justify-between items-center mb-6">
        <span className="font-bold" style={{ color: '#2E523A' }}>Request no. {requestNumber}</span>
        <span className="text-gray-500">Request date: {new Date().toLocaleDateString()}</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left */}
          <div className="space-y-4">
            <FormField
              label="Assigned to"
              name="assignedTo"
              type="select"
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              options={assignedOptions.map(p => ({ value: p, label: p }))}
              required
              variant="transparent" // make input transparent
            />

            <FormField
              label="Issue"
              name="issue"
              type="textarea"
              value={formData.issue}
              onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
              placeholder="Describe the issue..."
              rows={5}
              required
              variant="transparent"
            />

            <FormField
              label="Priority"
              name="priority"
              type="select"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              options={priorityOptions.map(o => ({ value: o.value, label: o.text }))}
              required
              variant="transparent"
            />
          </div>

          {/* Right */}
          <div className="space-y-4">
            <FormField
              label="Due Date"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#2E523A' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
              required
              variant="transparent"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload File</label>
              <div className="border-2 border-dashed rounded-xl p-8 text-center bg-transparent" style={{ borderColor: '#2E523A' }}>
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#2E523A' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="mt-2" style={{ color: '#2E523A' }}>Click to Upload or drag & drop file</p>
                <p className="text-gray-500 text-sm">maximum file size 10MB</p>
                <input type="file" onChange={handleFileUpload} className="hidden" id="file-upload" accept="image/*" />
                <label htmlFor="file-upload" className="mt-2 inline-block cursor-pointer">
                  <span className="hover:opacity-80" style={{ color: '#2E523A' }}>Choose file</span>
                </label>
                {formData.file && (
                  <div className="mt-2 flex items-center justify-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#2E523A' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span style={{ color: '#2E523A' }}>{formData.file.name}</span>
                    <span className="text-gray-500">10MB</span>
                    <button type="button" onClick={() => setFormData({ ...formData, file: null })} className="text-red-500 hover:text-red-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-2">
          <button 
            type="submit" 
            className="bg-[#2E523A] hover:bg-[#3b6b4c] text-white font-medium px-8 py-2.5 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#AFC8AD]/40"
          >
            Assign
          </button>
        </div>
      </form>
    </FormModal>
  );
};

export default MaintenanceForm;

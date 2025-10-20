import React, { useState } from 'react';

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

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-4 border w-3/5 max-w-3xl shadow-lg rounded-xl bg-white">
        <div className="mt-2">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center">
              <img
                src={new URL('../assets/images/tools 1.png', import.meta.url).href}
                alt="Tools"
                className="w-8 h-8 mr-3"
              />
              <div>
                <h3 className="text-2xl font-bold" style={{ color: '#2E523A' }}>Request Maintenance</h3>
                <p className="text-sm" style={{ color: '#2E523A' }}>Fill up the forms for request maintenance</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex justify-between items-center mb-6">
            <span className="font-bold" style={{ color: '#2E523A' }}>Request no. {generateRequestNumber()}</span>
            <span className="text-gray-500">Request date: {new Date().toLocaleDateString()}</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left */}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#2E523A' }}>Assigned to</label>
                  <select
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-1"
                    style={{ borderColor: '#2E523A' }}
                    required
                  >
                    <option value="">Select Person</option>
                    {assignedOptions.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#2E523A' }}>Issue</label>
                  <textarea
                    value={formData.issue}
                    onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                    className="w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-1"
                    style={{ borderColor: '#2E523A' }}
                    rows={5}
                    placeholder="Describe the issue..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#2E523A' }}>Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-1"
                    style={{ borderColor: '#2E523A' }}
                    required
                  >
                    <option value="">Select Priority</option>
                    {priorityOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.text}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Right */}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#2E523A' }}>Due Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-1"
                      style={{ borderColor: '#2E523A' }}
                      required
                    />
                    <svg className="absolute right-3 top-3.5 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#2E523A' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#2E523A' }}>Upload File</label>
                  <div className="border-2 border-dashed rounded-xl p-8 text-center" style={{ borderColor: '#2E523A' }}>
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

            <div className="mt-8 text-center">
              <button type="submit" className="px-10 py-3 text-white rounded-lg font-medium transition-colors duration-200" style={{ backgroundColor: '#2E523A' }}>
                Assign
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceForm;

import React, { useState } from 'react';
import type { CreateContainerRequest } from '../../services/wasteContainerService';

interface AddWasteContainerFormProps {
  onSubmit: (payload: CreateContainerRequest) => Promise<boolean>;
  onCancel: () => void;
  loading?: boolean;
}

const AddWasteContainerForm: React.FC<AddWasteContainerFormProps> = ({ onSubmit, onCancel, loading = false }) => {
  const [containerName, setContainerName] = useState('');
  const [areaName, setAreaName] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetFields = () => {
    setContainerName('');
    setAreaName('');
    setFullAddress('');
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!containerName.trim() || !areaName.trim() || !fullAddress.trim()) {
      setError('Please fill all required fields.');
      return;
    }

    const payload: CreateContainerRequest = {
      container_name: containerName.trim(),
      area_name: areaName.trim(),
      fullAddress: fullAddress.trim(),
    };

    try {
      setSubmitting(true);
      const ok = await onSubmit(payload);
      if (ok) {
        resetFields();
      } else {
        setError('Failed to create container. Check input and try again.');
      }
    } catch (err) {
      console.error('Add container error:', err);
      setError('An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Container Name</label>
        <input
          type="text"
          value={containerName}
          onChange={(e) => setContainerName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:ring-[#355842] focus:border-[#355842]"
          placeholder="e.g. Block A - Container 1"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Area Name</label>
        <input
          type="text"
          value={areaName}
          onChange={(e) => setAreaName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:ring-[#355842] focus:border-[#355842]"
          placeholder="e.g. Barangay 1"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Full Address</label>
        <input
          type="text"
          value={fullAddress}
          onChange={(e) => setFullAddress(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:ring-[#355842] focus:border-[#355842]"
          placeholder="Street, City, Province"
          required
        />
        <p className="text-xs text-gray-400 mt-1">The backend will geocode this address to obtain latitude/longitude.</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => { resetFields(); onCancel(); }}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200"
          disabled={submitting || loading}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="px-4 py-2 bg-[#355842] text-white rounded-md text-sm hover:bg-[#2e4a36] disabled:opacity-60"
          disabled={submitting || loading}
        >
          {submitting || loading ? 'Saving...' : 'Save Container'}
        </button>
      </div>
    </form>
  );
};

export default AddWasteContainerForm;
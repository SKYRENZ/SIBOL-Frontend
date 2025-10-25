import { useState } from 'react';

interface FormData {
  area: string;
  startDate: string;
  name?: string;    // ✅ Add name field
  status?: string;  // ✅ Add status field
}

export const useMachine = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    area: '',
    startDate: '',
    name: '',
    status: ''
  });

  // Open add form
  const openAddForm = () => {
    setFormData({ area: '', startDate: '', name: '', status: '' });
    setShowAddForm(true);
  };

  // Close add form
  const closeAddForm = () => {
    setShowAddForm(false);
    setFormData({ area: '', startDate: '', name: '', status: '' });
  };

  // Open edit form
  const openEditForm = () => {
    setShowEditForm(true);
  };

  // Close edit form
  const closeEditForm = () => {
    setShowEditForm(false);
    setFormData({ area: '', startDate: '', name: '', status: '' });
  };

  // Update form field
  const updateFormField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return {
    // State
    showAddForm,
    showEditForm,
    formData,
    
    // Actions
    openAddForm,
    closeAddForm,
    openEditForm,
    closeEditForm,
    updateFormField,
    setFormData,
  };
};
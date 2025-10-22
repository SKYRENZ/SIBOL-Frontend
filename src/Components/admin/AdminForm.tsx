import React, { useEffect, useMemo, useState } from 'react';
import { Account } from '../../types/Types';

type Role = { Roles_id: number; Roles: string };
type ModuleItem = { Module_id: number; Module_name: string; Path?: string };
type Barangay = { Barangay_id: number; Barangay_Name: string };

type AdminFormProps = {
  initialData?: Partial<Account>;
  mode?: 'create' | 'edit';
  onSubmit: (payload: Partial<Account>) => Promise<void> | void;
  onCancel: () => void;
  // Data comes from parent (hooks live in hooks/)
  roles?: Role[];
  modules?: ModuleItem[];
  barangays?: Barangay[];
};

type AdminPayload = Partial<Account> & {
  Password?: string;
  Access?: string[];
};

const slugify = (s = '') =>
  s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '.')
    .replace(/[^a-z0-9._-]/g, '');

const AdminForm: React.FC<AdminFormProps> = ({
  initialData = {},
  mode: modeProp,
  onSubmit,
  onCancel,
  roles = [],
  modules = [],
  barangays = [],
}) => {
  const inferredMode = modeProp ?? (initialData && initialData.Account_id ? 'edit' : 'create');
  const isCreate = inferredMode === 'create';

  // Keep local copies only for UI; most fields are read-only except role and access
  const [roleId, setRoleId] = useState<number>(initialData.Roles ?? roles[0]?.Roles_id ?? 1);
  const [access, setAccess] = useState<Record<string, boolean>>({});

  const generatedUsername = useMemo(() => slugify(`${initialData.FirstName ?? ''}.${initialData.LastName ?? ''}`), [
    initialData,
  ]);
  const generatedPassword = useMemo(() => Math.random().toString(36).slice(-8), []);

  useEffect(() => {
    // initialize role from initialData or fallback
    setRoleId(initialData.Roles ?? roles[0]?.Roles_id ?? 1);
  }, [initialData, roles]);

  useEffect(() => {
    // initialize access based on initialData.Access and modules
    const rawAccess = (initialData as any)?.Access;
    const accessItems = !rawAccess ? [] : Array.isArray(rawAccess) ? rawAccess : [rawAccess];
    const accessSet = new Set<string>();
    accessItems.forEach((it: any) => {
      if (it == null) return;
      accessSet.add(String(it));
    });
    const newAccess: Record<string, boolean> = {};
    modules.forEach((m) => {
      const name = m.Module_name;
      newAccess[name] = accessSet.has(name) || accessSet.has(String(m.Module_id));
    });
    setAccess(newAccess);
  }, [initialData, modules]);

  const toggleAccess = (key: string) => setAccess((s) => ({ ...s, [key]: !s[key] }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const accessArray = Object.keys(access).filter((k) => access[k]);
    const payload: AdminPayload = {
      // preserve original values from initialData, but overwrite Roles and Access
      ...initialData,
      Roles: roleId,
      Access: accessArray,
      Password: isCreate ? generatedPassword : undefined,
    };
    await onSubmit(payload);
  };

  const barangayName =
    (initialData.Barangay_id && barangays.find((b) => b.Barangay_id === initialData.Barangay_id)?.Barangay_Name) ??
    '';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Display-only fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">First Name</label>
          <div className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-800">
            {initialData.FirstName ?? '-'}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Last Name</label>
          <div className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-800">
            {initialData.LastName ?? '-'}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Barangay</label>
          <div className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-800">{barangayName || '-'}</div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <div className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-800">{initialData.Email ?? '-'}</div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <div className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-800">
            {initialData.Username ?? (isCreate ? generatedUsername : '-')}
          </div>
        </div>
      </div>

      {/* Editable: Role */}
      <div>
        <label className="block text-sm font-medium mb-1">Role</label>
        <select
          value={roleId}
          onChange={(e) => setRoleId(Number(e.target.value))}
          className="w-full border rounded px-3 py-2"
        >
          {roles.map((r) => (
            <option key={r.Roles_id} value={r.Roles_id}>
              {r.Roles}
            </option>
          ))}
        </select>
      </div>

      {/* Editable: Access checkboxes */}
      <div>
        <label className="block text-sm font-medium mb-1">Access</label>
        <div className="space-y-2 max-h-48 overflow-auto border rounded px-3 py-2 bg-white">
          {modules.length === 0 && <div className="text-sm text-gray-500">No modules available</div>}
          {modules.map((mod) => (
            <label key={mod.Module_id} className="flex items-center">
              <input
                type="checkbox"
                checked={!!access[mod.Module_name]}
                onChange={() => toggleAccess(mod.Module_name)}
                className="mr-2"
              />
              <span className="select-none">{mod.Module_name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary">
          {isCreate ? 'Create' : 'Update'}
        </button>
        <button type="button" onClick={onCancel} className="btn btn-outline">
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AdminForm;
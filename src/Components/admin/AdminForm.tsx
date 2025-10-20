import React, { useEffect, useMemo, useState } from 'react';
import { Account } from '../../types/Types';
import { fetchUserRoles, fetchModules } from '../../services/adminService';  // Add fetchModules import

type AdminFormProps = {
  initialData?: Partial<Account>;
  mode?: 'create' | 'edit';
  onSubmit: (payload: Partial<Account>) => Promise<void> | void;
  onCancel: () => void;
};

// Define a type for the payload that includes extra fields not in Account
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

const AdminForm: React.FC<AdminFormProps> = ({ initialData = {}, mode: modeProp, onSubmit, onCancel }) => {
  const inferredMode = modeProp ?? (initialData && initialData.Account_id ? 'edit' : 'create');
  const isCreate = inferredMode === 'create';

  const [firstName, setFirstName] = useState(initialData.FirstName ?? '');
  const [lastName, setLastName] = useState(initialData.LastName ?? '');
  const [areaId, setAreaId] = useState<number | ''>(initialData.Area_id ?? '');
  const [contact, setContact] = useState<string | number | ''>(initialData.Contact ?? '');
  const [email, setEmail] = useState(initialData.Email ?? '');
  const [roleId, setRoleId] = useState<number>(initialData.Roles ?? 1);
  const [username, setUsername] = useState(initialData.Username ?? '');
  const [password, setPassword] = useState('');
  // Change access to Record<string, boolean> (keyed by module name for simplicity)
  const [access, setAccess] = useState<Record<string, boolean>>({});
  const [roles, setRoles] = useState<{ Roles_id: number; Roles: string }[]>([]);
  // change state typing to accept either shape (normalize after fetch)
  const [modules, setModules] = useState<{ Module_id: number; Module_name: string; Path?: string }[]>([]);  // NEW: State for modules

  const generatedUsername = useMemo(() => slugify(`${firstName}.${lastName}`), [firstName, lastName]);
  const generatedPassword = useMemo(() => Math.random().toString(36).slice(-8), []);  // NEW: Auto-generate password

  useEffect(() => {
    setFirstName(initialData.FirstName ?? '');
    setLastName(initialData.LastName ?? '');
    setAreaId(initialData.Area_id ?? '');
    setContact(initialData.Contact ?? '');
    setEmail(initialData.Email ?? '');
    setRoleId(initialData.Roles ?? 1);
    setUsername(initialData.Username ?? '');
  }, [initialData]);

  useEffect(() => {
    if (isCreate) setUsername(generatedUsername);
  }, [generatedUsername, isCreate]);

  // fetch roles for edit mode dropdown
  useEffect(() => {
    const loadRoles = async () => {
      try {
        const fetched = await fetchUserRoles();
        setRoles(fetched);
      } catch (err) {
        console.error('Failed to load roles:', err);
      }
    };
    loadRoles();
  }, []);

  // NEW: Fetch modules on mount (normalize backend fields)
  useEffect(() => {
    const loadModules = async () => {
      try {
        const fetched: any[] = await fetchModules();
        const normalized = (fetched || []).map((m: any) => ({
          Module_id: m.Module_id ?? m.id ?? 0,
          Module_name: m.Module_name ?? m.Name ?? m.name ?? m.ModuleName ?? '',
          Path: m.Path ?? m.path ?? undefined,
        }));
        setModules(normalized);
      } catch (err) {
        console.error('Failed to load modules:', err);
      }
    };
    loadModules();
  }, []);

  // Update access when initialData.Access is provided (for edit mode)
  useEffect(() => {
    const rawAccess = (initialData as any)?.Access;

    if (!rawAccess) {
      setAccess({});
      return;
    }

    // Normalize rawAccess into a set of strings for flexible matching
    const accessItems = Array.isArray(rawAccess) ? rawAccess : [rawAccess];
    const accessSet = new Set<string>();
    accessItems.forEach((it: any) => {
      if (it == null) return;
      const s = String(it);
      accessSet.add(s);
      accessSet.add(s.toLowerCase());
    });

    // If modules are available, build map by module display name (Module_name)
    if (modules && modules.length > 0) {
      const map: Record<string, boolean> = {};
      modules.forEach((m) => {
        const name = m.Module_name || `Module ${m.Module_id}`;
        const path = m.Path ?? '';
        const idStr = String(m.Module_id);
        const candidates = [name, name.toLowerCase(), path, path.toLowerCase(), idStr];
        const matched = candidates.some((c) => c && accessSet.has(c));
        if (matched) map[name] = true;
      });
      setAccess(map);
      return;
    }

    // Fallback: set directly from Access array (use raw values as keys)
    const fallback: Record<string, boolean> = {};
    accessItems.forEach((it: any) => {
      if (it == null) return;
      fallback[String(it)] = true;
    });
    setAccess(fallback);
  }, [initialData, modules]);

  const toggleAccess = (key: string) => setAccess((s) => ({ ...s, [key]: !s[key] }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: AdminPayload = {
      FirstName: firstName,
      LastName: lastName,
      Area_id: areaId ? Number(areaId) : undefined,
      Email: email,
      Roles: roleId,
      Username: username,
    };

    if (isCreate) {
      payload.Password = generatedPassword;  // Auto-generate for create
      if (Object.values(access).some(Boolean)) payload.Access = Object.keys(access).filter((k) => access[k]);
    } else {
      // Edit mode: Only include editable fields
      payload.Account_id = initialData.Account_id;
      if (password) payload.Password = password;  // Only if changed
      if (Object.values(access).some(Boolean)) payload.Access = Object.keys(access).filter((k) => access[k]);
    }

    try {
      await onSubmit(payload);
      // ...existing code...
    } catch (err) {
      // ...existing code...
    }
  };

  return (
    <div className="w-full text-[#3D5341] text-sm">
      {/* header (no extra padding because modal wrapper handles it) */}
      <div className="border-b pb-3">
        <h3 className="text-center font-semibold text-lg text-[#3D5341]">{isCreate ? 'Create User' : 'Edit User'}</h3>
      </div>

      {/* shaded static summary (rounded and subtle background) */}
      <div className="mt-4 rounded-md bg-slate-50 p-4 text-sm text-slate-700">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="mb-2"><span className="font-semibold text-[#3D5341]">Username:</span> {username || '-'}</div>
            <div className="mb-2"><span className="font-semibold text-[#3D5341]">Barangay:</span> {areaId ? `Brgy. ${areaId}` : '-'}</div>
            <div className="mb-2"><span className="font-semibold text-[#3D5341]">Email:</span> {email || '-'}</div>
          </div>
          <div>
            <div className="mb-2"><span className="font-semibold text-[#3D5341]">Role:</span> {roles.find(r => r.Roles_id === roleId)?.Roles || '-'}</div>
            <div className="mb-2"><span className="font-semibold text-[#3D5341]">Contact no.:</span> {contact || '-'}</div>
          </div>
        </div>
      </div>

      {/* form fields (modal wrapper provides padding) */}
      <form onSubmit={handleSubmit} className="mt-6">
        <div className="grid grid-cols-2 gap-4">
          {isCreate && (
            <>
              <div>
                <label className="block text-xs text-[#3D5341] mb-1">First name</label>
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full border rounded px-2 py-1 text-sm bg-transparent" required />
              </div>
              <div>
                <label className="block text-xs text-[#3D5341] mb-1">Last name</label>
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full border rounded px-2 py-1 text-sm bg-transparent" required />
              </div>
              <div>
                <label className="block text-xs text-[#3D5341] mb-1">Barangay</label>
                <select value={areaId ?? ''} onChange={(e) => setAreaId(e.target.value === '' ? '' : Number(e.target.value))} className="w-full border rounded px-2 py-1 text-sm bg-transparent" required>
                  <option value="">Select Barangay</option>
                  <option value={1}>Barangay 1</option>
                  <option value={2}>Barangay 2</option>
                  <option value={3}>Barangay 3</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#3D5341] mb-1">Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-full border rounded px-2 py-1 text-sm bg-transparent" required />
              </div>
              <div>
                <label className="block text-xs text-[#3D5341] mb-1">Username</label>
                <input value={generatedUsername} readOnly className="w-full border rounded px-2 py-1 text-sm bg-transparent" />
              </div>
            </>
          )}

          {!isCreate && (
            <>
              <div>
                <label className="block text-xs text-[#3D5341] mb-1">Username</label>
                <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full border rounded px-2 py-1 text-sm bg-transparent" />
              </div>
              <div>
                <label className="block text-xs text-[#3D5341] mb-1">Change Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to keep existing" className="w-full border rounded px-2 py-1 text-sm bg-transparent" />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs text-[#3D5341] mb-1">Role</label>
            <select value={roleId} onChange={(e) => setRoleId(Number(e.target.value))} className="w-full border rounded px-2 py-1 text-sm bg-transparent">
              {roles.map((r) => (
                <option key={r.Roles_id} value={r.Roles_id}>
                  {r.Roles}
                </option>
              ))}
            </select>
          </div>

          <div aria-hidden className="hidden md:block" />
        </div>

        <hr className="my-4" />

        <div>
          <div className="text-sm font-medium text-slate-700 mb-2">Access Checklist</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {modules.map((module) => {
              const name = module.Module_name || `Module ${module.Module_id}`;
              return (
                <label key={module.Module_id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={access[name] || false}
                    onChange={() => toggleAccess(name)}
                  />
                  {name}
                </label>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button type="button" onClick={onCancel} className="px-3 py-1 text-sm rounded bg-rose-600 text-white hover:bg-rose-700">Cancel</button>
          <button type="submit" className="px-4 py-1 text-sm rounded bg-sibol-green text-white hover:bg-sibol-green/90">{isCreate ? 'Create User' : 'Save Changes'}</button>
        </div>
      </form>
    </div>
  );
};

export default AdminForm;
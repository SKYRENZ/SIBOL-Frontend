import React, { useEffect, useMemo, useState } from 'react';
import { Account } from '../../types/Types';

type AdminFormProps = {
  initialData?: Partial<Account>;
  mode?: 'create' | 'edit';
  onSubmit: (payload: Partial<Account>) => Promise<void> | void;
  onCancel: () => void;
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
  const [access, setAccess] = useState<Record<string, boolean>>({
    dashboard: false,
    process: false,
    chat: false,
    settings: false,
  });

  const generatedUsername = useMemo(() => slugify(`${firstName}.${lastName}`), [firstName, lastName]);

  useEffect(() => {
    setFirstName(initialData.FirstName ?? '');
    setLastName(initialData.LastName ?? '');
    setAreaId(initialData.Area_id ?? '');
    setContact(initialData.Contact ?? '');
    setEmail(initialData.Email ?? '');
    setRoleId(initialData.Roles ?? 1);
    setUsername(initialData.Username ?? '');
    if ((initialData as any).Access && Array.isArray((initialData as any).Access)) {
      const map: Record<string, boolean> = {};
      (initialData as any).Access.forEach((k: string) => (map[k] = true));
      setAccess((s) => ({ ...s, ...map }));
    }
  }, [initialData]);

  useEffect(() => {
    if (isCreate) setUsername(generatedUsername);
  }, [generatedUsername, isCreate]);

  const toggleAccess = (key: string) => setAccess((s) => ({ ...s, [key]: !s[key] }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isCreate) {
      const payload: any = {
        FirstName: firstName,
        LastName: lastName,
        Area_id: typeof areaId === 'number' ? areaId : areaId === '' ? undefined : Number(areaId),
        Email: email,
        Roles: roleId,
        Username: generatedUsername,
      };
      if (Object.values(access).some(Boolean)) payload.Access = Object.keys(access).filter((k) => access[k]);
      await onSubmit(payload);
      return;
    }

    const payload: any = {
      FirstName: firstName,
      LastName: lastName,
      Area_id: typeof areaId === 'number' ? areaId : areaId === '' ? undefined : Number(areaId),
      Contact: contact,
      Email: email,
      Roles: roleId,
      Username,
    };
    if (password) payload.Password = password;
    payload.Access = Object.keys(access).filter((k) => access[k]);
    await onSubmit(payload);
  };

  return (
    <div className="w-full text-[#3D5341] text-sm">
      {/* header (no extra padding because modal wrapper handles it) */}
      <div className="border-b pb-3">
        <h3 className="text-center font-semibold text-lg text-[#3D5341]">User Information</h3>
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
            <div className="mb-2"><span className="font-semibold text-[#3D5341]">Role:</span> {roleId === 3 ? 'Admin' : roleId === 2 ? 'Maintenance' : 'User'}</div>
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
                <label className="block text-xs text-[#3D5341] mb-1">Barangay (Area ID)</label>
                <input value={areaId ?? ''} onChange={(e) => setAreaId(e.target.value === '' ? '' : Number(e.target.value))} className="w-full border rounded px-2 py-1 text-sm bg-transparent" required />
              </div>
              <div>
                <label className="block text-xs text-[#3D5341] mb-1">Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-full border rounded px-2 py-1 text-sm bg-transparent" required />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs text-[#3D5341] mb-1">Username</label>
            {isCreate ? (
              <input value={generatedUsername} readOnly className="w-full border rounded px-2 py-1 text-sm bg-transparent" />
            ) : (
              <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full border rounded px-2 py-1 text-sm bg-transparent" />
            )}
          </div>

          <div>
            <label className="block text-xs text-[#3D5341] mb-1">Role</label>
            <select value={roleId} onChange={(e) => setRoleId(Number(e.target.value))} className="w-full border rounded px-2 py-1 text-sm bg-transparent">
              <option value={1}>User</option>
              <option value={2}>Maintenance</option>
              <option value={3}>Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-[#3D5341] mb-1">Change Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={isCreate ? 'Password will be generated automatically' : 'Leave blank to keep existing'} className="w-full border rounded px-2 py-1 text-sm bg-transparent" />
          </div>
          <div aria-hidden className="hidden md:block" />
        </div>

        <hr className="my-4" />

        <div>
          <div className="text-sm font-medium text-slate-700 mb-2">Access Checklist</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={access.dashboard} onChange={() => toggleAccess('dashboard')} />Dashboard</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={access.process} onChange={() => toggleAccess('process')} />Process Panel</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={access.chat} onChange={() => toggleAccess('chat')} />Chat Support</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={access.settings} onChange={() => toggleAccess('settings')} />Settings</label>
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
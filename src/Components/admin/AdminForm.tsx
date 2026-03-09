import React, { useEffect, useMemo, useState } from 'react';
import { Account } from '../../types/Types';
import FormModal from '../common/FormModal';
import CustomScrollbar from '../common/CustomScrollbar';

type Role = { Roles_id: number; Roles: string };
type Barangay = { Barangay_id: number; Barangay_Name: string };

type AdminFormProps = {
  initialData?: Partial<Account>;
  mode?: 'create' | 'edit';
  onSubmit: (payload: Partial<Account>) => Promise<void> | void;
  onCancel: () => void;
  // Data comes from parent (hooks live in hooks/)
  roles?: Role[];
  barangays?: Barangay[];
  // show the form inside the shared FormModal
  isOpen?: boolean;
};

type AdminPayload = Partial<Account> & {
  Password?: string;
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
  barangays = [],
  isOpen = true,
}) => {
  const inferredMode = modeProp ?? (initialData && initialData.Account_id ? 'edit' : 'create');
  const isCreate = inferredMode === 'create';

  // Editable state used for create mode (and optionally for a nicer UX in edit mode if needed)
  const [firstName, setFirstName] = useState<string>(initialData.FirstName ?? '');
  const [lastName, setLastName] = useState<string>(initialData.LastName ?? '');
  const [barangayId, setBarangayId] = useState<number | ''>(initialData.Barangay_id ?? '');
  const [email, setEmail] = useState<string>(initialData.Email ?? '');
  const [password, setPassword] = useState<string>('');

  // Role is editable in both modes
  const [roleId, setRoleId] = useState<number>(initialData.Roles ?? roles[0]?.Roles_id ?? 1);

  // generated username (read-only in UI)
  const generatedUsername = useMemo(
    () =>
      slugify(
        `${(firstName || initialData.FirstName || '').toString()}.${(lastName || initialData.LastName || '').toString()}`
      ),
    [firstName, lastName, initialData]
  );
  const generatedPassword = useMemo(() => Math.random().toString(36).slice(-8), []);

  // sync initialData to editable states when initialData changes (important when switching between edit/create)
  useEffect(() => {
    setFirstName(initialData.FirstName ?? '');
    setLastName(initialData.LastName ?? '');
    setBarangayId(initialData.Barangay_id ?? '');
    setEmail(initialData.Email ?? '');
    setRoleId(initialData.Roles ?? roles[0]?.Roles_id ?? 1);
    // don't overwrite password (leave blank)
  }, [initialData, roles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isCreate) {
      // create payload: include all editable fields except username (username derived)
      const payload: AdminPayload = {
        FirstName: firstName,
        LastName: lastName,
        Barangay_id: barangayId === '' ? undefined : barangayId,
        Email: email,
        Roles: roleId,
        Username: generatedUsername,
        Password: password || generatedPassword,
      };
      await onSubmit(payload);
      return;
    }

    // edit mode: preserve original values and only override Roles / Access (keeps updateUser behavior)
    const payload: AdminPayload = {
      ...initialData,
      Roles: roleId,
      // do not include Password on update to avoid overwriting
    };
    await onSubmit(payload);
  };

  const barangayName =
    (initialData.Barangay_id && barangays.find((b) => b.Barangay_id === initialData.Barangay_id)?.Barangay_Name) ?? '';

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onCancel}
      title={isCreate ? 'Create Admin' : 'Edit Admin'}
    >
      {/* constrain form height so modal inner scroll works; add right padding so content doesn't butt against the scrollbar */}
      <CustomScrollbar maxHeight="max-h-[calc(100vh-220px)]" className="pr-6 px-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* For create mode: editable fields (all except username) */}
          {isCreate ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name</label>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full border rounded px-3 py-2 bg-transparent text-sibol-green"
                    placeholder="First name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Last Name</label>
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full border rounded px-3 py-2 bg-transparent text-sibol-green"
                    placeholder="Last name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Barangay</label>
                  <select
                    value={barangayId}
                    onChange={(e) => setBarangayId(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full border rounded px-3 py-2 bg-transparent text-sibol-green"
                  >
                    <option value="">Select barangay</option>
                    {barangays.map((b) => (
                      <option key={b.Barangay_id} value={b.Barangay_id}>
                        {b.Barangay_Name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border rounded px-3 py-2 bg-transparent text-sibol-green"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Username (auto)</label>
                  <div className="w-full border rounded px-3 py-2 bg-transparent text-sibol-green">{generatedUsername}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave blank to auto-generate"
                    className="w-full border rounded px-3 py-2 bg-transparent text-sibol-green"
                  />
                </div>
              </div>
            </>
          ) : (
            /* Edit / view mode: display-only fields */
            <>
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
                    {initialData.Username ?? '-'}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Editable: Role */}
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              value={roleId}
              onChange={(e) => setRoleId(Number(e.target.value))}
              className="w-full border rounded px-3 py-2 bg-transparent text-sibol-green"
            >
              {roles.map((r) => (
                <option
                  key={r.Roles_id}
                  value={r.Roles_id}
                  // browsers limit <option> styling; set inline to help where supported
                  style={{ background: 'transparent', color: 'inherit' }}
                >
                  {r.Roles}
                </option>
              ))}
            </select>
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
      </CustomScrollbar>
    </FormModal>
  );
};

export default AdminForm;
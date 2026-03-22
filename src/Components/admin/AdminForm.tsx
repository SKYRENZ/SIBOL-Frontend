import React, { useEffect, useMemo, useState } from 'react';
import { Account } from '../../types/adminTypes';
import FormModal from '../common/FormModal';
import CustomScrollbar from '../common/CustomScrollbar';
import CreditScoreGauge from '../common/CreditScoreGauge';

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
  lockedBarangayId?: number;
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
  lockedBarangayId,
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

  // Form data object for change detection
  const formData = {
    FirstName: firstName,
    LastName: lastName,
    Barangay: barangayId,
    Email: email,
    Username: generatedUsername,
    Roles: roleId
  };

  // Change detection function
  const hasChanges = () => {
    if (isCreate) {
      // In create mode, check if any field has content
      return firstName.trim() !== '' || lastName.trim() !== '' || email.trim() !== '' || password.trim() !== '';
    }
    // In edit mode, check if any field differs from initial data
    return (
      formData.FirstName !== initialData.FirstName ||
      formData.LastName !== initialData.LastName ||
      formData.Barangay !== initialData.Barangay_id ||
      formData.Email !== initialData.Email ||
      formData.Roles !== initialData.Roles
    );
  };

  // sync initialData to editable states when initialData changes (important when switching between edit/create)
  useEffect(() => {
    setFirstName(initialData.FirstName ?? '');
    setLastName(initialData.LastName ?? '');
    if (isCreate && lockedBarangayId !== undefined && lockedBarangayId !== null) {
      setBarangayId(lockedBarangayId);
    } else {
      setBarangayId(initialData.Barangay_id ?? '');
    }
    setEmail(initialData.Email ?? '');
    setRoleId(initialData.Roles ?? roles[0]?.Roles_id ?? 1);
    // don't overwrite password (leave blank)
  }, [initialData, roles, isCreate, lockedBarangayId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isCreate) {
      // create payload: include all editable fields except username (username derived)
      const payload: AdminPayload = {
        FirstName: firstName,
        LastName: lastName,
        Barangay_id:
          isCreate && lockedBarangayId !== undefined && lockedBarangayId !== null
            ? lockedBarangayId
            : barangayId === ''
              ? undefined
              : barangayId,
        Email: email,
        Roles: roleId,
        Username: generatedUsername,
        Password: password.trim() || undefined,
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
  const isBarangayLocked = isCreate && lockedBarangayId !== undefined && lockedBarangayId !== null;
  const lockedBarangay = isBarangayLocked
    ? barangays.find((b) => b.Barangay_id === lockedBarangayId)
    : undefined;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onCancel}
      title={isCreate ? 'Create User' : 'Edit User'}
    >
      {/* constrain form height so modal inner scroll works; add right padding so content doesn't butt against the scrollbar */}
      <CustomScrollbar maxHeight="max-h-[calc(100vh-220px)]" className="pr-6 px-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* For create mode: editable fields (all except username) */}
          {isCreate ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium mb-0.5">First Name</label>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full border rounded px-2 py-1.5 bg-transparent text-sibol-green text-sm"
                    placeholder="First name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-0.5">Last Name</label>
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full border rounded px-2 py-1.5 bg-transparent text-sibol-green text-sm"
                    placeholder="Last name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-0.5">Barangay</label>
                  <select
                    value={barangayId}
                    onChange={(e) => setBarangayId(e.target.value === '' ? '' : Number(e.target.value))}
                    disabled={isBarangayLocked}
                    className="w-full border rounded px-2 py-1.5 bg-transparent text-sibol-green text-sm"
                  >
                    {isBarangayLocked ? (
                      <option value={lockedBarangayId}>
                        {lockedBarangay?.Barangay_Name ?? `Barangay ${lockedBarangayId}`}
                      </option>
                    ) : (
                      <>
                        <option value="">Select barangay</option>
                        {barangays.map((b) => (
                          <option key={b.Barangay_id} value={b.Barangay_id}>
                            {b.Barangay_Name}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-0.5">Email</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border rounded px-2 py-1.5 bg-transparent text-sibol-green text-sm"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-0.5">Username (auto)</label>
                  <div className="w-full border rounded px-2 py-1.5 bg-transparent text-sibol-green text-sm">{generatedUsername}</div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-0.5">Password</label>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave blank to use default"
                    className="w-full border rounded px-2 py-1.5 bg-transparent text-sibol-green text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-0.5">Role</label>
                  <select
                    value={roleId}
                    onChange={(e) => setRoleId(Number(e.target.value))}
                    className="w-full border rounded px-2 py-1.5 bg-transparent text-sibol-green text-sm"
                  >
                    {roles.map((r) => (
                      <option
                        key={r.Roles_id}
                        value={r.Roles_id}
                        style={{ background: 'transparent', color: 'inherit' }}
                      >
                        {r.Roles}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          ) : (
            /* Edit / view mode: Profile Image + Credit Score (left) + User Info (right) */
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* LEFT COLUMN: Profile Image + Credit Score (for operators only) */}
                <div className="md:col-span-1">
                  {/* Profile Image + Credit Score Integrated - Only for Operators (Role = 3) */}
                  {initialData.Roles === 3 ? (
                    <div className="flex flex-col items-center justify-center mt-8">
                      <div className="relative">
                        {/* Credit Score Gauge as Background */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <CreditScoreGauge score={Number(initialData.credit_score)} size="md" showLabel={false} />
                        </div>
                        {/* Profile Image in Center */}
                        <div className="relative z-10 w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-lg">
                          {initialData.Profile_image_path ? (
                            <img
                              src={initialData.Profile_image_path}
                              alt={`${initialData.FirstName} ${initialData.LastName}`}
                              className="w-20 h-20 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                              <span className="text-gray-600 text-xs font-medium">No image</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Status Label Below */}
                      {initialData.credit_score !== undefined && initialData.credit_score !== null && !isNaN(Number(initialData.credit_score)) && (
                        <div className="mt-4">
                          <CreditScoreGauge score={Number(initialData.credit_score)} size="sm" showLabel={true} />
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Regular Profile Image for non-operators */
                    <div className="rounded-lg p-3 flex flex-col items-center justify-center min-h-[140px]">
                      <div className="mb-2">
                        {initialData.Profile_image_path ? (
                          <img
                            src={initialData.Profile_image_path}
                            alt={`${initialData.FirstName} ${initialData.LastName}`}
                            className="w-24 h-24 rounded-full object-cover border-3 border-sibol-green shadow-md"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center border-3 border-gray-200 shadow-md">
                            <span className="text-gray-600 text-xs font-medium">No image</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* RIGHT COLUMN: User Info (single column) */}
                <div className="md:col-span-2">
                  <div className="space-y-2">
                    {/* First Name */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">First Name</label>
                      <div className="w-full border border-gray-200 rounded px-2 py-1.5 bg-gray-50 text-gray-800 text-sm">
                        {initialData.FirstName ?? '-'}
                      </div>
                    </div>

                    {/* Last Name */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">Last Name</label>
                      <div className="w-full border border-gray-200 rounded px-2 py-1.5 bg-gray-50 text-gray-800 text-sm">
                        {initialData.LastName ?? '-'}
                      </div>
                    </div>

                    {/* Barangay */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">Barangay</label>
                      <div className="w-full border border-gray-200 rounded px-2 py-1.5 bg-gray-50 text-gray-800 text-sm">{barangayName || '-'}</div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">Email</label>
                      <div className="w-full border border-gray-200 rounded px-2 py-1.5 bg-gray-50 text-gray-800 text-sm">{initialData.Email ?? '-'}</div>
                    </div>

                    {/* Username */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">Username</label>
                      <div className="w-full border border-gray-200 rounded px-2 py-1.5 bg-gray-50 text-gray-800 text-sm">
                        {initialData.Username ?? '-'}
                      </div>
                    </div>

                    {/* Role */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">Role</label>
                      <select
                        value={roleId}
                        onChange={(e) => setRoleId(Number(e.target.value))}
                        className="w-full border border-gray-200 rounded px-2 py-1.5 bg-transparent text-sibol-green text-sm font-medium hover:border-sibol-green transition"
                      >
                        {roles.map((r) => (
                          <option
                            key={r.Roles_id}
                            value={r.Roles_id}
                            style={{ background: 'transparent', color: 'inherit' }}
                          >
                            {r.Roles}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Buttons - Right aligned */}
          <div className="flex gap-3 items-center justify-end mt-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 bg-gray-200 text-gray-800 text-sm rounded hover:bg-gray-300 font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!hasChanges()}
              className="px-3 py-1.5 bg-[#355842] text-white text-sm rounded hover:bg-[#2e4a36] font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreate ? 'Create' : 'Update'}
            </button>
          </div>
        </form>
      </CustomScrollbar>
    </FormModal>
  );
};

export default AdminForm;

import React, { useEffect, useState } from 'react';
import { Account } from '../../types/Types';

type AdminFormProps = {
  initialData?: Partial<Account>;
  onSubmit: (payload: Partial<Account>) => Promise<void> | void;
  onCancel: () => void;
};

const AdminForm: React.FC<AdminFormProps> = ({ initialData = {}, onSubmit, onCancel }) => {
  const [firstName, setFirstName] = useState(initialData.FirstName ?? '');
  const [lastName, setLastName] = useState(initialData.LastName ?? '');
  const [areaId, setAreaId] = useState<number | ''>(initialData.Area_id ?? '');
  const [contact, setContact] = useState<string | number | ''>(initialData.Contact ?? '');
  const [email, setEmail] = useState(initialData.Email ?? '');
  const [roleId, setRoleId] = useState<number>(initialData.Roles ?? 1);

  useEffect(() => {
    // keep local state in sync when editing different accounts
    setFirstName(initialData.FirstName ?? '');
    setLastName(initialData.LastName ?? '');
    setAreaId(initialData.Area_id ?? '');
    setContact(initialData.Contact ?? '');
    setEmail(initialData.Email ?? '');
    setRoleId(initialData.Roles ?? 1);
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      firstName,
      lastName,
      areaId: typeof areaId === 'number' ? areaId : areaId === '' ? undefined : Number(areaId),
      contact,
      email,
      roleId,
    } as any);
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: 16, border: '1px solid #ccc', marginTop: 12 }}>
      <div style={{ marginBottom: 8 }}>
        <label style={{ display: 'block', fontSize: 13 }}>First name</label>
        <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
      </div>

      <div style={{ marginBottom: 8 }}>
        <label style={{ display: 'block', fontSize: 13 }}>Last name</label>
        <input value={lastName} onChange={(e) => setLastName(e.target.value)} />
      </div>

      <div style={{ marginBottom: 8 }}>
        <label style={{ display: 'block', fontSize: 13 }}>Barangay (Area ID)</label>
        <input
          type="number"
          value={areaId as number | ''}
          onChange={(e) => setAreaId(e.target.value === '' ? '' : Number(e.target.value))}
        />
      </div>

      <div style={{ marginBottom: 8 }}>
        <label style={{ display: 'block', fontSize: 13 }}>Contact</label>
        <input value={String(contact)} onChange={(e) => setContact(e.target.value)} />
      </div>

      <div style={{ marginBottom: 8 }}>
        <label style={{ display: 'block', fontSize: 13 }}>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>

      <div style={{ marginBottom: 8 }}>
        <label style={{ display: 'block', fontSize: 13 }}>Role</label>
        <select value={roleId} onChange={(e) => setRoleId(Number(e.target.value))}>
          <option value={1}>User</option>
          <option value={2}>Maintenance</option>
          <option value={3}>Admin</option>
        </select>
      </div>

      <div style={{ marginTop: 12 }}>
        <button type="submit">Save</button>
        <button type="button" onClick={onCancel} style={{ marginLeft: 8 }}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AdminForm;
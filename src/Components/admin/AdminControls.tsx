import React, { useEffect, useState, useRef } from 'react';
import { fetchUserRoles } from '../../services/adminService';

type Props = {
  globalQuery: string;
  setGlobalQuery: (v: string) => void;
  roleFilter: number | 'all';
  setRoleFilter: (v: number | 'all') => void;
  onReset?: () => void;
  onCreate?: () => void;
};

export default function AdminControls({ globalQuery, setGlobalQuery, roleFilter, setRoleFilter, onReset, onCreate }: Props) {
  const [roles, setRoles] = useState<{ Roles_id: number; Roles: string }[]>([]);
  const [showRoles, setShowRoles] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await fetchUserRoles();
        if (mounted) setRoles(r);
      } catch {
        if (mounted) setRoles([]);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // close dropdown on outside click
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowRoles(false);
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  return (
    <div className="py-5 flex items-center justify-between">
      {/* left: search (green border always + green icon) */}
      <div className="w-full max-w-2xl">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sibol-green">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          <input
            value={globalQuery}
            onChange={(e) => setGlobalQuery(e.target.value)}
            placeholder="Search"
            className="w-full pl-10 pr-1 py-2 rounded-full bg-transparent text-sibol-green placeholder:text-sibol-green/60 text-sm border border-grey-300 focus:border-green-600 focus:ring-0"
          />
        </div>
      </div>

      {/* right: Filter-by dropdown + Create user button (Reset removed) */}
      <div className="relative flex items-center gap-3" ref={menuRef}>
           {/* Create User button moved here */}
        {onCreate && (
          <button type="button" onClick={onCreate} className="btn btn-primary ml-2 px-3 py-1 text-sm">
            Create User
          </button>
        )}

        <button
          type="button"
          onClick={() => setShowRoles((s) => !s)}
          className="flex items-center gap-2 bg-white border border-green-100 rounded px-2 py-1 text-sm text-sibol-green"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M10 18h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 6h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7 12h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Filter by
        </button>

   
        {showRoles && (
          <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-green-100 rounded shadow-md z-50">
            <button
              className={`w-full text-left px-3 py-2 text-sm ${roleFilter === 'all' ? 'bg-green-50' : 'hover:bg-green-50'}`}
              onClick={() => { setRoleFilter('all'); setShowRoles(false); }}
            >
              All roles
            </button>
            {roles.map((r) => (
              <button
                key={r.Roles_id}
                className={`w-full text-left px-3 py-2 text-sm ${roleFilter === r.Roles_id ? 'bg-green-50' : 'hover:bg-green-50'}`}
                onClick={() => { setRoleFilter(r.Roles_id); setShowRoles(false); }}
              >
                {r.Roles}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
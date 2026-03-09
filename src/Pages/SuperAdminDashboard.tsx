import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SuperAdminHeader from '../Components/SuperAdminHeader';
import { AppDispatch, RootState } from '../store/store';
import { fetchSuperAdminData } from '../store/slices/superAdminSlice';
import { MapPin, Shield, Users, TrendingUp } from 'lucide-react';

function getRoleNumber(user: any): number | null {
  const role =
    user?.Roles ??
    user?.roleId ??
    user?.role ??
    user?.Roles_id ??
    user?.RolesId ??
    null;

  const n = typeof role === 'string' ? Number(role) : role;
  return Number.isFinite(n) ? (n as number) : null;
}

export default function SuperAdminDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { accounts, roles, barangays, status } = useSelector((state: RootState) => state.superadmin);
  const user = useSelector((state: RootState) => state.auth.user);
  const userRole = getRoleNumber(user);
  const isAdminRole = userRole === 1;

  useEffect(() => {
    if (isAdminRole) return;
    if (status === 'idle') dispatch(fetchSuperAdminData());
  }, [dispatch, status, isAdminRole]);

  const adminRoleIds = useMemo(() => {
    const ids = roles
      .filter((r) => /admin/i.test(r.Roles) && !/super/i.test(r.Roles))
      .map((r) => r.Roles_id);
    return ids.length ? ids : [1];
  }, [roles]);

  const barangayNameById = useMemo(
    () => new Map(barangays.map((b) => [b.Barangay_id, b.Barangay_Name])),
    [barangays]
  );

  const adminAccounts = useMemo(
    () => accounts.filter((a) => adminRoleIds.includes(getRoleNumber(a) ?? -1)),
    [accounts, adminRoleIds]
  );

  const adminCountsByBarangay = useMemo(() => {
    const counts = new Map<string, number>();
    for (const account of adminAccounts) {
      const barangayName =
        account.Barangay_Name ||
        barangayNameById.get(account.Barangay_id ?? -1) ||
        'Unassigned';
      counts.set(barangayName, (counts.get(barangayName) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([barangay, count]) => ({ barangay, count }))
      .sort((a, b) => b.count - a.count || a.barangay.localeCompare(b.barangay));
  }, [adminAccounts, barangayNameById]);

  const totalAdmins = adminAccounts.length;
  const barangayWithAdmins = adminCountsByBarangay.filter((b) => b.barangay !== 'Unassigned').length;
  const averageAdmins = barangayWithAdmins ? totalAdmins / barangayWithAdmins : 0;
  const topBarangay = adminCountsByBarangay[0]?.barangay ?? 'N/A';
  const topBarangayCount = adminCountsByBarangay[0]?.count ?? 0;


  return (
    <>
      <SuperAdminHeader />
      <div className="w-full bg-white">
        {/* spacer to avoid header overlap */}
        <div style={{ height: 'calc(var(--header-height, 72px) + 8px)' }} aria-hidden />

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-sibol-green">Super Admin Dashboard</h1>
          <p className="mt-2 text-sm text-gray-500">Overview for super admin.</p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-emerald-700/70">Total Admins</p>
                  <p className="mt-2 text-3xl font-bold text-sibol-green">{totalAdmins}</p>
                </div>
                <div className="h-11 w-11 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Shield className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">All admin accounts in the system.</p>
            </div>

            <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-sky-700/70">Barangays Covered</p>
                  <p className="mt-2 text-3xl font-bold text-sibol-green">{barangayWithAdmins}</p>
                </div>
                <div className="h-11 w-11 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center">
                  <MapPin className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">Barangays with at least one admin.</p>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-amber-700/70">Avg Admins / Barangay</p>
                  <p className="mt-2 text-3xl font-bold text-sibol-green">{averageAdmins.toFixed(1)}</p>
                </div>
                <div className="h-11 w-11 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">Distribution across barangays.</p>
            </div>

            <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-violet-700/70">Top Barangay</p>
                  <p className="mt-2 text-xl font-bold text-sibol-green truncate max-w-[160px]">{topBarangay}</p>
                  <p className="mt-1 text-xs text-gray-500">{topBarangayCount} admins</p>
                </div>
                <div className="h-11 w-11 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">Highest admin count.</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
                <h3 className="text-sm sm:text-base font-semibold text-sibol-green">Admins by Barangay</h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Breakdown of admins per barangay.</p>
              </div>
              <div className="max-h-[420px] overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left">Barangay</th>
                      <th className="px-4 sm:px-6 py-3 text-right">Admins</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminCountsByBarangay.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="px-4 sm:px-6 py-6 text-center text-gray-500">
                          No admin data yet.
                        </td>
                      </tr>
                    ) : (
                      adminCountsByBarangay.map((row) => (
                        <tr key={row.barangay} className="border-b last:border-b-0">
                          <td className="px-4 sm:px-6 py-3 text-gray-700 font-medium">
                            {row.barangay}
                          </td>
                          <td className="px-4 sm:px-6 py-3 text-right">
                            <span className="inline-flex items-center justify-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                              {row.count}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
                <h3 className="text-sm sm:text-base font-semibold text-sibol-green">Quick Insights</h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Snapshot of admin coverage.</p>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                  <p className="text-xs text-emerald-700">Coverage Rate</p>
                  <p className="text-2xl font-bold text-emerald-800 mt-1">
                    {barangays.length ? Math.round((barangayWithAdmins / barangays.length) * 100) : 0}%
                  </p>
                  <p className="text-xs text-emerald-700/70">Barangays with at least one admin.</p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs text-slate-600">Unassigned Admins</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">
                    {adminCountsByBarangay.find((b) => b.barangay === 'Unassigned')?.count ?? 0}
                  </p>
                  <p className="text-xs text-slate-600/70">Admins without barangay.</p>
                </div>

                <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-4">
                  <p className="text-xs text-amber-700">Growth Reminder</p>
                  <p className="mt-1 text-sm text-amber-800">
                    Keep barangays balanced by onboarding admins where counts are low.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

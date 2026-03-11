import React, { useEffect, useMemo, useState } from 'react';
import SuperAdminHeader from '../Components/SuperAdminHeader';
import { fetchAccounts } from '../services/adminService';
import { getMyProfile } from '../services/profile/profileService';
import { filterAndSortByBarangay, normalizeBarangayId } from '../utils/barangayData';
import type { Account } from '../types/adminTypes';
import { Users, UserCog } from 'lucide-react';

const ROLE_OPERATOR = 3;
const ROLE_HOUSEHOLD = 4;

const StatCard: React.FC<{
  title: string;
  count: number;
  icon: React.ReactNode;
  description?: string;
}> = ({ title, count, icon, description }) => {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-sibol-green">{count}</p>
          {description && <p className="mt-1 text-xs text-gray-500">{description}</p>}
        </div>
        <div className="h-12 w-12 rounded-full bg-sibol-green/10 text-sibol-green flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [barangayId, setBarangayId] = useState<number | null>(null);
  const [barangayName, setBarangayName] = useState<string>('');

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const profile = await getMyProfile();
        const resolvedBarangayId = normalizeBarangayId(
          profile?.Barangay_id ?? profile?.barangay_id ?? profile?.Area_id ?? profile?.area_id
        );

        if (!resolvedBarangayId) {
          if (active) {
            setBarangayId(null);
            setBarangayName(profile?.Barangay_Name ?? profile?.barangay_name ?? '');
            setAccounts([]);
            setError('No barangay assigned to your account.');
          }
          return;
        }

        const allAccounts = await fetchAccounts();

        if (!active) return;
        setBarangayId(resolvedBarangayId);
        setBarangayName(profile?.Barangay_Name ?? profile?.barangay_name ?? '');
        setAccounts(allAccounts ?? []);
      } catch (err: any) {
        if (!active) return;
        setError(err?.message ?? 'Failed to load dashboard data');
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  const scopedAccounts = useMemo(
    () => filterAndSortByBarangay(accounts, barangayId),
    [accounts, barangayId]
  );

  const householdCount = useMemo(
    () => scopedAccounts.filter((a) => Number(a.Roles) === ROLE_HOUSEHOLD).length,
    [scopedAccounts]
  );

  const operatorCount = useMemo(
    () => scopedAccounts.filter((a) => Number(a.Roles) === ROLE_OPERATOR).length,
    [scopedAccounts]
  );

  return (
    <>
      <SuperAdminHeader />
      <div className="w-full bg-white">
        <div style={{ height: 'calc(var(--header-height, 72px) + 8px)' }} aria-hidden />

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-sibol-green">Admin Dashboard</h1>
            <p className="text-sm text-gray-500">
              {barangayName ? `Barangay: ${barangayName}` : 'Barangay: Not set'}
            </p>
          </div>

          {loading && <div className="mt-6 text-sm text-gray-600">Loading dashboard...</div>}
          {error && !loading && <div className="mt-6 text-sm text-red-600">{error}</div>}

          {!loading && !error && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StatCard
                title="Total Households"
                count={householdCount}
                icon={<Users className="h-6 w-6" />}
                description="Active households in your barangay"
              />
              <StatCard
                title="Total Operators"
                count={operatorCount}
                icon={<UserCog className="h-6 w-6" />}
                description="Active operators in your barangay"
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;

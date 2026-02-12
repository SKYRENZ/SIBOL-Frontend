import React, { useEffect, useState } from "react";
import apiClient, { apiGet } from "../services/apiClient";
import { useNavigate, useLocation } from "react-router-dom";
import { isAuthenticated as checkIsAuthenticated, getUser } from "../services/authService";
import Header from "../Components/Header";
import ChangePasswordModal from "../Components/verification/ChangePasswordModal";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { updateFirstLogin, verifyToken, setUser } from "../store/slices/authSlice";
import { Line } from "react-chartjs-2";
import { Trash2, AlertTriangle, Server, Zap } from "lucide-react";
import DASHTRASH from "../assets/images/DASHTRASH.png";

import "../Components/graphs/chartSetup"; // keep for chartjs registration
import GreetingCard from "../Components/dashboard/GreetingCard";
import AdditivesPanel from "../Components/dashboard/AdditivesPanel";
import AlertsPanel from "../Components/dashboard/AlertsPanel";
import { getNotifications, type NotificationItem } from "../services/notificationService";
import EnergyCard from "../Components/dashboard/EnergyCard";
import FoodWasteCard from "../Components/dashboard/FoodWasteCard";
import StaffUsersCard from "../Components/dashboard/StaffUsersCard";
import ComparisonChart from "../Components/dashboard/ComparisonChart";

import { getUsersByRole } from "../services/userService";

/* ---------------- MOCK DATA ---------------- */

const analyticsByRange = {
  Yearly: {
    labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    barangayUsers: [45,52,48,58,62,68,72,78,82,88,95,100],
    householdUsers: [45,52,48,58,62,68,72,78,82,88,95,100],
    foodWaste: [120,135,125,145,155,168,175,185,195,205,215,220],
    gasYield: { percent: 14, volume: 135 },
    waste: { food: 124, manure: 124 },
    additives: { water: 40, manure: 20, others: 40, total: 100 },
    alerts: [
      { id: 1, type: "Methane Sensor", machine: "Sibol Machine 112103", problem: "Methane Sensor has stopped.", date: "February 6, 2026", severity: "error" },
      { id: 2, type: "Methane Sensor", machine: "Sibol Machine 112103", problem: "Methane Sensor has stopped.", date: "February 6, 2026", severity: "error" },
      { id: 3, type: "Methane Sensor", machine: "Sibol Machine 112103", problem: "Methane Sensor has stopped.", date: "February 6, 2026", severity: "error" },
    ],
  },
};

/* ---------------- MAIN DASHBOARD ---------------- */

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, isFirstLogin: isFirstLoginRedux } = useAppSelector((state) => state.auth);
  const [currentDate, setCurrentDate] = useState<string>("");
  const location = useLocation();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [hasProcessedUrlParams, setHasProcessedUrlParams] = useState(false);
  
  const [activeTab, setActiveTab] = useState<"barangay" | "food">("barangay");
  const data = analyticsByRange.Yearly;
  const [foodWasteData, setFoodWasteData] = useState<number[]>(data.foodWaste);

  // container-full alerts (system notifications)
  const [containerAlerts, setContainerAlerts] = useState<NotificationItem[]>([]);

  // household count (total number of household users)
  const [householdCount, setHouseholdCount] = useState<number | null>(null);

  // fetch monthly food waste for all areas on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const year = new Date().getFullYear();
        const resp = await apiGet(`/api/waste-collections/monthly?year=${year}`);
        const arr = resp.data?.data ?? resp.data;
        if (Array.isArray(arr) && arr.length === 12) {
          if (!cancelled) setFoodWasteData(arr.map((v: any) => Number(v) || 0));
        } else {
          console.warn("Unexpected monthly waste response, falling back to mock", arr);
        }
      } catch (e) {
        console.warn('Failed to load monthly waste for all areas', e);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // fetch household users count
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const resp = await getUsersByRole("Household");
        const count = Array.isArray(resp) ? resp.length : 0;
        if (!cancelled) setHouseholdCount(count);
      } catch (err) {
        console.warn("Failed to fetch household users", err);
        if (!cancelled) setHouseholdCount(null);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // add state for monthly household series
  const [householdSeries, setHouseholdSeries] = useState<number[]>(data.householdUsers ?? data.barangayUsers);

  // fetch household monthly series
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const year = new Date().getFullYear();
        const resp = await apiGet(`/api/users/role/Household/monthly?year=${year}&cumulative=1`);
        const arr = resp.data?.data ?? resp.data;
        if (!Array.isArray(arr) || arr.length !== 12) {
          console.warn("Unexpected household monthly response, falling back to mock");
          return;
        }
        if (!cancelled) setHouseholdSeries(arr.map((v: any) => Number(v) || 0));
      } catch (err) {
        console.warn("Failed to fetch household monthly series", err);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // fetch latest container full alerts
  useEffect(() => {
    let cancelled = false;
    if (!isAuthenticated) return;
    (async () => {
      try {
        const rows = await getNotifications({ type: 'system', limit: 50, offset: 0 });
        if (cancelled) return;
        const onlyFull = (rows || []).filter((n) => String(n?.eventType || '').toUpperCase() === 'CONTAINER_FULL');
        setContainerAlerts(onlyFull);
      } catch {
        if (cancelled) return;
        setContainerAlerts([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: "Household Users",
        // prefer householdUsers mock if present; fallback to legacy barangayUsers
        data: householdSeries,
        borderColor: "#7CB342",
        backgroundColor: "rgba(124,179,66,0.18)",
        fill: true,
        tension: 0.45,
        pointRadius: 0,
      },
      {
        label: "Food Waste Collected (kg)",
        data: foodWasteData,
        borderColor: "#F59E0B",
        backgroundColor: "rgba(245,158,11,0.18)",
        fill: true,
        tension: 0.45,
        pointRadius: 0,
      },
    ],
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const parseHashParams = (hash: string) => {
      if (!hash) return new URLSearchParams();
      const trimmed = hash.startsWith("#") ? hash.slice(1) : hash;
      return new URLSearchParams(trimmed);
    };

    const queryParams = new URLSearchParams(location.search);
    const hashParams = parseHashParams(window.location.hash);
    const get = (key: string) => queryParams.get(key) || hashParams.get(key);

    const token = get("token") || get("access_token") || get("auth_token");
    const userParam = get("user");
    const auth = get("auth");

    if (userParam) {
      try {
        const parsed = JSON.parse(decodeURIComponent(userParam));
        console.log('✅ User data from URL:', parsed);
        
        dispatch(setUser(parsed));
        
        setHasProcessedUrlParams(true);
        
        const cleanUrl = location.pathname;
        window.history.replaceState({}, "", cleanUrl);
        
        if (parsed.IsFirstLogin === 1) {
          console.log('✅ First login detected from URL - showing modal');
          setTimeout(() => setShowPasswordModal(true), 100);
        }
        
        return;
      } catch (e) {
        console.error('Failed to parse user data from URL:', e);
      }
    }

    if (token) {
      const cleanUrl = location.pathname;
      window.history.replaceState({}, "", cleanUrl);
    } else if (auth === "fail") {
      navigate("/login");
    }
  }, [location.search, location.hash, navigate, dispatch]);

  useEffect(() => {
    const hasUrlParams = location.search.includes('user=') || location.search.includes('token=');
    
    if (hasProcessedUrlParams || hasUrlParams || !isAuthenticated) {
      console.log('⏭️ Skipping verifyToken - URL params present or already processed');
      return;
    }
    
    dispatch(verifyToken());
  }, [hasProcessedUrlParams, isAuthenticated, dispatch]);

  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    
    const handlePopState = () => {
      if (!checkIsAuthenticated()) {
        navigate('/login', { replace: true });
      } else {
        window.history.pushState(null, '', window.location.href);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigate]);

  useEffect(() => {
    const updateDate = () => {
      const today = new Date();
      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      return today.toLocaleDateString(undefined, options);
    };
    setCurrentDate(updateDate());

    const timer = setInterval(() => setCurrentDate(updateDate()), 60 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    
    if (isAuthenticated && isFirstLoginRedux) {
      console.log('✅ Showing password modal');
      setShowPasswordModal(true);
    } else {
      setShowPasswordModal(false);
    }
  }, [isAuthenticated, isFirstLoginRedux, user]);

  // ---------- Waste helpers & state ----------
  const [wasteRange, setWasteRange] = useState<'weekly'|'monthly'|'yearly'>(() => {
    try { return (localStorage.getItem('wasteRange') as 'weekly'|'monthly'|'yearly') ?? 'monthly'; }
    catch { return 'monthly'; }
  });
  const [totalWaste, setTotalWaste] = useState<number | null>(null);
  const [isLoadingWaste, setIsLoadingWaste] = useState(false);

  const formatKg = (n: number) => n.toLocaleString();

  useEffect(() => {
    try { localStorage.setItem('wasteRange', wasteRange); } catch {}
    if (!isAuthenticated) { setTotalWaste(null); return; }

    let cancelled = false;
    (async () => {
      setIsLoadingWaste(true);
      try {
        const resp = await apiGet(`/api/waste-collections/total?range=${wasteRange}`);
        // handle possible response shapes
        const payload = resp.data?.data ?? resp.data;
        const value = Number(payload?.total_kg ?? payload?.total ?? payload ?? 0) || 0;
        if (!cancelled) setTotalWaste(value);
      } catch (err) {
        if (!cancelled) setTotalWaste(null);
        console.error('Failed fetching total waste', err);
      } finally {
        if (!cancelled) setIsLoadingWaste(false);
      }
    })();

    return () => { cancelled = true; };
  }, [wasteRange, isAuthenticated]);

  // Staff users (counts for roles)
  const [selectedStaffRole, setSelectedStaffRole] = useState<'all'|'barangay'|'admin'|'operator'>('all');
  const [staffCounts, setStaffCounts] = useState<{ all: number; barangay: number; admin: number; operator: number }>({
    all: 0, barangay: 0, admin: 0, operator: 0
  });
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;

    const fetchRoleCount = async (roleName: string) => {
      try {
        const resp = await apiGet(`/api/users/role/${roleName}`);
        const payload = resp.data?.data ?? resp.data;
        return Array.isArray(payload) ? payload.length : 0;
      } catch (err) {
        console.warn('Failed to fetch role', roleName, err);
        return 0;
      }
    };

    (async () => {
      setIsLoadingStaff(true);
      try {
        const [barangayCount, adminCount, operatorCount] = await Promise.all([
          fetchRoleCount('Barangay'),
          fetchRoleCount('Admin'),
          fetchRoleCount('Operator'),
        ]);
        const all = barangayCount + adminCount + operatorCount;
        if (!cancelled) setStaffCounts({ all, barangay: barangayCount, admin: adminCount, operator: operatorCount });
      } finally {
        if (!cancelled) setIsLoadingStaff(false);
      }
    })();

    return () => { cancelled = true; };
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 px-6 lg:px-8 py-8 flex flex-col gap-6 mt-[10vh] h-[calc(100vh-10vh)] overflow-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0">
          <GreetingCard firstName={user?.FirstName} lastName={user?.LastName} />

          <EnergyCard value={326} />

          <FoodWasteCard
            totalWaste={totalWaste}
            isLoading={isLoadingWaste}
            wasteRange={wasteRange}
            setWasteRange={setWasteRange}
            formatKg={formatKg}
          />

          <StaffUsersCard
            selectedStaffRole={selectedStaffRole}
            setSelectedStaffRole={setSelectedStaffRole}
            staffCounts={staffCounts}
            isLoading={isLoadingStaff}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
          <div className="w-full">
            <AdditivesPanel />
          </div>
          <div className="w-full">
            <AlertsPanel alerts={containerAlerts} />
          </div>
          
          <div className="w-full rounded-xl border bg-white p-4 shadow-sm flex flex-col">
            <div className="mb-2 flex justify-between items-center flex-wrap">
              <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded text-sm text-gray-600 bg-white hover:bg-gray-50">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter by
              </button>
            </div>
            <div className="h-40 relative flex-1">
              <Line 
                data={chartData} 
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                      align: 'end',
                      labels: {
                        usePointStyle: true,
                        boxWidth: 10,
                        font: { size: 12 }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </main>

      <ChangePasswordModal
        open={showPasswordModal}
        onClose={() => {
          if (!isFirstLoginRedux) {
            setShowPasswordModal(false);
          }
        }}
        onSuccess={() => {
          console.log('✅ Password changed successfully');
          setShowPasswordModal(false);
          dispatch(updateFirstLogin(false));
        }}
        isFirstLogin={isFirstLoginRedux}
      />
    </div>
  );
};

export default Dashboard;
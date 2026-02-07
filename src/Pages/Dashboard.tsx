import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { isAuthenticated as checkIsAuthenticated, getUser } from "../services/authService";
import Header from "../Components/Header";
import ChangePasswordModal from "../Components/verification/ChangePasswordModal";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { updateFirstLogin, verifyToken, setUser } from "../store/slices/authSlice";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
import { Trash2, AlertTriangle, Server, Zap } from "lucide-react";
import DASHTRASH from "../assets/images/DASHTRASH.png";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

/* ---------------- MOCK DATA ---------------- */

const analyticsByRange = {
  Yearly: {
    labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov"],
    actualGas: [20,35,30,55,45,70,60,85,65,78,55],
    forecastGas: [18,30,28,50,42,65,55,80,60,75,52],
    actualEnergy: [1.2,1.5,1.4,1.8,1.6,2.1,1.9,2.4,2.2,2.3,2.0],
    forecastEnergy: [1.1,1.4,1.3,1.6,1.5,2.0,1.8,2.3,2.1,2.2,1.9],
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

/* ---------------- ANALYTICS COMPONENTS ---------------- */

const GasYieldCard = ({
  data,
}: {
  data: { percent: number; volume: number };
}) => {
  const gaugeData = {
    datasets: [
      {
        data: [data.percent, 100 - data.percent],
        backgroundColor: ["#2E7D32", "#E6F4EA"],
        borderWidth: 0,
        cutout: "75%",
        rotation: -90,
        circumference: 180,
      },
    ],
  };

  return (
    <div className="rounded-xl bg-green-200 p-3 h-[110px]">
      <p className="text-xs font-semibold text-gray-800">Gas Yield</p>

      <div className="mt-2 flex items-center justify-between">
        <div className="flex flex-col justify-center">
          <p className="text-2xl font-bold leading-none text-gray-800">{data.percent}%</p>
          <p className="text-[10px] text-gray-600 mt-0.5">vs last period</p>
        </div>

        <div className="relative h-16 w-16 flex items-center justify-center">
          <Doughnut
            data={gaugeData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false }, tooltip: { enabled: false } },
            }}
          />
          <div className="absolute bottom-2 text-[9px] font-semibold text-gray-700">{data.volume} m³</div>
        </div>
      </div>
    </div>
  );
};

const EnergyYieldCard = ({ value, trend }: { value: number; trend: number[] }) => {
  const sparkData = {
    labels: trend.map((_, i) => i),
    datasets: [
      {
        data: trend,
        borderColor: "#F59E0B",
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 1.5,
      },
    ],
  };

  return (
    <div className="rounded-xl bg-yellow-200 p-3 h-[110px]">
      <p className="text-xs font-semibold text-gray-800">Energy Yield</p>
      <p className="text-xl font-bold text-gray-800 mt-1">{value} kWh</p>
      <div className="h-8 mt-1">
        <Line
          data={sparkData}
          options={{
            plugins: { legend: { display: false } },
            scales: { x: { display: false }, y: { display: false } },
            maintainAspectRatio: false,
          }}
        />
      </div>
    </div>
  );
};

const ProcessedWasteCard = ({ waste }: { waste: { food: number; manure: number } }) => (
  <div className="rounded-xl bg-orange-300 p-3 h-[110px]">
    <p className="text-xs font-semibold text-gray-800">Processed Waste</p>
    <div className="mt-2 flex justify-around gap-4">
      <div className="flex flex-col items-center">
        <Trash2 size={28} className="mb-1 text-gray-800" />
        <p className="font-bold text-base text-gray-800">{waste.food} kg</p>
        <p className="text-[10px] text-gray-700">Food Waste</p>
      </div>

      <div className="flex flex-col items-center">
        <PawPrint size={28} className="mb-1 text-gray-800" />
        <p className="font-bold text-base text-gray-800">{waste.manure} L</p>
        <p className="text-[10px] text-gray-700">Manure</p>
      </div>
    </div>
  </div>
);

const StatCard = ({ title, value }: { title: string; value: string | number }) => (
  <div className="rounded-xl border bg-white p-5 shadow-sm flex flex-col justify-center h-[120px]">
    <p className="text-4xl font-bold text-gray-800">{value}</p>
    <p className="text-sm font-semibold text-gray-600 mt-1 leading-tight">{title}</p>
  </div>
);

const GreetingCard = ({ 
  firstName, 
  lastName,
}: { 
  firstName?: string; 
  lastName?: string;
}) => (
  <div 
    className="rounded-xl overflow-hidden relative h-[120px] bg-cover bg-center bg-no-repeat"
    style={{
      backgroundImage: `url(${DASHTRASH})`,
    }}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-[#E8F5E9]/90 via-[#C8E6C9]/70 to-transparent" />
    <div className="relative h-full flex items-center justify-between px-5">
      <div className="z-10">
        <h2 className="text-xl font-bold text-[#1B5E20] whitespace-nowrap">Hello, {firstName || 'Ezedrex'} {lastName || 'Jo'}!</h2>
      </div>
    </div>
  </div>
);

const AdditivesPanel = ({
  additives,
}: {
  additives: { water: number; manure: number; others: number; total: number };
}) => {
  const items = [
    { label: "Others", value: additives.others, color: "#2E7D32" },
    { label: "Water", value: additives.water, color: "#9CCC65" },
    { label: "Manure", value: additives.manure, color: "#C5E1A5" },
  ];

  const chartData = {
    labels: items.map(i => i.label),
    datasets: [
      {
        data: items.map(i => i.value),
        backgroundColor: items.map(i => i.color),
        borderWidth: 0,
        cutout: "70%",
      },
    ],
  };

  return (
    <div className="rounded-xl border bg-white p-3 shadow-sm m-0">
      <p className="text-xs font-semibold mb-2 text-center text-gray-800">Additives Ratio</p>

      <div className="relative h-28 flex items-center justify-center">
        <Doughnut
          data={chartData}
          options={{
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (ctx) => {
                    const value = ctx.raw as number;
                    const pct = Math.round((value / additives.total) * 100);
                    return `${ctx.label}: ${value} L (${pct}%)`;
                  },
                },
              },
            },
          }}
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-lg font-bold leading-none text-gray-800">{additives.total}</p>
          <p className="text-[10px] text-gray-500">Liters</p>
        </div>
      </div>

      <div className="mt-2 space-y-1">
        {items.map(item => {
          const pct = Math.round((item.value / additives.total) * 100);
          return (
            <div key={item.label} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-700">{item.label}</span>
              </div>
              <span className="font-medium text-gray-800">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AlertsPanel = ({ alerts }: { alerts: any[] }) => (
  <div className="rounded-xl border bg-white p-3 shadow-sm m-0">
    <p className="text-sm font-semibold mb-3 text-center text-gray-800">Alerts</p>
    <div className="space-y-2">
      {alerts.slice(0, 3).map((alert) => (
        <div key={alert.id} className="flex items-start gap-3 bg-white border-l-4 border-red-200 px-3 py-3 rounded-lg text-xs shadow-sm">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex-shrink-0 flex items-center justify-center">
            <AlertTriangle size={16} className="text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-gray-800 text-xs">{alert.type}</p>
              <p className="text-[10px] text-gray-400">{alert.date}</p>
            </div>
            <p className="text-xs text-gray-600">{alert.machine}</p>
            <p className="text-xs text-gray-500 mt-0.5">Problem: {alert.problem}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const Tab = ({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded text-xs font-medium ${
      active ? "bg-green-800 text-white" : "bg-gray-100 text-gray-600"
    }`}
  >
    {label}
  </button>
);

/* ---------------- MAIN DASHBOARD ---------------- */

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, isFirstLogin: isFirstLoginRedux } = useAppSelector((state) => state.auth);
  const [currentDate, setCurrentDate] = useState<string>("");
  const location = useLocation();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [hasProcessedUrlParams, setHasProcessedUrlParams] = useState(false);
  
  const [activeTab, setActiveTab] = useState<"gas" | "energy">("gas");
  const data = analyticsByRange.Yearly;

  const chartData = {
    labels: data.labels,
    datasets:
      activeTab === "gas"
        ? [
            {
              label: "Actual",
              data: data.actualGas,
              borderColor: "#7CB342",
              backgroundColor: "rgba(124,179,66,0.18)",
              fill: true,
              tension: 0.45,
              pointRadius: 0,
            },
            {
              label: "Forecast",
              data: data.forecastGas,
              borderColor: "#F59E0B",
              borderDash: [6, 6],
              tension: 0.45,
              pointRadius: 0,
            },
          ]
        : [
            {
              label: "Actual",
              data: data.actualEnergy,
              borderColor: "#7CB342",
              backgroundColor: "rgba(124,179,66,0.18)",
              fill: true,
              tension: 0.45,
              pointRadius: 0,
            },
            {
              label: "Forecast",
              data: data.forecastEnergy,
              borderColor: "#F59E0B",
              borderDash: [6, 6],
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 px-6 lg:px-8 py-8 flex flex-col gap-6 mt-[10vh] h-[calc(100vh-10vh)] overflow-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0">
          <GreetingCard 
            firstName={user?.FirstName} 
            lastName={user?.LastName}
          />
          <StatCard title="Active SIBOL Machines" value="326" />
          <StatCard title="Total Waste Collected" value="326" />
          <StatCard title="Total Energy Converted" value="326" />
        </div>

        <div className="flex flex-col lg:flex-row gap-4 flex-1">
          <div className="w-full lg:w-1/2 flex flex-row gap-2">
            <AdditivesPanel additives={data.additives} />
            <AlertsPanel alerts={data.alerts} />
          </div>
          
          <div className="w-full lg:w-1/2 rounded-xl border bg-white p-4 shadow-sm flex flex-col">
            <div className="mb-3 flex justify-between items-center flex-wrap gap-2">
              <div className="flex gap-2">
                <Tab
                  label="Gas Yield"
                  active={activeTab === "gas"}
                  onClick={() => setActiveTab("gas")}
                />
                <Tab
                  label="Energy Yield"
                  active={activeTab === "energy"}
                  onClick={() => setActiveTab("energy")}
                />
              </div>
              <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded text-xs text-gray-600 bg-white hover:bg-gray-50">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter by
              </button>
            </div>
            <div className="h-24 relative">
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
                        boxWidth: 8,
                        font: { size: 10 }
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

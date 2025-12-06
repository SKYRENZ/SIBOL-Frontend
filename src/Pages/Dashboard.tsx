import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { isAuthenticated as checkIsAuthenticated, getUser } from "../services/authService";
import Header from "../Components/Header";
import ProcessPanel from "../Components/dashboard/ProcessPanel";
import TotalWastePanel from "../Components/TotalWastePanel";
import CollectionSchedule from "../Components/CollectionSchedule";
import EnergyChart from "../Components/EnergyChart";
import ChangePasswordModal from "../Components/verification/ChangePasswordModal";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { logout, updateFirstLogin, verifyToken } from "../store/slices/authSlice";

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isFirstLogin: isFirstLoginRedux } = useAppSelector((state) => state.auth);
  const [barangay] = useState("Barangay 176 - E");
  const [currentDate, setCurrentDate] = useState<string>("");
  const navigate = useNavigate();
  const location = useLocation();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // 🔐 Auth check - redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // ✅ NEW: Verify token on mount to refresh user state
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(verifyToken());
    }
  }, [dispatch, isAuthenticated]);

  // Prevent back/forward navigation issues
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

  // 🕓 Date updater
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

  // 🔐 Token / Auth check
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
    const user = get("user");
    const auth = get("auth");

    if (user) {
      try {
        const parsed = JSON.parse(decodeURIComponent(user));
        localStorage.setItem("user", JSON.stringify(parsed));
      } catch {
        // Silent fail
      }
    }

    if (token) {
      const cleanUrl = location.pathname;
      window.history.replaceState({}, "", cleanUrl);
    } else if (auth === "fail") {
      navigate("/login");
    }
  }, [location, navigate]);

  // ✅ FIX: Show modal based on Redux isFirstLogin state
  useEffect(() => {
    console.log('🔍 Dashboard - isAuthenticated:', isAuthenticated, 'isFirstLogin:', isFirstLoginRedux);
    
    if (isAuthenticated && isFirstLoginRedux) {
      console.log('✅ Showing password modal');
      setShowPasswordModal(true);
    } else {
      setShowPasswordModal(false);
    }
  }, [isAuthenticated, isFirstLoginRedux]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* 🧭 Main Content */}
      <main className="flex-1 px-4 sm:px-6 md:px-8 py-6 flex flex-col gap-6 mt-[8vh]">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#214E41]">
              Welcome, {barangay}!
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Come and save the environment with{" "}
              <span className="text-[#214E41] font-semibold">SIBOL Project</span>.
            </p>
          </div>
          <div className="font-semibold text-[#214E41] text-base sm:text-lg mt-2 sm:mt-0">
            {currentDate}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr,2fr] gap-6 h-full">
          {/* Left panel */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 flex items-center justify-center">
            <TotalWastePanel />
          </div>

          {/* Right side */}
          <div className="flex flex-col gap-6">
            {/* Process flow */}
            <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 flex items-center justify-center overflow-x-auto">
              <ProcessPanel />
            </div>

            {/* Bottom panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <CollectionSchedule />
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <EnergyChart />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ✅ Password Change Modal - OUTSIDE main, INSIDE root div */}
      <ChangePasswordModal
        open={showPasswordModal}
        onClose={() => {
          // Only allow closing if NOT first login
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

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
import { logout, updateFirstLogin, verifyToken, setUser } from "../store/slices/authSlice";

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isFirstLogin: isFirstLoginRedux } = useAppSelector((state) => state.auth);
  const [barangay] = useState("Barangay 176 - E");
  const [currentDate, setCurrentDate] = useState<string>("");
  const navigate = useNavigate();
  const location = useLocation();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [hasProcessedUrlParams, setHasProcessedUrlParams] = useState(false); // ✅ NEW: Track if we processed URL params

  // 🔐 Auth check - redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // ✅ FIX: Handle approval link FIRST - before anything else
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

    console.log('🔍 Dashboard URL params:', { 
      token: token ? 'present' : 'none', 
      user: userParam ? 'present' : 'none', 
      auth,
      location: location.pathname + location.search
    });

    // ✅ CRITICAL: Handle user data from approval email link FIRST
    if (userParam) {
      try {
        const parsed = JSON.parse(decodeURIComponent(userParam));
        console.log('✅ User data from URL:', parsed);
        
        // Store in localStorage
        localStorage.setItem("user", JSON.stringify(parsed));
        
        // ✅ Update Redux state immediately
        dispatch(setUser(parsed));
        
        // ✅ Mark that we processed URL params
        setHasProcessedUrlParams(true);
        
        // Clean URL after extracting data
        const cleanUrl = location.pathname;
        window.history.replaceState({}, "", cleanUrl);
        
        // ✅ If IsFirstLogin=1, show modal immediately
        if (parsed.IsFirstLogin === 1) {
          console.log('✅ First login detected from URL - showing modal');
          setTimeout(() => setShowPasswordModal(true), 100); // ✅ Small delay to ensure state is updated
        }
        
        return; // ✅ Exit early - don't process anything else
      } catch (e) {
        console.error('Failed to parse user data from URL:', e);
      }
    }

    // Handle token/auth params (secondary)
    if (token) {
      const cleanUrl = location.pathname;
      window.history.replaceState({}, "", cleanUrl);
    } else if (auth === "fail") {
      navigate("/login");
    }
  }, [location.search, location.hash, navigate, dispatch]); // ✅ CHANGED: Removed location from deps to prevent re-runs

  // ✅ FIX: Only verify token if NO user data in URL AND we haven't processed URL params
  useEffect(() => {
    // ✅ Don't run if:
    // 1. We just processed URL params
    // 2. URL contains user data
    // 3. Not authenticated
    const hasUrlParams = location.search.includes('user=') || location.search.includes('token=');
    
    if (hasProcessedUrlParams || hasUrlParams || !isAuthenticated) {
      console.log('⏭️ Skipping verifyToken - URL params present or already processed');
      return;
    }

    console.log('🔄 Verifying token...');
    dispatch(verifyToken());
  }, [hasProcessedUrlParams, isAuthenticated, dispatch]); // ✅ CHANGED: Removed location.search from deps

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

  // ✅ FIX: Show modal based on Redux isFirstLogin state (with extra logging)
  useEffect(() => {
    console.log('🔍 Modal check - isAuthenticated:', isAuthenticated, 'isFirstLogin:', isFirstLoginRedux, 'user:', user);
    
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

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../Components/Header';
import TotalWastePanel from '../Components/TotalWastePanel';
import ProcessPanel from '../Components/ProcessPanel';
import CollectionSchedule from '../Components/CollectionSchedule';
import EnergyChart from '../Components/EnergyChart';
import '../types/Dashboard.css';

const Dashboard: React.FC = () => {
  const [barangay] = useState('Barangay 176 - E');
  const [currentDate, setCurrentDate] = useState<string>('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const updateDate = () => {
      const today = new Date();
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
      return today.toLocaleDateString(undefined, options);
    };

    setCurrentDate(updateDate());

    const timer = setInterval(() => {
      setCurrentDate(updateDate());
    }, 60 * 60 * 1000);

    return () => clearInterval(timer);
  }, []);

  // Handle SSO token/user returned via query string or hash fragment
  useEffect(() => {
    // helper to parse hash like #token=...&user=...
    const parseHashParams = (hash: string) => {
      if (!hash) return new URLSearchParams();
      const trimmed = hash.startsWith('#') ? hash.slice(1) : hash;
      return new URLSearchParams(trimmed);
    };

    const queryParams = new URLSearchParams(location.search);
    const hashParams = parseHashParams(window.location.hash);

    const get = (key: string) => queryParams.get(key) || hashParams.get(key);

    const token = get('token') || get('access_token') || get('auth_token');
    const user = get('user');
    const auth = get('auth');

    if (token) {
      localStorage.setItem('token', token);
    }

    if (user) {
      try {
        const parsed = JSON.parse(decodeURIComponent(user));
        localStorage.setItem('user', JSON.stringify(parsed));
      } catch (e) {
        console.warn('Failed to parse user from SSO redirect', e);
      }
    }

    if (token) {
      // remove query and hash to clean URL
      const cleanUrl = location.pathname;
      window.history.replaceState({}, '', cleanUrl);
      // optionally navigate to a specific dashboard sub-route
      // navigate('/dashboard/home', { replace: true });
    } else if (auth === 'fail') {
      navigate('/login');
    }
  }, [location, navigate]);

  return (
    <div className="dashboardContainer">
      <Header />
      <main>
        <div className="headerSection">
          <div>
            <h1 className="welcomeTitle">Welcome, {barangay}!</h1>
            <p className="subtitle">
              Come and save the environment with{' '}
              <span className="highlightGreen">SIBOL Project</span>.
            </p>
          </div>
          <div className="dateText">{currentDate}</div>
        </div>

        <div className="dashboardGrid">
          {/* Waste panel on left full height */}
          <div className="widgetBox wastePanel">
            <TotalWastePanel />
          </div>

          {/* Right side container for process + bottom panels */}
          <div className="rightSide">
            <div className="widgetBox processPanel">
              <ProcessPanel />
            </div>
            <div className="bottomRightRow">
              <div className="widgetBox schedulePanel">
                <CollectionSchedule />
              </div>
              <div className="widgetBox chartPanel">
                <EnergyChart />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

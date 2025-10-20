import React, { useEffect, useState } from 'react';
import Header from '../Components/Header';
import TotalWastePanel from '../Components/TotalWastePanel';
import ProcessPanel from '../Components/ProcessPanel';
import CollectionSchedule from '../Components/CollectionSchedule';
import EnergyChart from '../Components/EnergyChart';
import '../types/Dashboard.css';

const Dashboard: React.FC = () => {
  const [barangay] = useState('Barangay 176 - E');
  const [currentDate, setCurrentDate] = useState<string>('');

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

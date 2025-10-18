import React, { useState, useEffect } from 'react';
import '../types/ProcessPanel.css';

const stages = [
  { id: 1, label: 'Filtering' },
  { id: 2, label: 'Slurry Making' },
  { id: 3, label: 'Biogas Generation' },
  { id: 4, label: 'Final Output' },
];

const ProcessPanel: React.FC = () => {
  const [currentStage, setCurrentStage] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStage((prev) => (prev < 4 ? prev + 1 : 1));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="panel-box process-panel">
      <h3 className="process-title">Process Panel</h3>
      <div className="flow-container">
        {stages.map((stage, index) => {
          const isCompleted = stage.id < currentStage;
          const isActive = stage.id === currentStage;
          const statusClass = isCompleted
            ? 'completed'
            : isActive
            ? 'active'
            : 'upcoming';

          return (
            <React.Fragment key={stage.id}>
              <div className={`node ${statusClass}`}>
                <img
                  src={new URL('../assets/images/bin.svg', import.meta.url).href}
                  alt={`${stage.label} icon`}
                  className="node-icon"
                />
                <span className="node-label">{stage.label}</span>
              </div>

              {index !== stages.length - 1 && (
                <div className={`connector connector-${statusClass}`}>
                  <svg
                    width="48"
                    height="24"
                    viewBox="0 0 48 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0 12 H40 M30 6 L40 12 L30 18"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="connector-path"
                    />
                  </svg>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ProcessPanel;

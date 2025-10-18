import React, { useState } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import '../types/TotalWastePanel.css';

ChartJS.register(ArcElement, Tooltip, Legend);

type FilterType = 'weekly' | 'monthly' | 'yearly';

const placeholderData: Record<FilterType, number[]> = {
  weekly: [1.5, 1.2, 1.3],
  monthly: [5, 6, 5],
  yearly: [60, 70, 62],
};

const placeholderStats: Record<FilterType, number> = {
  weekly: 4,
  monthly: 16,
  yearly: 192,
};

const TotalWastePanel: React.FC = () => {
  const [filter, setFilter] = useState<FilterType>('weekly');
  const dataValues = placeholderData[filter];
  const total = dataValues.reduce((a, b) => a + b, 0);

  const data = {
    labels: ['Street 1', 'Street 2', 'Street 3'],
    datasets: [
      {
        data: dataValues,
        backgroundColor: ['#2E523A', '#88AB8E', '#AFC8AD'],
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    cutout: '50%',
    plugins: {
      legend: {
        display: false,
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="widgetBox total-waste-panel refined">
      <div className="top-row">
        <div className="legend-manual">
          {data.labels.map((lbl, i) => (
            <div key={lbl} className="legend-item">
              <span
                className="legend-box"
                style={{ backgroundColor: data.datasets[0].backgroundColor[i] }}
              ></span>
              {lbl}
            </div>
          ))}
        </div>
        <div className="filter-dropdown">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterType)}
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>

      <div className="chart-container">
        <Doughnut data={data} options={options} />
        <div className="center-label">{total.toFixed(2)}kg</div>
      </div>
    <div className="stats-row">
    {(['weekly', 'monthly', 'yearly'] as const).map((key) => (
        <div key={key} className="stat-block">
        <img
            src={new URL("../assets/images/bin.svg", import.meta.url).href}
            alt="Bin icon"
            className="stat-icon"
        />
        <div className="stat-text">
            <p className="stat-amount">{placeholderStats[key]} kg</p>
            <span className="stat-label">
            {key.charAt(0).toUpperCase() + key.slice(1)}
            </span>
        </div>
        </div>
    ))}
    </div>
    </div>
  );
};

export default TotalWastePanel;

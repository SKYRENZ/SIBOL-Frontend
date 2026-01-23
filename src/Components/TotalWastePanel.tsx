import React, { useState } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

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
    <div className="flex flex-col p-6 min-h-[450px] gap-6 justify-between bg-white rounded-lg shadow-sm">
      {/* Top Row */}
      <div className="flex justify-between items-start gap-4">
        {/* Legend */}
        <div className="flex flex-col gap-2 flex-grow">
          {data.labels.map((lbl, i) => (
            <div key={lbl} className="flex items-center text-[14px] text-[#355842]">
              <span
                className="inline-block w-3.5 h-3.5 rounded-sm mr-1.5"
                style={{ backgroundColor: data.datasets[0].backgroundColor[i] }}
              />
              {lbl}
            </div>
          ))}
        </div>

        {/* Filter Dropdown */}
        <div className="self-start relative">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterType)}
            className="pl-4 pr-9 py-2 text-[14px] font-semibold text-[#2E523A] bg-[#e8f5e9] border-2 border-[#2E523A] rounded-md appearance-none cursor-pointer
                       hover:bg-[#d0ecd4]"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          {/* Optional: Arrow using absolute div if needed */}
        </div>
      </div>

      {/* Chart */}
      <div className="relative flex justify-center items-center h-[220px]">
        <Doughnut data={data} options={options} className="max-w-[200px] max-h-[200px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[18px] font-bold text-[#355842]">
          {total.toFixed(2)}kg
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex justify-around mt-4 gap-6">
        {(['weekly', 'monthly', 'yearly'] as const).map((key) => (
          <div key={key} className="flex flex-col items-center text-center gap-1.5">
            <img
              src={new URL("../assets/images/bin.svg", import.meta.url).href}
              alt="Bin icon"
              className="w-12 h-12"
            />
            <div>
              <p className="m-0 text-[16px] font-bold text-[#355842]">
                {placeholderStats[key]} kg
              </p>
              <span className="text-[12px] text-[#666]">
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

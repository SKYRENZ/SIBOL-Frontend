import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler,
  Tooltip,
  Legend
);

const EnergyChart: React.FC = () => {
  const data = {
    labels: ['January', 'February', 'March'],
    datasets: [
      {
        label: '2020',
        data: [60, 80, 75],
        fill: true,
        backgroundColor: 'rgba(46, 125, 50, 0.2)',
        borderColor: '#2e7d32',
        tension: 0.4,
        pointBackgroundColor: '#2e7d32',
      },
      {
        label: '2021',
        data: [55, 340, 230],
        fill: true,
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        borderColor: '#4caf50',
        tension: 0.4,
        pointBackgroundColor: '#4caf50',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#1f4f2d',
        },
        title: {
          display: true,
          text: 'Unit: kilowatts',
          color: '#1f4f2d',
        },
      },
      x: {
        ticks: {
          color: '#1f4f2d',
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: '#1f4f2d',
        },
      },
    },
  };

  return (
    <div
      className="
        w-full h-full relative min-h-[150px] max-h-full overflow-hidden
        flex flex-col items-center justify-center text-[#355842]
      "
    >
      <h3 className="text-lg font-semibold mb-2">Energy Conversion</h3>

      <Line data={data} options={options} />
    </div>
  );
};

export default EnergyChart;

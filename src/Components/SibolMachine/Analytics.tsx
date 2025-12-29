import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// =============================
// MOCK DATA (replace with API later)
// =============================
const mockAnalyticsData = {
  area: {
    barangay: "BRGY. 176-E",
    location: "Petunia Street",
  },
  processHistory: [
    { id: "001", stage: "Stage 1", startDate: "11/21/2025" },
    { id: "002", stage: "Stage 2", startDate: "11/21/2025" },
    { id: "003", stage: "Stage 3", startDate: "11/21/2025" },
  ],
  gasYield: {
    labels: [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ],
    values: [20, 25, 28, 35, 22, 55, 40, 85, 50, 70, 30, 80],
  },
};

const Analytics = () => {
  const [data, setData] = useState(mockAnalyticsData);

  useEffect(() => {
    // later: fetch("/api/analytics").then(...)
    setData(mockAnalyticsData);
  }, []);

  // =============================
  // Chart Configuration
  // =============================
  const gasYieldChart = {
    labels: data.gasYield.labels,
    datasets: [
      {
        label: "Gas Yield",
        data: data.gasYield.values,
        backgroundColor: "#2E523A",
        borderRadius: 6,
      },
    ],
  };

  const gasYieldOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "#E5E7EB" },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  return (
    <div className="space-y-6 p-2">
      {/* =============================
          MAIN GRID
      ============================== */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* Area Card */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-[#2E523A]">
              {data.area.barangay}
            </h3>
            <p className="mb-3 text-xs text-gray-500">
              Area of SIBOL Machines
            </p>

            <select className="w-full rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E523A]">
              <option>{data.area.location}</option>
            </select>
          </div>

          {/* Process History */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-[#2E523A]">
              PROCESS HISTORY
            </h3>

            <div className="space-y-3">
              <div className="grid grid-cols-3 text-xs font-medium text-gray-500">
                <span>Process no.</span>
                <span>Stage</span>
                <span>Start Date</span>
              </div>

              {data.processHistory.map(item => (
                <div
                  key={item.id}
                  className="grid grid-cols-3 rounded-lg border px-3 py-2 text-xs"
                >
                  <span>{item.id}</span>
                  <span>{item.stage}</span>
                  <span>{item.startDate}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="rounded-xl border bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#2E523A]">
              GAS YIELD
            </h3>
          </div>

          <Bar data={gasYieldChart} options={gasYieldOptions} />
        </div>
      </div>
    </div>
  );
};

export default Analytics;

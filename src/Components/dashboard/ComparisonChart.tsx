import React from "react";
import { Line } from "react-chartjs-2";
import "../graphs/chartSetup";

const ComparisonChart = ({ data }: { data: any }) => (
  <div className="w-full rounded-xl border bg-white p-4 shadow-sm flex flex-col h-40">
    <div className="mb-2 flex justify-between items-center flex-wrap">
      <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded text-sm text-gray-600 bg-white hover:bg-gray-50">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
        Filter by
      </button>
    </div>
    <div className="h-40 relative flex-1">
      <Line
        data={data}
        options={{
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              align: 'end',
              labels: { usePointStyle: true, boxWidth: 10, font: { size: 12 } }
            }
          }
        }}
      />
    </div>
  </div>
);

export default ComparisonChart;
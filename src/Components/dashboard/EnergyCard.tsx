import React from "react";

interface EnergyCardProps {
  value: string | number;
  className?: string;
}

export default function EnergyCard({ value, className = "" }: EnergyCardProps) {
  return (
    <div className={`relative rounded-xl border bg-white p-5 shadow-sm flex flex-col justify-center h-[120px] ${className}`}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, backgroundColor: '#F59E0B' }} />
      <p className="text-4xl font-bold text-gray-800">{value}</p>
      <p className="text-sm font-semibold text-gray-600 mt-1 leading-tight">Total Energy Converted</p>
    </div>
  );
}
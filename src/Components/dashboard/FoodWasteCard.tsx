import React from "react";

const FoodWasteCard = ({ totalWaste, isLoading, wasteRange, setWasteRange, formatKg }: any) => (
  <div className="relative rounded-xl border bg-white p-5 shadow-sm flex flex-col justify-between h-[120px]">
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, backgroundColor: '#8B5E3C' }} />
    <div className="flex items-start justify-between">
      <div>
        <p className="text-4xl font-bold text-gray-800 flex items-center gap-3">
          {isLoading ? (
            <span className="inline-flex items-center gap-2 text-base">
              <svg className="animate-spin h-5 w-5 text-gray-600" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              Loading
            </span>
          ) : totalWaste !== null ? (
            `${formatKg(totalWaste)} kg`
          ) : (
            '—'
          )}
        </p>
        <p className="text-sm font-semibold text-gray-600 mt-1 leading-tight">Food Waste Collected</p>
      </div>
      <div />
    </div>

    <div className="absolute right-4 bottom-3 flex gap-2 items-center">
      <select
        value={wasteRange}
        onChange={(e) => setWasteRange(e.target.value as any)}
        className="px-3 py-1.5 rounded border bg-white text-sm"
      >
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
        <option value="yearly">Yearly</option>
      </select>
    </div>
  </div>
);

export default FoodWasteCard;
import React from "react";

const StaffUsersCard = ({ selectedStaffRole, setSelectedStaffRole, staffCounts, isLoading }: any) => (
  <div className="relative rounded-xl border bg-white p-5 shadow-sm flex flex-col justify-center h-[120px]">
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, backgroundColor: '#7CB342' }} />
    <p className="text-4xl font-bold text-gray-800">
      {isLoading ? (
        <span className="inline-flex items-center gap-2 text-base">
          <svg className="animate-spin h-5 w-5 text-gray-600" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          Loading
        </span>
      ) : (
        (selectedStaffRole === 'all' ? staffCounts.all : staffCounts[selectedStaffRole]).toLocaleString()
      )}
    </p>

    <p className="text-sm font-semibold text-gray-600 mt-1 leading-tight">Total Staff Users</p>

    <div className="absolute right-4 bottom-3 flex gap-2 items-center">
      <select
        value={selectedStaffRole}
        onChange={(e) => setSelectedStaffRole(e.target.value as any)}
        className="px-3 py-1.5 rounded border bg-white text-sm"
      >
        <option value="all">All</option>
        <option value="barangay">Barangay</option>
        <option value="admin">Admin</option>
        <option value="operator">Operator</option>
      </select>
    </div>
  </div>
);

export default StaffUsersCard;
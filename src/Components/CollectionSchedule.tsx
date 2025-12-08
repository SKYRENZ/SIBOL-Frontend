import React from 'react';

interface ScheduleItem {
  area: string;
  staff: string;
  date: string;
}

const placeholderData: ScheduleItem[] = [
  { area: 'Package 1', staff: 'Laurenz Listangco', date: '11/21/2003' },
  { area: 'Package 2', staff: 'Laurenz Listangco', date: '11/21/2003' },
  { area: 'Package 3', staff: 'Laurenz Listangco', date: '11/21/2003' },
];

const CollectionSchedule: React.FC = () => {
  return (
    <div className="border-2 border-[#cce0d0] rounded-xl p-6 bg-white text-[#1c3c2d] shadow-sm">
      <h3 className="text-xl font-extrabold text-center mb-6 text-[#1c3c2d]">
        Collection Schedule
      </h3>

      {/* Header */}
      <div className="grid grid-cols-[1fr_2fr_1fr] font-semibold mb-3 px-3 text-[#1c3c2d]">
        <span>Area</span>
        <span>Staff</span>
        <span>Date</span>
      </div>

      {/* Rows */}
      {placeholderData.map((item, index) => (
        <div
          key={index}
          className="grid grid-cols-[1fr_2fr_1fr] bg-[#f9f9f9] border border-[#dce5dc] rounded-lg p-3 mb-3 font-semibold text-[#2e523a]"
        >
          <span className="area">{item.area}</span>
          <span className="staff">{item.staff}</span>
          <span className="date font-medium text-gray-400">{item.date}</span>
        </div>
      ))}
    </div>
  );
};

export default CollectionSchedule;

import React from 'react';
import '../types/CollectionSchedule.css';

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
    <div className="collection-schedule">
      <h3 className="schedule-title">Collection Schedule</h3>
      <div className="schedule-header">
        <span>Area</span>
        <span>Staff</span>
        <span>Date</span>
      </div>
      {placeholderData.map((item, index) => (
        <div key={index} className="schedule-row">
          <span className="area">{item.area}</span>
          <span className="staff">{item.staff}</span>
          <span className="date">{item.date}</span>
        </div>
      ))}
    </div>
  );
};

export default CollectionSchedule;

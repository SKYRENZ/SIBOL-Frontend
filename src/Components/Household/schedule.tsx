import React from "react";

const ScheduleTab: React.FC = () => {
  return (
    <div className="table-section">
      <table className="household-table">
        <thead>
          <tr>
            <th>Maintenance Person</th>
            <th>Area</th>
            <th>Status</th>
            <th>Collector Contact</th>
            <th>Date of Collection</th>
            <th>Total Waste</th>
          </tr>
        </thead>
        <tbody>
          {/* Placeholder data - Replace with backend data later */}
          <tr>
            <td>Carlos Dela Cruz</td>
            <td>Barangay 167, Caloocan City</td>
            <td className="status-collected">Collected</td>
            <td>0912 345 6789</td>
            <td>2025-10-12</td>
            <td>8.5 kg</td>
          </tr>
          <tr>
            <td>Maria Santos</td>
            <td>Barangay 168, Caloocan City</td>
            <td className="status-pending">Pending</td>
            <td>0919 876 5432</td>
            <td>2025-10-14</td>
            <td>5.2 kg</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ScheduleTab;

import React, { useState } from "react";
import EditButton from "../editButton";

interface RowData {
  maintenance: string;
  area: string[];
  status: string;
  contact: string;
  date: string;
  totalWaste?: string;
}

interface ScheduleTabProps {
  onEdit: (row: RowData) => void; 
}

const sampleData: RowData[] = [
  {
    maintenance: "Justine Bryan Peralta",
    area: ["Petunia St."],
    status: "Collecting",
    contact: "collector1@gmail.com",
    date: "10/08/25",
    totalWaste: undefined,
  },
  {
    maintenance: "Laira Coleen",
    area: ["Zapote Rd."],
    status: "Pending",
    contact: "0998293339",
    date: "10/08/25",
    totalWaste: undefined,
  },
  {
    maintenance: "Jennie Kim",
    area: ["Zapote Rd."],
    status: "Canceled",
    contact: "0998293339",
    date: "10/08/25",
    totalWaste: undefined,
  },
  {
    maintenance: "Laira Coleen",
    area: ["Zapote Rd."],
    status: "Collected",
    contact: "0998293339",
    date: "10/08/25",
    totalWaste: "350 kg",
  },
];

const ScheduleTab: React.FC<ScheduleTabProps> = ({ onEdit }) => {
  const [rows] = useState<RowData[]>(sampleData);

  return (
    <div className="overflow-x-auto px-6">
      <table className="min-w-full border-separate border-spacing-y-2">
        <thead>
          <tr className="bg-green-50 text-left text-sm font-semibold text-green-900">
            <th className="px-4 py-2">Maintenance Person</th>
            <th className="px-4 py-2">Area</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Collector’s Contact</th>
            <th className="px-4 py-2">Date of Collection</th>
            <th className="px-4 py-2">Total Waste</th>
            <th className="px-4 py-2 text-right">Action</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((r, idx) => (
            <tr key={idx} className="bg-white rounded-lg text-gray-800">
              <td className="px-4 py-3">{r.maintenance}</td>
              <td className="px-4 py-3">{r.area.join(", ")}</td>
              <td
                className={`px-4 py-3 font-medium ${
                  r.status === "Collected"
                    ? "text-green-600"
                    : r.status === "Pending"
                    ? "text-yellow-500"
                    : r.status === "Canceled"
                    ? "text-gray-400"
                    : "text-green-800"
                }`}
              >
                {r.status}
              </td>
              <td className="px-4 py-3">{r.contact}</td>
              <td className="px-4 py-3">{r.date}</td>
              <td className="px-4 py-3">{r.totalWaste ?? "---"}</td>
              <td className="px-4 py-3 text-right">
                <EditButton
                  onClick={() => onEdit(r)}
                  disable={r.status === "Canceled"}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScheduleTab;

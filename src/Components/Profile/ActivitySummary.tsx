import React from "react";

// Mock data (replace with backend data later)
const activityData = {
  totalWasteCollected: 150, // in kg
  totalTicketsPending: 5,
  tasksCompleted: 26,
};

interface ActivityCardProps {
  title: string;
  value: number;
  unit?: string;
  variant?: "light" | "medium" | "dark";
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  title,
  value,
  unit = "",
  variant = "light",
}) => {
  const variants = {
    light: "bg-[#a8d5ba]",
    medium: "bg-[#6b8f71]",
    dark: "bg-[#2E523A]",
  };

  return (
    <div
      className={`${variants[variant]} rounded-xl shadow-md w-64 h-40 flex flex-col items-center justify-center text-white`}
    >
      <p className="text-lg font-medium mb-2">{title}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-4xl font-semibold">{value}</p>
        {unit && <span className="text-lg font-medium">{unit}</span>}
      </div>
    </div>
  );
};

const ActivitySummary: React.FC = () => {
  return (
    <div className="px-8 py-6">
      <h2 className="text-2xl font-semibold text-[#1c3c2d] mb-6">
        Activity Summary
      </h2>

      <div className="flex flex-wrap gap-8">
        <ActivityCard
          title="Total Waste Collected"
          value={activityData.totalWasteCollected}
          unit="kg"
          variant="light"
        />

        <ActivityCard
          title="Total Ticket Pending"
          value={activityData.totalTicketsPending}
          variant="medium"
        />

        <ActivityCard
          title="Tasks Completed"
          value={activityData.tasksCompleted}
          variant="dark"
        />
      </div>
    </div>
  );
};

export default ActivitySummary;

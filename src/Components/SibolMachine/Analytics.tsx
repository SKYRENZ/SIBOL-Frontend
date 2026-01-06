import React, { useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { Trash, Flame, Zap } from "lucide-react";
import CountUp from "react-countup";
import FilterPanel from "../common/filterPanel";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

/* ============================= MOCK DATA ============================= */
const analyticsByRange = {
  Weekly: {
    gas: [5, 8, 6, 9, 7, 10, 8],
    energy: [30, 45, 40, 55, 50, 60, 58],
    contributors: [
      { name: "Karl Miranda", waste: "3.2 kg" },
      { name: "Laurenz Listangco", waste: "3.2 kg" },
      { name: "EJ Benig", waste: "2.8 kg" },
      { name: "Justine Peralta", waste: "2.4 kg" },
    ],
    labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    kpis: {
      totalWaste: 8.5,
      gasProduced: 53,
      energyGenerated: 338,
    },
  },
  Monthly: {
    gas: [20, 25, 28, 35],
    energy: [120, 150, 180, 210],
    contributors: [
      { name: "Karl Miranda", waste: "3.2 kg" },
      { name: "Laurenz Listangco", waste: "3.2 kg" },
      { name: "EJ Benig", waste: "2.8 kg" },
      { name: "Justine Peralta", waste: "2.4 kg" },
    ],
    labels: ["Jan", "Feb", "Mar", "Apr"],
    kpis: {
      totalWaste: 12.4,
      gasProduced: 108,
      energyGenerated: 660,
    },
  },
  Yearly: {
    gas: [20, 25, 28, 35, 22, 55, 40, 85, 50, 70, 30, 80],
    energy: [120, 150, 180, 210, 170, 260, 230, 310, 280, 300, 220, 340],
    contributors: [{ name: "Juan Dela Cruz", waste: "38 kg" }],
    labels: [
      "Jan","Feb","Mar","Apr","May","Jun",
      "Jul","Aug","Sep","Oct","Nov","Dec",
    ],
    kpis: {
      totalWaste: 38,
      gasProduced: 540,
      energyGenerated: 2770,
    },
  },
};

const ranges: ("Weekly" | "Monthly" | "Yearly")[] = ["Weekly", "Monthly", "Yearly"];

interface KpiCardProps {
  title: string;
  value: number;
  unit: string;
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
}

interface Contributor {
  name: string;
  waste: string;
}

interface HouseholdPanelProps {
  contributors: Contributor[];
}

const Analytics = () => {
  const [activeChart, setActiveChart] = useState<"gas" | "energy">("gas");
  const [range, setRange] = useState<"Weekly" | "Monthly" | "Yearly">("Monthly");

  const handleFilterChange = (filters: string[]) => {
    const selected = filters.find(f => ranges.includes(f as any));
    if (selected) setRange(selected as "Weekly" | "Monthly" | "Yearly");
  };

  const currentData = analyticsByRange[range];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true },
      x: { grid: { display: false } },
    },
  };

  const gasChart = useMemo(() => ({
    labels: currentData.labels,
    datasets: [{ data: currentData.gas, backgroundColor: "#2E523A", borderRadius: 8 }],
  }), [currentData]);

  const energyChart = useMemo(() => ({
    labels: currentData.labels,
    datasets: [{ data: currentData.energy, backgroundColor: "#D4A20B", borderRadius: 8 }],
  }), [currentData]);

  return (
    <div className="space-y-6 p-4">
      {/* KPI CARDS */}
      <div className="flex justify-center">
        <div className="grid grid-cols-3 gap-14">
          <KpiCard title="Total Waste Collected" value={currentData.kpis.totalWaste} unit="kg" />
          <KpiCard title="Gas Produced" value={currentData.kpis.gasProduced} unit="m³" />
          <KpiCard title="Energy Generated" value={currentData.kpis.energyGenerated} unit="kWh" />
        </div>
      </div>

      {/* CHART + CONTRIBUTORS */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex gap-2">
              <TabButton active={activeChart === "gas"} onClick={() => setActiveChart("gas")} label="Gas Yield" />
              <TabButton active={activeChart === "energy"} onClick={() => setActiveChart("energy")} label="Energy Yield" />
            </div>
            <FilterPanel types={["timeRange"]} onFilterChange={handleFilterChange} />
          </div>

          <div className="relative h-[320px] overflow-hidden">
            {activeChart === "gas" && <Bar data={gasChart} options={chartOptions} />}
            {activeChart === "energy" && <Bar data={energyChart} options={chartOptions} />}
          </div>
        </div>

        <HouseholdPanel contributors={currentData.contributors} />
      </div>
    </div>
  );
};

// KPI CARD
const KpiCard = ({ title, value, unit }: KpiCardProps) => {
  let bgColor = "#2E523A";
  let Icon = Trash;

  if (title.includes("Waste")) {
    bgColor = "#8B5E3C";
    Icon = Trash;
  } else if (title.includes("Gas")) {
    bgColor = "#2E523A";
    Icon = Flame;
  } else if (title.includes("Energy")) {
    bgColor = "#D4A20B";
    Icon = Zap;
  }

  return (
    <div className="relative flex justify-center">
      {/* Floating Icon */}
      <div
        className="absolute -top-6 z-20 flex items-center justify-center"
        style={{
          backgroundColor: bgColor,
          width: "60px",
          height: "60px",
          borderRadius: "15px",
        }}
      >
        <Icon size={30} color="#fff" />
      </div>

      {/* KPI Card (WHITE) */}
      <div
        className="z-10 flex flex-col justify-center items-center bg-white
                   rounded-[15px] shadow-md"
        style={{
          width: "150px",
          height: "150px",
          paddingTop: "35px",
           boxShadow: `0 4px 15px ${bgColor}80`,

        }}
      >
        {/* LABEL */}
        <p
          className="text-[14px] font-medium text-center leading-tight"
          style={{ color: bgColor }}
        >
          {title}
        </p>

        {/* VALUE */}
        <p
          className="mt-2 text-sm font-semibold text-center"
          style={{ color: bgColor }}
        >
          <CountUp
            end={value}
            duration={1.2}
            decimals={unit === "kg" || unit === "m³" ? 1 : 0}
          />{" "}
          {unit}
        </p>
      </div>
    </div>
  );
};



const TabButton = ({ active, onClick, label }: TabButtonProps) => (
  <button
    onClick={onClick}
    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
      active ? "bg-[#2E523A] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
    }`}
  >
    {label}
  </button>
);

const HouseholdPanel = ({ contributors }: HouseholdPanelProps) => (
  <div className="rounded-xl border bg-white p-4 shadow-sm">
    <h3 className="mb-4 text-sm font-semibold text-[#2E523A]">Household Waste Contribution</h3>
    <div className="max-h-[320px] space-y-3 overflow-y-auto">
      {contributors.map((item, index) => (
        <div key={index} className="flex justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
          <span className="font-medium text-gray-700">{item.name}</span>
          <span className="font-semibold text-[#2E523A]">{item.waste}</span>
        </div>
      ))}
    </div>
  </div>
);

export default Analytics;

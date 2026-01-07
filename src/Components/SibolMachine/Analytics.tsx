import React, { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
import { ArrowLeft, Trash2, PawPrint, ArrowRight } from "lucide-react";
import FilterPanel from "../common/filterPanel";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

/* ---------------- MOCK DATA ---------------- */

const analyticsByRange = {
  Yearly: {
    labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov"],
    actualGas: [20,35,30,55,45,70,60,85,65,78,55],
    forecastGas: [18,30,28,50,42,65,55,80,60,75,52],
    actualEnergy: [1.2,1.5,1.4,1.8,1.6,2.1,1.9,2.4,2.2,2.3,2.0],
    forecastEnergy: [1.1,1.4,1.3,1.6,1.5,2.0,1.8,2.3,2.1,2.2,1.9],
    gasYield: { percent: 14, volume: 135 },
    waste: { food: 124, manure: 124 },
    additives: { water: 40, manure: 20, others: 40, total: 100 },
    contributors: [
      { name: "EJ Benig", waste: "3 kg" },
      { name: "Karl Miranda", waste: "3 kg" },
      { name: "Laurenz Listangco", waste: "3 kg" },
    ],
  },
};

/* ---------------- MAIN ---------------- */

function Analytics() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<"gas" | "energy">("gas");
  const data = analyticsByRange.Yearly;

  const chartData = {
    labels: data.labels,
    datasets:
      activeTab === "gas"
        ? [
            {
              label: "Actual",
              data: data.actualGas,
              borderColor: "#7CB342",
              backgroundColor: "rgba(124,179,66,0.18)",
              fill: true,
              tension: 0.45,
              pointRadius: 0,
            },
            {
              label: "Forecast",
              data: data.forecastGas,
              borderColor: "#F59E0B",
              borderDash: [6, 6],
              tension: 0.45,
              pointRadius: 0,
            },
          ]
        : [
            {
              label: "Actual",
              data: data.actualEnergy,
              borderColor: "#7CB342",
              backgroundColor: "rgba(124,179,66,0.18)",
              fill: true,
              tension: 0.45,
              pointRadius: 0,
            },
            {
              label: "Forecast",
              data: data.forecastEnergy,
              borderColor: "#F59E0B",
              borderDash: [6, 6],
              tension: 0.45,
              pointRadius: 0,
            },
          ],
  };

  return (
    <div className="p-2 md:p-4 lg:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {!collapsed && (
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4 lg:w-[260px]">
            <GasYieldCard data={data.gasYield} />
            <EnergyYieldCard
              value={data.actualEnergy.at(-1) ?? 0}
              trend={data.actualEnergy}
            />
            <ProcessedWasteCard waste={data.waste} />
          </div>
        )}

        {/* Collapse Button */}
        <div className="hidden lg:flex items-center justify-center">
          <button
            type="button"
            onClick={() => setCollapsed(v => !v)}
            className="
              h-10 w-10
              flex items-center justify-center
              rounded-full
              bg-white
              text-gray-700
              shadow-md
              transition-all duration-200
              hover:scale-105 hover:shadow-lg
              hover:text-green-700
              focus:outline-none focus:ring-2 focus:ring-green-500
            "
          >
            {collapsed ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
          </button>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl border bg-white p-4 md:p-6 shadow-sm flex flex-col">
            <div className="mb-4 flex justify-between items-center flex-wrap gap-2">
              <div className="flex gap-2">
                <Tab
                  label="Gas Yield"
                  active={activeTab === "gas"}
                  onClick={() => setActiveTab("gas")}
                />
                <Tab
                  label="Energy Yield"
                  active={activeTab === "energy"}
                  onClick={() => setActiveTab("energy")}
                />
              </div>
              <FilterPanel types={["timeRange"]} />
            </div>
            <div className="flex-1 min-h-[260px] md:min-h-[340px]">
              <Line data={chartData} />
            </div>
          </div>

          <div className="space-y-6">
            <AdditivesPanel additives={data.additives} />
            <HouseholdPanel contributors={data.contributors} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

const GasYieldCard = ({
  data,
}: {
  data: { percent: number; volume: number };
}) => {
  const gaugeData = {
    datasets: [
      {
        data: [data.percent, 100 - data.percent],
        backgroundColor: ["#2E7D32", "#E6F4EA"],
        borderWidth: 0,
        cutout: "72%",
        rotation: -90,
        circumference: 180,
      },
    ],
  };

  return (
    <div className="rounded-2xl bg-green-200 p-4">
      <p className="text-sm font-semibold">Gas Yield</p>

      <div className="mt-3 flex items-center justify-between">
        {/* Left text */}
        <div className="flex flex-col justify-center">
          <p className="text-3xl font-bold leading-none">{data.percent}%</p>
          <p className="mt-1 text-xs text-gray-700">vs last period</p>
        </div>

        {/* Gauge */}
        <div className="relative h-24 w-24 flex items-center justify-center">
          <Doughnut
            data={gaugeData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false }, tooltip: { enabled: false } },
            }}
          />
          <div className="absolute bottom-3 text-xs font-semibold">{data.volume} m³</div>
        </div>
      </div>
    </div>
  );
};

const EnergyYieldCard = ({ value, trend }: { value: number; trend: number[] }) => {
  const sparkData = {
    labels: trend.map((_, i) => i),
    datasets: [
      {
        data: trend,
        borderColor: "#F59E0B",
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  return (
    <div className="rounded-2xl bg-yellow-200 p-4">
      <p className="text-sm font-semibold">Energy Yield</p>
      <p className="text-2xl font-bold">{value} kWh</p>
      <div className="h-8 mt-2">
        <Line
          data={sparkData}
          options={{
            plugins: { legend: { display: false } },
            scales: { x: { display: false }, y: { display: false } },
            maintainAspectRatio: false,
          }}
        />
      </div>
    </div>
  );
};

const ProcessedWasteCard = ({ waste }: { waste: { food: number; manure: number } }) => (
  <div className="rounded-2xl bg-orange-300 p-4">
    <p className="text-sm font-semibold">Processed Waste</p>
    <div className="mt-4 flex justify-around gap-6">
      {/* Food Waste */}
      <div className="flex flex-col items-center">
        <Trash2 size={36} className="mb-2" />
        <p className="font-bold text-lg">{waste.food} kg</p>
        <p className="text-xs text-gray-700">Food Waste</p>
      </div>

      {/* Manure */}
      <div className="flex flex-col items-center">
        <PawPrint size={36} className="mb-2" />
        <p className="font-bold text-lg">{waste.manure} L</p>
        <p className="text-xs text-gray-700">Manure</p>
      </div>
    </div>
  </div>
);

const AdditivesPanel = ({
  additives,
}: {
  additives: { water: number; manure: number; others: number; total: number };
}) => {
  const items = [
    { label: "Others", value: additives.others, color: "#2E7D32" },
    { label: "Water", value: additives.water, color: "#9CCC65" },
    { label: "Manure", value: additives.manure, color: "#C5E1A5" },
  ];

  const chartData = {
    labels: items.map(i => i.label),
    datasets: [
      {
        data: items.map(i => i.value),
        backgroundColor: items.map(i => i.color),
        borderWidth: 0,
        cutout: "70%",
      },
    ],
  };

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold mb-4">Additives Input Ratio</p>

      {/* Donut */}
      <div className="relative h-44 flex items-center justify-center">
        <Doughnut
          data={chartData}
          options={{
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (ctx) => {
                    const value = ctx.raw as number;
                    const pct = Math.round((value / additives.total) * 100);
                    return `${ctx.label}: ${value} L (${pct}%)`;
                  },
                },
              },
            },
          }}
        />

        {/* Centered text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-2xl font-bold leading-none">{additives.total}</p>
          <p className="text-xs text-gray-500">Liters</p>
        </div>
      </div>

      {/* Labels */}
      <div className="mt-4 space-y-2">
        {items.map(item => {
          const pct = Math.round((item.value / additives.total) * 100);
          return (
            <div key={item.label} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span>{item.label}</span>
              </div>
              <span className="font-medium">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const HouseholdPanel = ({ contributors }: any) => (
  <div className="rounded-xl border bg-white p-4 shadow-sm">
    <p className="text-sm font-semibold mb-3">Household Waste Contribution</p>
    <div className="space-y-2">
      {contributors.map((c: any, i: number) => (
        <div key={i} className="flex justify-between bg-gray-50 px-3 py-2 rounded-lg text-sm">
          <span>{c.name}</span>
          <span className="font-semibold">{c.waste}</span>
        </div>
      ))}
    </div>
  </div>
);

const Tab = ({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-md text-sm font-medium ${
      active ? "bg-green-800 text-white" : "bg-gray-100 text-gray-600"
    }`}
  >
    {label}
  </button>
);

export default Analytics;

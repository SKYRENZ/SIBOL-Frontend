import React, { useEffect, useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import "../graphs/chartSetup";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdditives } from "../../store/slices/additivesSlice";

type AdditiveRow = {
  id: number;
  machine_id: number;
  additive_input: string;
  value: number;
  units: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM:SS
  machine_name?: string | null;
  additive_name?: string | null;
  operator_first_name?: string | null;
  operator_last_name?: string | null;
  operator_username?: string | null;
};

const AdditivesPanel: React.FC = () => {
  const dispatch = useDispatch();
  const items: AdditiveRow[] = useSelector((s: any) => s.additives?.items ?? []);
  const loading: boolean = useSelector((s: any) => s.additives?.loading ?? false);

  useEffect(() => {
    dispatch(fetchAdditives() as any);
  }, [dispatch]);

  const computed = useMemo(() => {
    const counts = { water: 0, manure: 0, others: 0 };
    let total = 0;

    const otherNameSums: Record<string, number> = {};

    for (const row of items) {
      const nameRaw = (row.additive_name || row.additive_input || "").toString();
      const name = nameRaw.toLowerCase();
      const val = Number(row.value) || 0;
      total += val;

      if (name.includes("water")) {
        counts.water += val;
      } else if (name.includes("manure")) {
        counts.manure += val;
      } else {
        counts.others += val;
        const key = nameRaw || "Unknown";
        otherNameSums[key] = (otherNameSums[key] || 0) + val;
      }
    }

    // pick the most common (by volume) other additive to label the third segment
    let topOtherLabel: string | null = null;
    let topOtherSum = 0;
    for (const [label, sum] of Object.entries(otherNameSums)) {
      if (sum > topOtherSum) {
        topOtherSum = sum;
        topOtherLabel = label;
      }
    }
    if (!topOtherLabel && counts.others > 0) topOtherLabel = "Other";

    const listTop3 = [...items]
      .sort((a, b) => {
        const ta = new Date(`${a.date}T${a.time}`).getTime();
        const tb = new Date(`${b.date}T${b.time}`).getTime();
        return tb - ta;
      })
      .slice(0, 3);

    return { counts, total, listTop3, topOtherLabel };
  }, [items]);

  const labelForOthers = computed.topOtherLabel || "Other";
  const itemsForChart = [
    { label: labelForOthers, value: computed.counts.others, color: "#2E7D32" },
    { label: "Water", value: computed.counts.water, color: "#9CCC65" },
    { label: "Manure", value: computed.counts.manure, color: "#C5E1A5" },
  ];

  const chartData = {
    labels: itemsForChart.map(i => i.label),
    datasets: [
      {
        data: itemsForChart.map(i => i.value),
        backgroundColor: itemsForChart.map(i => i.color),
        borderWidth: 0,
        cutout: "70%" as any,
      },
    ],
  };

  return (
    <div className="rounded-xl border bg-white p-2 shadow-sm h-full flex flex-col">
      <p className="text-sm font-semibold mb-2 text-center text-gray-800">Additives Ratio</p>

      <div className="relative h-40 flex items-center justify-center">
        <Doughnut
          data={chartData}
          options={{
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (ctx: any) => {
                    const value = Number(ctx.raw || 0);
                    const pct = computed.total > 0 ? Math.round((value / computed.total) * 100) : 0;
                    return `${ctx.label}: ${value} L (${pct}%)`;
                  },
                },
              },
            },
          }}
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-lg font-bold leading-none text-gray-800">{computed.total}</p>
          <p className="text-xs text-gray-500">Liters</p>
        </div>
      </div>

      <div className="mt-2 space-y-1 text-sm">
        {itemsForChart.map(item => {
          const pct = computed.total > 0 ? Math.round((item.value / computed.total) * 100) : 0;
          return (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-700">{item.label}</span>
              </div>
              <span className="font-medium text-gray-800">{pct}%</span>
            </div>
          );
        })}
      </div>

      <div className="mt-3 border-t pt-3">
        <p className="text-sm font-semibold text-gray-700 mb-2">Recent Additive Inputs</p>

        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : computed.listTop3.length === 0 ? (
          <p className="text-sm text-gray-500">No additive entries yet.</p>
        ) : (
          <div className="space-y-2 text-sm">
            {computed.listTop3.map((row) => {
              const type = row.additive_name || row.additive_input || "Unknown";
              const machine = row.machine_name || `#${row.machine_id}`;
              const operator =
                (row.operator_first_name || row.operator_last_name)
                  ? `${row.operator_first_name ?? ""} ${row.operator_last_name ?? ""}`.trim()
                  : row.operator_username ?? "Unknown";
              const dt = new Date(`${row.date}T${row.time}`);
              const when = isNaN(dt.getTime()) ? `${row.date} ${row.time}` : dt.toLocaleString();

              return (
                <div key={row.id} className="flex items-start justify-between">
                  <div className="text-sm">
                    <div className="font-medium text-gray-800">{type}</div>
                    <div className="text-xs text-gray-500">{machine} • {operator}</div>
                  </div>
                  <div className="text-xs text-gray-500">{when}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdditivesPanel;
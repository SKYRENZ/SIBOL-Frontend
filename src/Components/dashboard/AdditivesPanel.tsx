import React, { useEffect, useMemo, useRef } from "react";
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
  date?: string;
  time?: string;
  created_at?: string;
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

      if (name.includes("water")) counts.water += val;
      else if (name.includes("manure")) counts.manure += val;
      else {
        counts.others += val;
        otherNameSums[nameRaw || "Unknown"] = (otherNameSums[nameRaw || "Unknown"] || 0) + val;
      }
    }

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
        const ta = (() => {
          if (a.date && a.date.includes("T")) return new Date(a.date).getTime();
          if (a.date && a.time) return new Date(`${a.date}T${a.time}`).getTime();
          if (a.created_at) return new Date(a.created_at).getTime();
          const d = new Date(a.date ?? a.time ?? a.created_at ?? "");
          return isNaN(d.getTime()) ? 0 : d.getTime();
        })();
        const tb = (() => {
          if (b.date && b.date.includes("T")) return new Date(b.date).getTime();
          if (b.date && b.time) return new Date(`${b.date}T${b.time}`).getTime();
          if (b.created_at) return new Date(b.created_at).getTime();
          const d = new Date(b.date ?? b.time ?? b.created_at ?? "");
          return isNaN(d.getTime()) ? 0 : d.getTime();
        })();
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

  const chartRef = useRef<any>(null);

  const formatDateOnly = (row: AdditiveRow) => {
    const tryParse = (s?: string) => {
      if (!s) return null;
      const d = new Date(s);
      return isNaN(d.getTime()) ? null : d;
    };
    let dt = tryParse(row.date && row.date.includes("T") ? row.date : undefined);
    if (!dt && row.date && row.time) dt = tryParse(`${row.date}T${row.time}`);
    if (!dt) dt = tryParse(row.created_at ?? row.date ?? row.time);
    if (!dt) {
      const isoMatch = (row.date ?? "").match(/\d{4}-\d{2}-\d{2}T[^\s]*/);
      if (isoMatch) dt = tryParse(isoMatch[0]);
    }
    if (!dt) return row.date ?? "";
    return dt.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
  };

  return (
    <div className="rounded-xl border bg-white p-3 shadow-sm h-full flex flex-col">
      <p className="text-sm font-semibold mb-2 text-center text-gray-800">Additives Ratio</p>

      <div className="flex gap-4 items-start">
        <div className="relative flex-1" style={{ minWidth: 160 }}>
          <div style={{ position: "relative", width: "100%", height: 200 }}>
            <Doughnut
              ref={chartRef}
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
                maintainAspectRatio: false,
              }}
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="text-xl font-bold text-gray-800">{computed.total}</div>
              <div className="text-xs text-gray-500">Liters</div>
            </div>
          </div>
        </div>

        <div className="w-40 flex-shrink-0">
          {itemsForChart.map((item, i) => {
            const pct = computed.total > 0 ? Math.round((item.value / computed.total) * 100) : 0;
            return (
              <div
                key={item.label}
                className="flex items-center justify-between mb-3"
                style={{ gap: 8 }}
              >
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <div className="text-sm text-gray-700">{item.label}</div>
                </div>
                <div className="text-sm font-medium text-gray-800">{pct}%</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 border-t pt-3 flex-1 overflow-auto">
        <p className="text-sm font-semibold text-gray-700 mb-2">Recent Additive Inputs</p>

        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : computed.listTop3.length === 0 ? (
          <p className="text-sm text-gray-500">No additive entries yet.</p>
        ) : (
          <div className="space-y-3 text-sm">
            {computed.listTop3.map((row) => {
              const type = row.additive_name || row.additive_input || "Unknown";
              const machineRaw = row.machine_name || `#${row.machine_id}`;
              const machine = machineRaw.toString().toUpperCase();
              const operator =
                (row.operator_first_name || row.operator_last_name)
                  ? `${row.operator_first_name ?? ""} ${row.operator_last_name ?? ""}`.trim()
                  : row.operator_username ?? "Unknown";

              const dateOnly = formatDateOnly(row);

              return (
                <div key={row.id} className="flex items-start justify-between">
                  <div className="text-sm">
                    <div className="font-medium text-gray-800">{type}</div>
                    <div className="text-xs text-gray-500">{machine} • {operator}</div>
                  </div>
                  <div className="text-xs text-gray-500 whitespace-nowrap">{dateOnly}</div>
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
import { Award } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { fetchConversion, updateConversion, fetchConversionAudit } from "../../services/conversionService";
import Table from "../common/Table";
import FormModal from "../common/FormModal";
import FormField from "../common/FormField";

type AuditEntry = {
  id: number;
  oldPoints: number | null;
  newPoints: number;
  remark: string;
  changedBy: number | null;
  changedByUsername: string;
  createdAt: string;
};

const Sparkline: React.FC<{ values: number[]; width?: number; height?: number; stroke?: string }> = ({
  values,
  width = 200,
  height = 48,
  stroke = "#355842",
}) => {
  if (!values || values.length === 0) {
    return (
      <div className="flex items-center justify-center text-xs text-gray-400" style={{ width, height }}>
        no data
      </div>
    );
  }
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const step = width / Math.max(1, values.length - 1);
  const points = values
    .map((v, i) => {
      const x = Math.round(i * step);
      const y = Math.round(((max - v) / range) * (height - 4) + 2);
      return `${x},${y}`;
    })
    .join(" ");
  const last = values[values.length - 1];
  return (
    <svg width={width} height={height} className="block">
      <polyline points={points} fill="none" stroke={stroke} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={Math.round((values.length - 1) * step)} cy={Math.round(((max - last) / range) * (height - 4) + 2)} r={3} fill={stroke} />
    </svg>
  );
};

const PointSystem = () => {
  const [isEditable, setIsEditable] = useState(false);
  const [pointsPerKg, setPointsPerKg] = useState<number>(5);
  const [loading, setLoading] = useState(false);

  // modal state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [remark, setRemark] = useState<string>("");
  const [saveInProgress, setSaveInProgress] = useState(false);

  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  // sorting state
  const [sortBy, setSortBy] = useState<string | null>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    let mounted = true;
    fetchConversion()
      .then((data) => {
        if (mounted && data?.pointsPerKg) setPointsPerKg(Number(data.pointsPerKg));
      })
      .catch((e) => console.error("fetchConversion", e));
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    setAuditLoading(true);
    fetchConversionAudit(50)
      .then((rows) => {
        if (mounted) setAuditEntries(rows);
      })
      .catch((e) => console.error("fetchConversionAudit", e))
      .finally(() => {
        if (mounted) setAuditLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleEdit = () => {
    setIsEditable(true);
    setRemark("");
  };

  const handleSave = () => {
    if (!Number.isFinite(pointsPerKg) || pointsPerKg <= 0) {
      alert("Points must be a positive number");
      return;
    }
    setIsConfirmOpen(true);
  };

  const confirmSave = async () => {
    if (remark.trim().length < 3) {
      alert("Please provide a brief remark (at least 3 characters).");
      return;
    }
    try {
      setSaveInProgress(true);
      const res = await updateConversion(pointsPerKg, remark.trim());
      setPointsPerKg(Number(res.pointsPerKg));
      setIsEditable(false);
      setIsConfirmOpen(false);
      setRemark("");
      const rows = await fetchConversionAudit(50);
      setAuditEntries(rows);
    } catch (err) {
      console.error("updateConversion", err);
      alert("Failed to save conversion");
    } finally {
      setSaveInProgress(false);
    }
  };

  const refreshAudit = async () => {
    setAuditLoading(true);
    try {
      const rows = await fetchConversionAudit(100);
      setAuditEntries(rows);
    } catch (e) {
      console.error("refreshAudit", e);
    } finally {
      setAuditLoading(false);
    }
  };

  // sortedEntries computes a sorted version of auditEntries based on sortBy and sortDir
  const sortedEntries = useMemo(() => {
    const copy = [...auditEntries];
    if (!sortBy) return copy;
    copy.sort((a, b) => {
      const av = a[sortBy as keyof AuditEntry];
      const bv = b[sortBy as keyof AuditEntry];
      // handle date strings for "createdAt"
      if (sortBy === "createdAt") {
        const ad = new Date(String(av)).getTime();
        const bd = new Date(String(bv)).getTime();
        return sortDir === "asc" ? ad - bd : bd - ad;
      }
      // numeric fallback
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      return sortDir === "asc"
        ? String(av ?? "").localeCompare(String(bv ?? ""))
        : String(bv ?? "").localeCompare(String(av ?? ""));
    });
    return copy;
  }, [auditEntries, sortBy, sortDir]);

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDir("desc");
    }
  };

  const auditValues = useMemo(() => auditEntries.map((a) => a.newPoints).reverse(), [auditEntries]);
  const latest = auditEntries[0] ?? null;
  const prev = auditEntries[1] ?? null;
  const delta = latest && latest.oldPoints != null ? latest.newPoints - (latest.oldPoints ?? 0) : null;
  const avg = auditEntries.length ? Math.round((auditEntries.reduce((s, r) => s + r.newPoints, 0) / auditEntries.length) * 100) / 100 : null;
  const trend = prev ? (latest!.newPoints > prev.newPoints ? "up" : latest!.newPoints < prev.newPoints ? "down" : "flat") : "flat";

  // table columns: make "When" sortable
  const columns = [
    {
      key: "createdAt",
      label: "When",
      sortable: true,
      render: (_: any, row: AuditEntry) => new Date(row.createdAt).toLocaleString(),
    },
    {
      key: "changedByUsername",
      label: "Changed by",
      render: (_: any, row: AuditEntry) => row.changedByUsername ?? "—",
    },
    {
      key: "oldPoints",
      label: "Old",
      render: (_: any, row: AuditEntry) => (row.oldPoints == null ? "—" : row.oldPoints),
    },
    {
      key: "newPoints",
      label: "New",
      render: (_: any, row: AuditEntry) => <span className="font-semibold">{row.newPoints}</span>,
    },
    {
      key: "remark",
      label: "Remark",
      render: (_: any, row: AuditEntry) => <div className="max-w-xl break-words text-gray-700">{row.remark}</div>,
    },
  ];

  // container size: header + max 5 rows => compute height
  const rowHeight = 52; // px (approx)
  const headerHeight = 52; // px (approx)
  const maxRowsVisible = 5;
  const containerMaxHeight = headerHeight + rowHeight * maxRowsVisible;

  return (
    <>
      {/* compact header + input area (reduced padding and height) */}
      <div className="w-full px-4 py-4">
        <div className="flex items-start gap-3 mb-4">
          <Award className="w-7 h-7 text-[#355842]" />
          <div>
            <h2 className="text-[#355842] font-semibold text-base">Current Point System</h2>
            <p className="text-gray-600 text-xs">Change how many SIBOL points are awarded per 1 kg of waste.</p>
          </div>
        </div>

        <div className="bg-white border border-[#D8E3D8] rounded-xl shadow-sm w-full max-w-lg mx-auto p-4 flex flex-col items-center gap-3">
          <div className="flex items-center justify-center gap-4 w-full">
            <div className="flex flex-col items-center text-center">
              <label className="text-xs font-medium text-[#355842] mb-1">Points per 1 kg</label>
              <input
                type="number"
                value={pointsPerKg}
                step="0.25"
                onChange={(e) => setPointsPerKg(Number(e.target.value))}
                disabled={!isEditable}
                className={`border rounded-md px-2 py-1 text-sm text-center w-28 transition text-black ${
                  isEditable ? "border-[#7B9B7B] focus:outline-none focus:ring-2 focus:ring-[#7B9B7B] bg-white" : "border-gray-300 bg-gray-50 cursor-not-allowed"
                }`}
              />
              <p className="text-xs text-gray-500 mt-1">Example: weight 2 kg =&gt; {Math.floor(2 * pointsPerKg)} points</p>
            </div>
          </div>

          <div className="flex gap-3 mt-1">
            <button
              onClick={handleEdit}
              className={`text-sm font-medium px-4 py-1 rounded-md transition ${isEditable ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-[#355842] text-white hover:bg-[#2e4a36]"}`}
              disabled={isEditable}
            >
              Edit
            </button>

            <button
              onClick={handleSave}
              className={`text-sm font-medium px-4 py-1 rounded-md transition ${isEditable ? "bg-[#355842] text-white hover:bg-[#2e4a36]" : "bg-gray-300 text-gray-600 cursor-not-allowed"}`}
              disabled={!isEditable || loading}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>

      {/* History + compact visual aside */}
      <div className="w-full px-4 pb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[#355842]">Change History</h3>
          <div className="flex items-center gap-2">
            <button onClick={refreshAudit} className="px-2 py-1 rounded-md bg-[#355842] text-white text-xs hover:bg-[#2e4a36]">Refresh</button>
            <span className="text-xs text-gray-500">{auditLoading ? "Loading…" : `${auditEntries.length} records`}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1 md:col-span-2">
            {/* Table with pagination - no scroll needed */}
            <div style={{ borderRadius: 8, border: "1px solid #e6efe6" }}>
              <Table
                columns={columns}
                data={sortedEntries}
                emptyMessage="No history yet"
                sortBy={sortBy}
                sortDir={sortDir}
                onSort={handleSort}
                enablePagination={true}
                initialPageSize={5}
                fixedPagination={false}
              />
            </div>
          </div>

          <aside className="col-span-1">
            <div className="bg-white border border-[#D8E3D8] rounded-xl shadow-sm p-3 flex flex-col gap-3 text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500">Latest</div>
                  <div className="text-xl font-semibold text-[#355842]">{latest ? latest.newPoints : "—"}</div>
                  <div className="text-xs text-gray-500">{latest ? new Date(latest.createdAt).toLocaleString() : ""}</div>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${trend === "up" ? "bg-green-50 text-green-700" : trend === "down" ? "bg-red-50 text-red-700" : "bg-gray-50 text-gray-700"}`}>
                    {trend === "up" ? "▲" : trend === "down" ? "▼" : "—"} {prev ? Math.abs(latest!.newPoints - prev.newPoints) : 0}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">change vs prev</div>
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500">Delta on last change</div>
                <div className="text-base font-medium">{delta == null ? "—" : delta > 0 ? `+${delta}` : `${delta}`}</div>
              </div>

              <div>
                <div className="text-xs text-gray-500 flex justify-between">
                  <span>Average</span>
                  <span className="font-medium">{avg == null ? "—" : avg}</span>
                </div>
                <div className="mt-2">
                  <Sparkline values={auditValues} width={200} height={44} stroke="#7B9B7B" />
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500">Recent editors</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {auditEntries.slice(0, 6).map((e) => (
                    <div key={e.id} className="px-2 py-1 bg-gray-50 rounded-md text-xs text-gray-700">
                      {e.changedByUsername ?? "—"} <span className="text-gray-400">·</span> {new Date(e.createdAt).toLocaleDateString()}
                    </div>
                  ))}
                  {auditEntries.length === 0 && <div className="text-xs text-gray-400">—</div>}
                </div>
              </div>

              <div className="text-xs text-gray-500">Tip: click Refresh after saving to update history.</div>
            </div>
          </aside>
        </div>
      </div>

      {/* Confirmation modal using FormModal + FormField */}
      <FormModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Confirm change"
        subtitle={`You're about to change points per kg to ${pointsPerKg}. Please enter a remark.`}
        width="520px"
      >
        <FormField
          label="Remark"
          type="textarea"
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          placeholder="Enter remark (required)"
          rows={3}
          required
          variant="transparent"
        />

        <div className="flex justify-end gap-2 mt-2">
          <button onClick={() => setIsConfirmOpen(false)} className="px-3 py-1 rounded-md bg-gray-200 text-sm" disabled={saveInProgress}>
            Cancel
          </button>
          <button onClick={confirmSave} className="px-3 py-1 rounded-md bg-[#355842] text-white text-sm" disabled={saveInProgress}>
            {saveInProgress ? "Saving…" : "Confirm and Save"}
          </button>
        </div>
      </FormModal>
    </>
  );
};

export default PointSystem;

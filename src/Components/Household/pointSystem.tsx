import { Award, TrendingUp, TrendingDown, Minus, RefreshCw, Edit3, Save, Users, Activity, History, X } from "lucide-react";
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
      <polyline points={points} fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={Math.round((values.length - 1) * step)} cy={Math.round(((max - last) / range) * (height - 4) + 2)} r={3} fill={stroke} />
    </svg>
  );
};

const StatCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'flat';
  trendValue?: number;
  gradient?: string;
}> = ({ title, value, subtitle, icon, trend, trendValue, gradient = "from-[#355842] to-[#4a7c59]" }) => (
  <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-5 text-white shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl`}>
    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
            trend === 'up' ? 'bg-green-400 bg-opacity-30' : trend === 'down' ? 'bg-red-400 bg-opacity-30' : 'bg-gray-400 bg-opacity-30'
          }`}>
            {trend === 'up' ? <TrendingUp size={12} /> : trend === 'down' ? <TrendingDown size={12} /> : <Minus size={12} />}
            {trendValue && `${Math.abs(trendValue)}`}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-xs opacity-90">{title}</div>
      {subtitle && <div className="text-xs opacity-75 mt-1">{subtitle}</div>}
    </div>
  </div>
);

const PointSystem = () => {
  const [isEditable, setIsEditable] = useState(false);
  const [pointsPerKg, setPointsPerKg] = useState<number>(5);

  // modal state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [remark, setRemark] = useState<string>("");
  const [saveInProgress, setSaveInProgress] = useState(false);

  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  // New state for history panel
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);

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
      render: (_: any, row: AuditEntry) => <span className="font-semibold text-[#355842]">{row.newPoints}</span>,
    },
    {
      key: "remark",
      label: "Remark",
      render: (_: any, row: AuditEntry) => <div className="max-w-md break-words text-gray-700">{row.remark}</div>,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-[#355842] to-[#4a7c59] rounded-xl shadow-lg">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Point System Management</h1>
              <p className="text-sm text-gray-600">Manage and track SIBOL point conversion rates</p>
            </div>
          </div>
          
          {/* History Button at title level */}
          <button
            onClick={() => setIsHistoryPanelOpen(true)}
            className="bg-gradient-to-r from-[#355842] to-[#4a7c59] text-white px-5 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
          >
            <History size={18} />
            <span className="font-medium">History</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard
            title="Current Rate"
            value={pointsPerKg}
            subtitle="points per kg"
            icon={<Award className="w-5 h-5" />}
            gradient="from-[#355842] to-[#4a7c59]"
          />
          <StatCard
            title="Total Changes"
            value={auditEntries.length}
            subtitle="historical updates"
            icon={<Activity className="w-5 h-5" />}
            gradient="from-blue-500 to-purple-600"
          />
          <StatCard
            title="Average Rate"
            value={avg || "—"}
            subtitle="all time average"
            icon={<TrendingUp className="w-5 h-5" />}
            gradient="from-orange-500 to-red-500"
          />
        </div>

        {/* Main Control Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 h-full flex flex-col shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Conversion Rate Control</h2>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isEditable ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {isEditable ? 'Editing' : 'Read-only'}
                  </span>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center space-y-4">
                <div className="text-center">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Points per Kilogram</label>
                  <div className="relative inline-block">
                    <input
                      type="number"
                      value={pointsPerKg}
                      step="0.25"
                      onChange={(e) => setPointsPerKg(Number(e.target.value))}
                      disabled={!isEditable}
                      className={`w-32 px-4 py-3 text-3xl font-bold text-center rounded-xl border-2 transition-all ${
                        isEditable 
                          ? "border-[#355842] bg-white text-[#355842] focus:outline-none focus:ring-4 focus:ring-[#355842] focus:ring-opacity-20" 
                          : "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                      }`}
                    />
                    <div className="absolute -right-10 top-1/2 transform -translate-y-1/2 text-2xl text-gray-400">
                      ⚖️
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-gray-600">
                    Example: 2 kg waste = <span className="font-bold text-[#355842]">{Math.floor(2 * pointsPerKg)} points</span>
                  </p>
                </div>

                <div className="flex justify-center gap-4">
                  <button
                    onClick={handleEdit}
                    disabled={isEditable}
                    className={`flex items-center gap-2 px-5 py-3 rounded-lg font-medium transition-all ${
                      isEditable 
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                        : "bg-gradient-to-r from-[#355842] to-[#4a7c59] text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                    }`}
                  >
                    <Edit3 size={16} />
                    Edit Rate
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!isEditable || saveInProgress}
                    className={`flex items-center gap-2 px-5 py-3 rounded-lg font-medium transition-all ${
                      isEditable 
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105" 
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <Save size={16} />
                    {saveInProgress ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 h-full flex flex-col">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Analytics</h3>
              
              <div className="flex-1 flex flex-col justify-center space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      trend === 'up' ? 'bg-green-100' : trend === 'down' ? 'bg-red-100' : 'bg-gray-100'
                    }`}>
                      {trend === 'up' ? <TrendingUp className="w-4 h-4 text-green-600" /> : 
                       trend === 'down' ? <TrendingDown className="w-4 h-4 text-red-600" /> : 
                       <Minus className="w-4 h-4 text-gray-600" />}
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Trend</div>
                      <div className="text-base font-semibold">{trend === 'up' ? 'Increasing' : trend === 'down' ? 'Decreasing' : 'Stable'}</div>
                    </div>
                  </div>
                  {prev && (
                    <div className="text-right">
                      <div className="text-lg font-bold text-[#355842]">{Math.abs(latest!.newPoints - prev.newPoints)}</div>
                      <div className="text-sm text-gray-500">vs previous</div>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-2">Historical Trend</div>
                  <div className="flex justify-center">
                    <Sparkline values={auditValues} width={180} height={48} stroke="#355842" />
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-2">Recent Activity</div>
                  <div className="space-y-2">
                    {auditEntries.slice(0, 5).map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Users className="w-3 h-3 text-gray-400" />
                          <span className="font-medium">{entry.changedByUsername || 'Unknown'}</span>
                        </div>
                        <span className="text-gray-500">{new Date(entry.createdAt).toLocaleDateString()}</span>
                      </div>
                    ))}
                    {auditEntries.length === 0 && (
                      <div className="text-sm text-gray-400 text-center">No recent activity</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* History Panel - Sliding from right - Much wider for full table visibility */}
      <div className={`fixed top-0 right-0 h-full bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
        isHistoryPanelOpen ? 'translate-x-0' : 'translate-x-full'
      } ${
        // Much wider responsive width for full table visibility
        'w-full sm:w-full md:w-11/12 lg:w-5/6 xl:w-4/5 2xl:w-3/4'
      }`}>
        <div className="h-full flex flex-col">
          {/* Panel Header - Aligned with outer header */}
          <div className="bg-gradient-to-r from-[#355842] to-[#4a7c59] text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                  <History className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-bold">Change History</h2>
              </div>
              <button
                onClick={() => setIsHistoryPanelOpen(false)}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-hidden p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <button 
                  onClick={refreshAudit} 
                  className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#355842] to-[#4a7c59] text-white rounded-lg shadow-lg hover:shadow-xl transition-all text-sm"
                >
                  <RefreshCw size={16} className={auditLoading ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>
                <span className="text-sm text-gray-500">
                  {auditLoading ? "Loading..." : `${auditEntries.length} records`}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 overflow-hidden shadow-lg flex-1 flex flex-col">
              <div className="flex-1 overflow-auto">
                <Table
                  columns={columns}
                  data={sortedEntries}
                  emptyMessage="No history yet"
                  sortBy={sortBy}
                  sortDir={sortDir}
                  onSort={handleSort}
                  enablePagination={true}
                  initialPageSize={9}
                  fixedPagination={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay when panel is open */}
      {isHistoryPanelOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsHistoryPanelOpen(false)}
        />
      )}

      {/* Confirmation Modal */}
      <FormModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Confirm Point Rate Change"
        width="520px"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            You're about to change the conversion rate to <span className="font-bold text-[#355842]">{pointsPerKg}</span> points per kg. Please provide a reason for this change.
          </p>
          
          <FormField
            label="Reason for Change"
            name="remark"
            type="textarea"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="Please explain why this change is necessary..."
            required
          />

          <div className="flex justify-end gap-3 mt-6">
            <button 
              onClick={() => setIsConfirmOpen(false)} 
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors" 
              disabled={saveInProgress}
            >
              Cancel
            </button>
            <button 
              onClick={confirmSave} 
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#355842] to-[#4a7c59] text-white shadow-lg hover:shadow-xl transition-all" 
              disabled={saveInProgress}
            >
              {saveInProgress ? (
                <span className="flex items-center gap-2">
                  <RefreshCw size={16} className="animate-spin" />
                  Saving...
                </span>
              ) : (
                "Confirm Change"
              )}
            </button>
          </div>
        </div>
      </FormModal>
    </div>
  );
};

export default PointSystem;
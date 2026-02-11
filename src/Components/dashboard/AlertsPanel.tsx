import React from "react";
import { AlertTriangle } from "lucide-react";

const AlertsPanel = ({ alerts }: { alerts: any[] }) => {
  const formatDate = (ts?: string | null) => {
    if (!ts) return "";
    try {
      const d = new Date(String(ts));
      if (isNaN(d.getTime())) return String(ts);
      return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
    } catch {
      return String(ts);
    }
  };

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm h-full flex flex-col">
    <p className="text-base font-semibold mb-2 text-center text-gray-800">Alerts</p>
    <div className="space-y-2 flex-1 overflow-y-auto">
      {alerts.slice(0, 3).map((alert) => (
        <div key={alert.id} className="flex items-start gap-3 bg-white border-l-4 border-red-200 px-3 py-2 rounded-lg text-sm shadow-sm">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex-shrink-0 flex items-center justify-center">
            <AlertTriangle size={18} className="text-red-400" />
          </div>
          <div className="flex-1 min-w-0 relative">
              <p className="text-xs text-gray-400 absolute right-4 top-2">{formatDate(alert.timestamp ?? alert.date)}</p>
              <div className="flex items-start">
              <p className="font-semibold text-gray-800 text-sm">{alert.title ?? alert.type ?? 'Alert'}</p>
            </div>
            {alert.message ? (
              <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
            ) : (
              <>
                <p className="text-sm text-gray-600">{alert.machine}</p>
                <p className="text-sm text-gray-500 mt-1">Problem: {alert.problem}</p>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
  );
};

export default AlertsPanel;
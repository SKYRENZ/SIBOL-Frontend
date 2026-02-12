import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import StagePopupTemplate from "./Popups/StagePopupTemplate";
import { stage3Data } from "./Popups/Stage3Popup";
import { stage4Data } from "./Popups/Stage4Popup";
import { stage5Data } from "./Popups/Stage5Popup";
import { cn } from "../../lib/utils";
import { useMachines } from "../../hooks/sibolMachine/useMachines";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchAdditives, type AdditiveRow } from "../../store/slices/additivesSlice";
import FormModal from "../common/FormModal";
import type { Machine } from "../../services/machineService";
import { getWasteInputsByMachineId, type WasteInputRow } from "../../services/wasteInputService";
import { getLatestS3Readings, type S3SensorReading } from "../../services/s3SensorService";

const formatDate = (date?: string) => {
  if (!date) return "N/A";
  const parsed = new Date(date); // handles ISO like 2026-02-04T16:00:00.000Z
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const formatDateTime = (date?: string | null) => {
  if (!date) return "N/A";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return String(date);
  return parsed.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatValue = (value?: number) => {
  if (value === undefined || value === null || Number.isNaN(Number(value))) return "";
  return Number(value).toFixed(2);
};

const getStageNumber = (stage?: string) => {
  const match = String(stage ?? "").match(/\d+/);
  return match ? Number(match[0]) : null;
};

const parseInputDate = (row: WasteInputRow) => {
  const raw = row.Input_datetime ?? row.input_datetime ?? row.Created_at ?? row.created_at;
  if (!raw) return null;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const parseAdditiveDate = (row: AdditiveRow) => {
  if (!row.date && !row.time) return null;
  const parsed = new Date(`${row.date ?? ""}T${row.time ?? "00:00:00"}`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const buildWasteInputCard = (row: WasteInputRow | null, selectedMachineLabel: string) => {
  if (!row) {
    return {
      title: "Waste Input",
      item: undefined,
    };
  }

  const d = parseInputDate(row);
  const dateLabel = d ? formatDate(d.toISOString()) : "Unknown date";
  const weight = Number(row.Weight ?? row.weight ?? 0);
  const operator = row.Username ?? row.username ?? (row.Account_id ?? row.account_id ? `Operator ${row.Account_id ?? row.account_id}` : undefined);

  return {
    title: "Waste Input",
    item: {
      date: dateLabel,
      weight: `${formatValue(weight)} kg`,
      operator,
    },
  };
};

const isMachineActive = (statusName?: string | null) => {
  const normalized = (statusName ?? "").toLowerCase().trim();
  return normalized === "active" || normalized === "available";
};

const getMachineActivity = (machine?: Machine | null) => {
  if (!machine) return null;
  const by =
    machine.Updated_by_name ??
    machine.updated_by_name ??
    machine.Updated_by_username ??
    machine.updated_by_username ??
    machine.Updated_by ??
    machine.updated_by ??
    null;
  const date =
    machine.Updated_at ??
    machine.updated_at ??
    machine.Last_modified_at ??
    machine.last_modified_at ??
    machine.Modified_at ??
    machine.modified_at ??
    null;
  const action =
    machine.Last_action ??
    machine.last_action ??
    machine.Action ??
    machine.action ??
    null;

  return {
    by: by ? String(by) : null,
    date: date ? String(date) : null,
    action: action ? String(action) : null,
  };
};

const ProcessPanelTab: React.FC = () => {
  const dispatch = useAppDispatch();
  const { machines, selectedMachine, selectMachine, loading: machinesLoading } = useMachines();
  const { items: additives, loading: additivesLoading, error: additivesError } = useAppSelector((s) => s.additives);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isMachinePickerOpen, setIsMachinePickerOpen] = useState(false);
  const [isAdditivesHistoryOpen, setIsAdditivesHistoryOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"date" | "additive" | "value">("date");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [sensorSortBy, setSensorSortBy] = useState<"timestamp" | "ph" | "temp" | "pressure" | "methane">("timestamp");
  const [sensorSortOrder, setSensorSortOrder] = useState<"desc" | "asc">("desc");
  const [historyPage, setHistoryPage] = useState(1);
  const historyPageSize = 5;
  const [wasteInputs, setWasteInputs] = useState<WasteInputRow[]>([]);
  const [wasteLoading, setWasteLoading] = useState(false);
  const [isWasteHistoryOpen, setIsWasteHistoryOpen] = useState(false);
  const [wastePage, setWastePage] = useState(1);
  const wastePageSize = 6;

  const [s3Readings, setS3Readings] = useState<S3SensorReading | null>(null);
  const [isSensorsHistoryOpen, setIsSensorsHistoryOpen] = useState(false);
  const [sensorHistory, setSensorHistory] = useState<S3SensorReading[]>([]);
  const [sensorHistoryLoading, setSensorHistoryLoading] = useState(false);

  useEffect(() => {
    if (!selectedMachine && machines.length) {
      const defaultMachine = machines.find((m) => isMachineActive(m.status_name)) ?? machines[0];
      selectMachine(defaultMachine);
    }
  }, [machines, selectedMachine, selectMachine]);

  useEffect(() => {
    if (!selectedMachine?.machine_id) return;
    const id = setInterval(() => {
      dispatch(fetchAdditives(selectedMachine.machine_id));
    }, 5000);
    return () => clearInterval(id);
  }, [dispatch, selectedMachine?.machine_id]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!selectedMachine?.machine_id) {
        setWasteInputs([]);
        return;
      }
      setWasteLoading(true);
      try {
        const rows = await getWasteInputsByMachineId(selectedMachine.machine_id);
        if (!mounted) return;
        setWasteInputs(rows || []);
        setWastePage(1);
      } catch {
        if (!mounted) return;
        setWasteInputs([]);
      } finally {
        if (!mounted) return;
        setWasteLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [selectedMachine?.machine_id]);

  // Helper: fetch latest (single) reading and update state
  const refreshSensors = async () => {
    if (!selectedMachine?.machine_id) return;
    try {
      const data = await getLatestS3Readings(selectedMachine.machine_id, 1);
      if (data && data.length > 0) {
        setS3Readings(data[0]);
        console.log('refreshSensors: got', data.length, 'rows', data[0]);
      } else {
        setS3Readings((prev) => (prev && prev.Machine_id === selectedMachine.machine_id ? prev : null));
        console.log('refreshSensors: no rows returned for machine', selectedMachine.machine_id);
      }
    } catch (err) {
      console.error('Failed to refresh S3 sensor readings', err);
    }
  };

  useEffect(() => {
    if (!selectedMachine?.machine_id) {
      setS3Readings(null);
      return;
    }

    let mounted = true;
    // initial + polling
    if (mounted) refreshSensors();
    const id = setInterval(() => {
      refreshSensors();
    }, 5000);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [selectedMachine?.machine_id]);

  // Open sensors history modal and load multiple readings
  const openSensorsHistory = async () => {
    if (!selectedMachine?.machine_id) return;
    setSensorHistoryLoading(true);
    try {
      const rows = await getLatestS3Readings(selectedMachine.machine_id, 200);
      setSensorHistory(rows || []);
      setIsSensorsHistoryOpen(true);
    } catch (err) {
      console.error('Failed to load sensor history', err);
      setSensorHistory([]);
      setIsSensorsHistoryOpen(true);
    } finally {
      setSensorHistoryLoading(false);
    }
  };

  // Refresh the whole Stage 3 data (sensors, additives, waste inputs)
  const refreshStage = async () => {
    if (!selectedMachine?.machine_id) return;
    try {
      // sensors
      await refreshSensors();
      // additives (dispatch will update store and UI)
      dispatch(fetchAdditives(selectedMachine.machine_id));
      // waste inputs
      try {
        const rows = await getWasteInputsByMachineId(selectedMachine.machine_id);
        setWasteInputs(rows || []);
        setWastePage(1);
      } catch (err) {
        console.error('Failed to refresh waste inputs', err);
      }
      console.log('refreshStage: refreshed stage data for machine', selectedMachine.machine_id);
    } catch (err) {
      console.error('Failed to refresh stage data', err);
    }
  };

  const stage3Additives = useMemo(
    () =>
      additives.filter((row) => {
        const stageNum = getStageNumber(row.stage);
        return stageNum === 3 || !stageNum; // includes "N/A"
      }),
    [additives]
  );

  const getDateValue = (row: (typeof stage3Additives)[number]) => {
    const date = row.date ?? "";
    const time = row.time ?? "00:00:00";
    const parsed = new Date(`${date}T${time}`);
    return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
  };

  const latestStage3Additives = useMemo(() => {
    return [...stage3Additives].sort((a, b) => getDateValue(b) - getDateValue(a));
  }, [stage3Additives]);

  const latestAdditive = useMemo(() => {
    if (!additives.length) return null;
    const sorted = [...additives].sort((a, b) => {
      const ad = parseAdditiveDate(a);
      const bd = parseAdditiveDate(b);
      return (bd?.getTime() ?? 0) - (ad?.getTime() ?? 0);
    });
    return sorted[0] ?? null;
  }, [additives]);

  const stage3SupportCard = useMemo(() => {
    const items = latestStage3Additives.slice(0, 3).map((row) => ({
      name: row.additive_input,
      detail: formatDate(row.date),
      trailing:
        row.value !== undefined
          ? `${formatValue(row.value)} ${row.units ?? ""}`.trim()
          : undefined,
    }));

    return {
      type: "additives" as const,
      title: "Chemical Additives",
      items:
        items.length > 0
          ? items
          : [
            {
              name: "No additives logged",
              detail: selectedMachine ? "Awaiting inputs" : "Select a machine",
              trailing: "—",
            },
          ],
    };
  }, [latestStage3Additives, selectedMachine]);

  const recentWasteInput = useMemo(() => {
    if (!wasteInputs.length) return null;
    const sorted = [...wasteInputs].sort((a, b) => {
      const ad = parseInputDate(a);
      const bd = parseInputDate(b);
      return (bd?.getTime() ?? 0) - (ad?.getTime() ?? 0);
    });
    return sorted[0];
  }, [wasteInputs]);

  const latestActivity = useMemo(() => {
    const additiveDate = latestAdditive ? parseAdditiveDate(latestAdditive) : null;
    const wasteDate = recentWasteInput ? parseInputDate(recentWasteInput) : null;

    if (additiveDate && (!wasteDate || additiveDate >= wasteDate)) {
      return {
        by: latestAdditive?.person_in_charge ?? "",
        date: additiveDate,
        action: "Updated additives",
      };
    }

    if (wasteDate) {
      return {
        by:
          recentWasteInput?.Username ??
          recentWasteInput?.username ??
          (recentWasteInput?.Account_id ?? recentWasteInput?.account_id
            ? `Operator ${recentWasteInput?.Account_id ?? recentWasteInput?.account_id}`
            : ""),
        date: wasteDate,
        action: "Logged waste input",
      };
    }

    return null;
  }, [latestAdditive, recentWasteInput]);

  const sortedStage3Additives = useMemo(() => {
    const rows = [...stage3Additives];

    rows.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "date") {
        cmp = getDateValue(a) - getDateValue(b);
      } else if (sortBy === "additive") {
        cmp = String(a.additive_input ?? "").localeCompare(String(b.additive_input ?? ""), undefined, {
          sensitivity: "base",
        });
      } else if (sortBy === "value") {
        cmp = Number(a.value ?? 0) - Number(b.value ?? 0);
      }
      return sortOrder === "asc" ? cmp : -cmp;
    });

    return rows;
  }, [stage3Additives, sortBy, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedStage3Additives.length / historyPageSize));
  const pagedStage3Additives = useMemo(() => {
    const start = (historyPage - 1) * historyPageSize;
    return sortedStage3Additives.slice(start, start + historyPageSize);
  }, [sortedStage3Additives, historyPage]);

  const totalWastePages = Math.max(1, Math.ceil(wasteInputs.length / wastePageSize));
  const pagedWasteInputs = useMemo(() => {
    const start = (wastePage - 1) * wastePageSize;
    return wasteInputs.slice(start, start + wastePageSize);
  }, [wasteInputs, wastePage]);

  const selectedMachineLabel = selectedMachine?.Name ?? "Select machine";
  const activity = getMachineActivity(selectedMachine);
  const activityBy = latestActivity?.by || activity?.by || stage3Data.operatorName;
  const activityDate = latestActivity?.date
    ? formatDateTime(latestActivity.date.toISOString())
    : activity?.date
      ? formatDateTime(activity.date)
      : stage3Data.date;
  const activityAction = latestActivity?.action || activity?.action || "Updated machine";
  const machineActive = selectedMachine ? isMachineActive(selectedMachine.status_name) : undefined;
  const machineStatusLabel = machineActive === undefined ? undefined : machineActive ? "Active" : "Inactive";

  // Build sensors from latest DB reading. Do NOT fall back to mock data.
  const stage3Sensors = useMemo(() => {
    if (!s3Readings) return [];

    return [
      {
        id: "ph-1",
        label: "pH Level",
        value: s3Readings.Ph_Sensor != null ? s3Readings.Ph_Sensor.toFixed(2) : "N/A",
        // Show same status as other sensors (keep display consistent)
        status: "Normal",
        percent: s3Readings.Ph_Sensor != null ? (s3Readings.Ph_Sensor / 14) * 100 : 0,
      },
      {
        id: "temp-1",
        label: "Temperature",
        value: s3Readings.Temp_Sensor != null ? `${s3Readings.Temp_Sensor.toFixed(1)}°C` : "N/A",
        status: "Normal",
        percent: s3Readings.Temp_Sensor != null ? (s3Readings.Temp_Sensor / 100) * 100 : 0,
      },
      {
        id: "pressure-1",
        label: "Pressure",
        value: s3Readings.Pressure_Sensor != null ? `${s3Readings.Pressure_Sensor.toFixed(1)}` : "N/A",
        status: "Normal",
        percent:
          s3Readings.Pressure_Sensor != null ? Math.min((s3Readings.Pressure_Sensor / 100) * 100, 100) : 0,
      },
      {
        id: "methane-1",
        label: "Methane",
        value: s3Readings.Methane_Sensor != null ? `${s3Readings.Methane_Sensor.toFixed(1)}` : "N/A",
        status: "Normal",
        percent:
          s3Readings.Methane_Sensor != null ? Math.min((s3Readings.Methane_Sensor / 100) * 100, 100) : 0,
      },
    ];
  }, [s3Readings]);

  const stages = useMemo(
    () => [
      {
        ...stage3Data,
        sensors: stage3Sensors,
        supportCard: stage3SupportCard,
        selectedMachine: selectedMachineLabel,
        activity: {
          by: activityBy,
          date: activityDate,
          action: activityAction,
        },
        isActive: machineActive,
        statusLabel: machineStatusLabel,
        wasteInputCard: buildWasteInputCard(recentWasteInput, selectedMachineLabel),
      },
      {
        ...stage4Data,
        selectedMachine: selectedMachineLabel,
        activity: {
          by: activityBy,
          date: activityDate,
          action: activityAction,
        },
        isActive: machineActive,
        statusLabel: machineStatusLabel,
      },
      {
        ...stage5Data,
        selectedMachine: selectedMachineLabel,
        activity: {
          by: activityBy,
          date: activityDate,
          action: activityAction,
        },
        isActive: machineActive,
        statusLabel: machineStatusLabel,
      },
    ],
    [
      stage3SupportCard,
      selectedMachineLabel,
      recentWasteInput,
      activityBy,
      activityDate,
      activityAction,
      machineActive,
      machineStatusLabel,
    ]
  );



  const goPrev = () => {
    setActiveIndex((prev) => (prev === 0 ? stages.length - 1 : prev - 1));
  };

  const goNext = () => {
    setActiveIndex((prev) => (prev === stages.length - 1 ? 0 : prev + 1));
  };

  const handleSelectMachine = (machine: Machine) => {
    selectMachine(machine);
    setIsMachinePickerOpen(false);
  };

  return (
    <div className="relative min-h-[calc(100vh-220px)] w-full overflow-hidden rounded-[36px] border border-[#D4E2D9] bg-[#FAFBFA] px-6 py-10 shadow-[0_40px_90px_-50px_rgba(46,82,58,0.35)] md:px-10">
      <header className="flex flex-col gap-6 pb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2 text-center md:text-left">
            <h1 className="text-2xl font-semibold text-[#1F3527] md:text-[28px]">Process Panels</h1>
            <p className="text-sm text-[#476152]">
              Review each stage of the SIBOL machine flow and track operator notes, additive inputs, and live sensor health.
            </p>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={goPrev}
              className="group relative inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/70 bg-white/80 shadow-[0_18px_34px_-18px_rgba(46,82,58,0.45)] transition hover:-translate-y-0.5 hover:border-[#6EA37F]"
              aria-label="Previous stage"
            >
              <ArrowLeft className="h-5 w-5 text-[#3F5D49] transition group-hover:text-[#2E523A]" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="group relative inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/70 bg-white/80 shadow-[0_18px_34px_-18px_rgba(46,82,58,0.45)] transition hover:-translate-y-0.5 hover:border-[#6EA37F]"
              aria-label="Next stage"
            >
              <ArrowRight className="h-5 w-5 text-[#3F5D49] transition group-hover:text-[#2E523A]" />
            </button>
          </div>
        </div>

      </header>

      <main className="relative z-10 mt-6 flex justify-center overflow-visible">
        <div className="relative w-full max-w-[1200px] overflow-visible">
          <div
            className="pointer-events-none absolute inset-y-6 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-b from-[#e8f5e963] via-transparent to-[#e8f5e963] blur-3xl"
            aria-hidden
          />
          {stages.map((stage, index) => {
            const position = (index - activeIndex + stages.length) % stages.length;
            const isActive = position === 0;
            const isRight = position === 1;
            const isLeft = position === stages.length - 1;

            const translateX = isActive ? "0px" : isRight ? "min(28vw, 300px)" : isLeft ? "max(-28vw, -300px)" : "0px";
            const translateY = isActive ? "0px" : "28px";
            const scale = isActive ? 1.0 : 0.85;
            const opacity = isActive ? 1 : isRight || isLeft ? 0.6 : 0;
            const filter = isActive ? "none" : isRight || isLeft ? "blur(8px) saturate(85%)" : "blur(12px)";
            const zIndex = isActive ? 30 : isRight || isLeft ? 20 : 10;

            return (
              <div
                key={stage.id}
                className="absolute top-0 flex w-full justify-center transition-all duration-[620ms] ease-[cubic-bezier(.18,.89,.32,1.28)]"
                style={{
                  left: "50%",
                  transform: `translateX(-50%) translateX(${translateX}) translateY(${translateY}) scale(${scale})`,
                  opacity,
                  filter,
                  pointerEvents: isActive ? "auto" : "none",
                  zIndex,
                }}
              >
                <div className="relative">
                  <StagePopupTemplate
                    {...stage}
                    onMachinePickerOpen={() => setIsMachinePickerOpen(true)}
                    onAdditivesHistoryOpen={
                      stage.id === "stage-3" ? () => setIsAdditivesHistoryOpen(true) : undefined
                    }
                    onWasteInputHistoryOpen={
                      stage.id === "stage-3" ? () => setIsWasteHistoryOpen(true) : undefined
                    }
                    // expose refresh/history for sensors to ALL stages so buttons are always present
                    onRefreshSensors={refreshSensors}
                    onRefreshStage={stage.id === "stage-3" ? refreshStage : undefined}
                    onSensorsHistoryOpen={openSensorsHistory}
                    className={cn(
                      "w-[1100px] max-w-[1100px] min-h-[650px] shadow-[0_36px_80px_-48px_rgba(34,62,48,0.48)] overflow-visible",
                      !isActive && "w-[1000px] max-w-[1000px] min-h-[600px] border-white/60 bg-white/85 backdrop-blur-md"
                    )}
                  />
                  {isActive && (
                    <>
                      <span className="pointer-events-none absolute left-8 top-6 hidden rounded-full bg-white/75 shadow-[0_18px_34px_-18px_rgba(46,82,58,0.45)] backdrop-blur-md md:flex">
                        <span className="m-2 h-3 w-3 rounded-full bg-[#2E523A]" />
                      </span>
                      <span className="pointer-events-none absolute right-8 bottom-6 hidden rounded-full bg-white/75 shadow-[0_18px_34px_-18px_rgba(46,82,58,0.45)] backdrop-blur-md md:flex">
                        <span className="m-2 h-3 w-3 rounded-full bg-[#2E523A]" />
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
          <div className="relative h-[750px]" aria-hidden />
        </div>
      </main>

      <div className="mt-10 flex justify-center gap-2">
        {stages.map((stage, index) => (
          <button
            key={stage.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={cn(
              "h-2 w-8 rounded-full transition-all",
              index === activeIndex
                ? "bg-[#2D5F2E] shadow-[0_8px_14px_-8px_rgba(46,82,58,0.6)]"
                : "bg-[#b9cfc0] hover:bg-[#8db59e]"
            )}
            aria-label={`Go to ${stage.stageName}`}
          />
        ))}
      </div>

      <FormModal
        isOpen={isMachinePickerOpen}
        onClose={() => setIsMachinePickerOpen(false)}
        title="Select SIBOL Machine"
        width="900px"
      >
        <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-[#4B6757]">
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
            Available
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            Not Active
          </span>
        </div>

        {machinesLoading ? (
          <div className="py-10 text-center text-sm text-[#6B8976]">Loading machines...</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {machines.map((machine) => {
              const active = isMachineActive(machine.status_name);
              const selected = selectedMachine?.machine_id === machine.machine_id;

              return (
                <button
                  key={machine.machine_id}
                  type="button"
                  onClick={() => handleSelectMachine(machine)}
                  className={cn(
                    "group rounded-2xl border p-4 text-left transition hover:-translate-y-0.5",
                    active ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50",
                    selected && "ring-2 ring-[#2E523A]"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#1F3527]">
                      {machine.Name ?? `SIBOL Machine ${machine.machine_id}`}
                    </p>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-semibold",
                        active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      )}
                    >
                      {active ? "Available" : "Not Active"}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-[#4B6757]">ID: {machine.machine_id}</p>
                  <p className="mt-1 text-xs text-[#4B6757]">
                    Area: {machine.Area_Name ?? `Area ${machine.Area_id}`}
                  </p>
                  {machine.status_name && (
                    <p className="mt-1 text-xs text-[#6B8976]">Status: {machine.status_name}</p>
                  )}
                </button>
              );
            })}
            {!machines.length && (
              <div className="col-span-full py-10 text-center text-sm text-[#6B8976]">
                No machines found.
              </div>
            )}
          </div>
        )}
      </FormModal>

      <FormModal
        isOpen={isAdditivesHistoryOpen}
        onClose={() => setIsAdditivesHistoryOpen(false)}
        title={`Additives History${selectedMachine ? ` • ${selectedMachine.Name}` : ""}`}
        width="920px"
      >
        {additivesLoading && (
          <div className="py-4 text-center text-xs text-[#6B8976]">Loading additives...</div>
        )}
        {additivesError && (
          <div className="py-2 text-center text-xs text-red-600">
            Failed to load additives: {additivesError}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 text-xs text-[#4B6757]">
          <span className="font-semibold">Sort by:</span>
          <button
            type="button"
            onClick={() => setSortBy("date")}
            className={cn(
              "rounded-full border px-3 py-1",
              sortBy === "date" ? "border-[#2E523A] text-[#2E523A]" : "border-[#D6E4D9]"
            )}
          >
            Date
          </button>
          <button
            type="button"
            onClick={() => setSortBy("additive")}
            className={cn(
              "rounded-full border px-3 py-1",
              sortBy === "additive" ? "border-[#2E523A] text-[#2E523A]" : "border-[#D6E4D9]"
            )}
          >
            Additive
          </button>
          <button
            type="button"
            onClick={() => setSortBy("value")}
            className={cn(
              "rounded-full border px-3 py-1",
              sortBy === "value" ? "border-[#2E523A] text-[#2E523A]" : "border-[#D6E4D9]"
            )}
          >
            Value
          </button>

          <span className="ml-2 font-semibold">Order:</span>
          <button
            type="button"
            onClick={() => setSortOrder("asc")}
            className={cn(
              "rounded-full border px-3 py-1",
              sortOrder === "asc" ? "border-[#2E523A] text-[#2E523A]" : "border-[#D6E4D9]"
            )}
          >
            Asc
          </button>
          <button
            type="button"
            onClick={() => setSortOrder("desc")}
            className={cn(
              "rounded-full border px-3 py-1",
              sortOrder === "desc" ? "border-[#2E523A] text-[#2E523A]" : "border-[#D6E4D9]"
            )}
          >
            Desc
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          {pagedStage3Additives.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#6B8976]">No additives found.</div>
          ) : (
            <table className="w-full text-left text-xs text-[#3F5D49]">
              <thead className="text-[11px] uppercase tracking-wider text-[#6B8976]">
                <tr className="border-b border-[#E4EFE7]">
                  <th className="py-2">Additive</th>
                  <th className="py-2">Value</th>
                  <th className="py-2">Units</th>
                  <th className="py-2">Date</th>
                  <th className="py-2">Time</th>
                  <th className="py-2">Operator</th>
                </tr>
              </thead>
              <tbody>
                {pagedStage3Additives.map((row) => (
                  <tr key={row.id} className="border-b border-[#EEF4F0]">
                    <td className="py-2 font-semibold text-[#1F3527]">{row.additive_input}</td>
                    <td className="py-2">{formatValue(row.value)}</td>
                    <td className="py-2">{row.units}</td>
                    <td className="py-2">{formatDate(row.date)}</td>
                    <td className="py-2">{row.time}</td>
                    <td className="py-2">{row.person_in_charge ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-[#4B6757]">
          <span>
            Page {historyPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
              disabled={historyPage === 1}
              className="rounded-full border px-3 py-1 disabled:opacity-50"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => setHistoryPage((p) => Math.min(totalPages, p + 1))}
              disabled={historyPage === totalPages}
              className="rounded-full border px-3 py-1 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </FormModal>

      <FormModal
        isOpen={isWasteHistoryOpen}
        onClose={() => setIsWasteHistoryOpen(false)}
        title={`Waste Input History${selectedMachine ? ` • ${selectedMachine.Name}` : ""}`}
        width="920px"
      >
        {wasteLoading && (
          <div className="py-4 text-center text-xs text-[#6B8976]">Loading waste inputs...</div>
        )}
        {!wasteLoading && pagedWasteInputs.length === 0 && (
          <div className="py-12 text-center text-sm text-[#6B8976]">No waste inputs found.</div>
        )}
        {!wasteLoading && pagedWasteInputs.length > 0 && (
          <table className="w-full text-left text-xs text-[#3F5D49]">
            <thead className="text-[11px] uppercase tracking-wider text-[#6B8976]">
              <tr className="border-b border-[#E4EFE7]">
                <th className="py-2">Date</th>
                <th className="py-2">Weight (kg)</th>
                <th className="py-2">Operator</th>
              </tr>
            </thead>
            <tbody>
              {pagedWasteInputs.map((row) => {
                const d = parseInputDate(row);
                return (
                  <tr key={row.Input_id ?? row.input_id ?? `${row.Machine_id}-${d?.toISOString()}`} className="border-b border-[#EEF4F0]">
                    <td className="py-2 font-semibold text-[#1F3527]">{d ? formatDate(d.toISOString()) : "—"}</td>
                    <td className="py-2">{formatValue(Number(row.Weight ?? row.weight ?? 0))}</td>
                    <td className="py-2">{row.Username ?? row.username ?? row.Account_id ?? row.account_id ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        <div className="mt-4 flex items-center justify-between text-xs text-[#4B6757]">
          <span>
            Page {wastePage} of {totalWastePages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setWastePage((p) => Math.max(1, p - 1))}
              disabled={wastePage === 1}
              className="rounded-full border px-3 py-1 disabled:opacity-50"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => setWastePage((p) => Math.min(totalWastePages, p + 1))}
              disabled={wastePage === totalWastePages}
              className="rounded-full border px-3 py-1 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </FormModal>

      <FormModal
        isOpen={isSensorsHistoryOpen}
        onClose={() => setIsSensorsHistoryOpen(false)}
        title={`Sensor Readings${selectedMachine ? ` • ${selectedMachine.Name}` : ""}`}
        width="920px"
      >
          {sensorHistoryLoading && (
            <div className="py-4 text-center text-xs text-[#6B8976]">Loading sensor readings...</div>
          )}

          {!sensorHistoryLoading && sensorHistory.length === 0 && (
            <div className="py-12 text-center text-sm text-[#6B8976]">No sensor readings found.</div>
          )}

          {!sensorHistoryLoading && sensorHistory.length > 0 && (
            <>
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#4B6757] mb-3">
                <span className="font-semibold">Sort by:</span>
                <button
                  type="button"
                  onClick={() => setSensorSortBy("timestamp")}
                  className={cn(
                    "rounded-full border px-3 py-1",
                    sensorSortBy === "timestamp" ? "border-[#2E523A] text-[#2E523A]" : "border-[#D6E4D9]"
                  )}
                >
                  Timestamp
                </button>
                <button
                  type="button"
                  onClick={() => setSensorSortBy("ph")}
                  className={cn(
                    "rounded-full border px-3 py-1",
                    sensorSortBy === "ph" ? "border-[#2E523A] text-[#2E523A]" : "border-[#D6E4D9]"
                  )}
                >
                  pH
                </button>
                <button
                  type="button"
                  onClick={() => setSensorSortBy("temp")}
                  className={cn(
                    "rounded-full border px-3 py-1",
                    sensorSortBy === "temp" ? "border-[#2E523A] text-[#2E523A]" : "border-[#D6E4D9]"
                  )}
                >
                  Temp
                </button>
                <button
                  type="button"
                  onClick={() => setSensorSortBy("pressure")}
                  className={cn(
                    "rounded-full border px-3 py-1",
                    sensorSortBy === "pressure" ? "border-[#2E523A] text-[#2E523A]" : "border-[#D6E4D9]"
                  )}
                >
                  Pressure
                </button>
                <button
                  type="button"
                  onClick={() => setSensorSortBy("methane")}
                  className={cn(
                    "rounded-full border px-3 py-1",
                    sensorSortBy === "methane" ? "border-[#2E523A] text-[#2E523A]" : "border-[#D6E4D9]"
                  )}
                >
                  Methane
                </button>

                <span className="ml-2 font-semibold">Order:</span>
                <button
                  type="button"
                  onClick={() => setSensorSortOrder("asc")}
                  className={cn(
                    "rounded-full border px-3 py-1",
                    sensorSortOrder === "asc" ? "border-[#2E523A] text-[#2E523A]" : "border-[#D6E4D9]"
                  )}
                >
                  Asc
                </button>
                <button
                  type="button"
                  onClick={() => setSensorSortOrder("desc")}
                  className={cn(
                    "rounded-full border px-3 py-1",
                    sensorSortOrder === "desc" ? "border-[#2E523A] text-[#2E523A]" : "border-[#D6E4D9]"
                  )}
                >
                  Desc
                </button>
              </div>

              <div className="overflow-x-auto">
                {(() => {
                  const arr = [...sensorHistory];
                  arr.sort((a, b) => {
                    const getVal = (r: typeof sensorHistory[0]) => {
                      switch (sensorSortBy) {
                        case "ph":
                          return r.Ph_Sensor ?? null;
                        case "temp":
                          return r.Temp_Sensor ?? null;
                        case "pressure":
                          return r.Pressure_Sensor ?? null;
                        case "methane":
                          return r.Methane_Sensor ?? null;
                        default:
                          return r.Timestamp ? new Date(r.Timestamp).getTime() : null;
                      }
                    };
                    const av = getVal(a);
                    const bv = getVal(b);
                    if (av == null && bv == null) return 0;
                    if (av == null) return 1;
                    if (bv == null) return -1;
                    return Number(av) - Number(bv);
                  });
                  if (sensorSortOrder === "desc") arr.reverse();

                  return (
                    <table className="w-full text-left text-xs text-[#3F5D49]">
                      <thead className="text-[11px] uppercase tracking-wider text-[#6B8976]">
                        <tr className="border-b border-[#E4EFE7]">
                          <th className="py-2">Timestamp</th>
                          <th className="py-2">pH</th>
                          <th className="py-2">Temp (°C)</th>
                          <th className="py-2">Pressure</th>
                          <th className="py-2">Methane</th>
                        </tr>
                      </thead>
                      <tbody>
                        {arr.map((r) => (
                          <tr key={r.S3sensor_id} className="border-b border-[#EEF4F0]">
                            <td className="py-2 font-semibold text-[#1F3527]">{r.Timestamp ? new Date(r.Timestamp).toLocaleString() : '—'}</td>
                            <td className="py-2">{r.Ph_Sensor != null ? r.Ph_Sensor.toFixed(2) : '—'}</td>
                            <td className="py-2">{r.Temp_Sensor != null ? r.Temp_Sensor.toFixed(1) : '—'}</td>
                            <td className="py-2">{r.Pressure_Sensor != null ? r.Pressure_Sensor.toFixed(1) : '—'}</td>
                            <td className="py-2">{r.Methane_Sensor != null ? r.Methane_Sensor.toFixed(1) : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  );
                })()}
              </div>
            </>
          )}
      </FormModal>

      <div className="pointer-events-none absolute inset-6 rounded-[30px] border border-dashed border-[#E2ECE5]" aria-hidden />
    </div>
  );
};

export default ProcessPanelTab;

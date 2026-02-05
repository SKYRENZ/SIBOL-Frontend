import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import StagePopupTemplate from "./Popups/StagePopupTemplate";
import { stage3Data } from "./Popups/Stage3Popup";
import { stage4Data } from "./Popups/Stage4Popup";
import { stage5Data } from "./Popups/Stage5Popup";
import { cn } from "../../lib/utils";
import { useMachines } from "../../hooks/sibolMachine/useMachines";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchAdditives } from "../../store/slices/additivesSlice";
import FormModal from "../common/FormModal";
import type { Machine } from "../../services/machineService";

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

const formatValue = (value?: number) => {
  if (value === undefined || value === null || Number.isNaN(Number(value))) return "";
  return Number(value).toFixed(2);
};

const getStageNumber = (stage?: string) => {
  const match = String(stage ?? "").match(/\d+/);
  return match ? Number(match[0]) : null;
};

const isMachineActive = (statusName?: string | null) => {
  const normalized = (statusName ?? "").toLowerCase().trim();
  return normalized === "active" || normalized === "available";
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
  const [historyPage, setHistoryPage] = useState(1);
  const historyPageSize = 5;

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

  const selectedMachineLabel = selectedMachine?.Name ?? "Select machine";

  const stages = useMemo(
    () => [
      { ...stage3Data, supportCard: stage3SupportCard, selectedMachine: selectedMachineLabel },
      { ...stage4Data, selectedMachine: selectedMachineLabel },
      { ...stage5Data, selectedMachine: selectedMachineLabel },
    ],
    [stage3SupportCard, selectedMachineLabel]
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
                    className={cn(
                      "w-[1100px] max-w-[1100px] min-h-[650px] shadow-[0_36px_80px_-48px_rgba(34,62,48,0.48)] overflow-visible",
                      !isActive && "w-[1000px] max-w-[1000px] min-h-[600px] border-white/60 bg-white/85 backdrop-blur-md"
                    )}
                  />
                  {isActive && (
                    <>
                      <span className="pointer-events-none absolute left-8 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/75 shadow-[0_18px_34px_-18px_rgba(46,82,58,0.45)] backdrop-blur-md md:flex">
                        <span className="m-2 h-3 w-3 rounded-full bg-[#2E523A]" />
                      </span>
                      <span className="pointer-events-none absolute right-8 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/75 shadow-[0_18px_34px_-18px_rgba(46,82,58,0.45)] backdrop-blur-md md:flex">
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

      <div className="pointer-events-none absolute inset-6 rounded-[30px] border border-dashed border-[#E2ECE5]" aria-hidden />
    </div>
  );
};

export default ProcessPanelTab;

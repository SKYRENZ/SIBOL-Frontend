import React, { useState } from "react";
import { cn } from "../../../lib/utils";
import { Power, Check, ChevronDown, Info } from "lucide-react";
import LearnMoreModal from "./LearnMoreModal";

type SensorMetric = {
  id: string;
  label: string;
  value: string;
  status: string;
  percent: number;
};

type AdditivesCard = {
  type: "additives";
  title: string;
  items: {
    name: string;
    detail: string;
    trailing?: string;
  }[];
};

type GaugeCard = {
  type: "gauge";
  title: string;
  status: string;
  percent: number;
  valueLabel: string;
};

type CounterCard = {
  type: "counter";
  title: string;
  caption: string;
  value: string;
};

type SupportCard = AdditivesCard | GaugeCard | CounterCard;

export interface StagePopupData {
  id: string;
  stageNumber: number;
  stageName: string;
  stageSummary?: string;
  operatorName: string;
  date: string;
  supportCard?: SupportCard;
  sensors: SensorMetric[];
  narration: string;
  selectedMachine: string;
  stageImage: string;
  stageAccent: string;
  toggleDisplay?: string;
}

interface StagePopupTemplateProps extends StagePopupData {
  className?: string;
  onMachinePickerOpen?: () => void;
  onAdditivesHistoryOpen?: () => void;
}

const StagePopupTemplate: React.FC<StagePopupTemplateProps> = ({
  className,
  stageNumber,
  stageName,
  stageSummary,
  operatorName,
  date,
  supportCard,
  sensors,
  narration,
  selectedMachine,
  stageImage,
  stageAccent,
  toggleDisplay = "0",
  onMachinePickerOpen,
  onAdditivesHistoryOpen,
}) => {
  const [isLearnMoreOpen, setIsLearnMoreOpen] = useState(false);

  return (
    <div
      className={cn(
        "relative isolate w-full max-w-[840px] rounded-[26px] border border-[#E0E9E2] bg-white px-7 py-9 shadow-[0_28px_70px_-32px_rgba(40,70,52,0.35)] transition-all duration-500 ease-[cubic-bezier(.16,.84,.44,1)] md:px-10 md:py-10",
        className
      )}
    >
      <LearnMoreModal
        isOpen={isLearnMoreOpen}
        onClose={() => setIsLearnMoreOpen(false)}
        stageName={stageName}
        stageNumber={stageNumber}
      />
      <div className="pointer-events-none absolute inset-0 -z-10 rounded-[28px] bg-[radial-gradient(circle_at_top_left,rgba(212,230,216,0.45),transparent_60%)]" />

      <div className="flex items-center justify-between">
        <StageToggle accent={stageAccent} display={toggleDisplay} />
        <div className="w-[88px]" aria-hidden />
      </div>

      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#356245]">Stage {stageNumber}</p>
        <h2 className="mt-1 text-2xl font-semibold text-[#1F3527] md:text-[26px]">{stageName}</h2>
        {stageSummary && (
          <p className="mx-auto mt-2 max-w-2xl text-sm text-[#4B6757]">{stageSummary}</p>
        )}
      </div>

      <div className="mt-7 grid gap-5 md:grid-cols-[196px_minmax(0,1fr)_196px]">
        <aside className="space-y-4">
          <div className="rounded-2xl border border-[#D6E4D9] bg-[#F6FAF7] px-5 py-5 shadow-sm">
            <div className="space-y-3">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#3B624A]">On</span>
                <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-[#1E3426]">
                  <Power size={16} className="text-[#2E523A]" />
                  <span>{operatorName}</span>
                </p>
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#3B624A]">Date</span>
                <p className="mt-1 text-sm text-[#40594A]">{date}</p>
              </div>
            </div>
          </div>

          {supportCard && (
            <SupportCardContent
              card={supportCard}
              accent={stageAccent}
              onAdditivesHistoryOpen={onAdditivesHistoryOpen}
            />
          )}
        </aside>

        <div className="flex items-center justify-center">
          <StageIllustration image={stageImage} accent={stageAccent} />
        </div>

        <aside className="md:pr-1">
          <SensorsCard sensors={sensors} accent={stageAccent} />
        </aside>
      </div>

      <footer className="mt-10 flex flex-col items-center gap-4">
        <div className="flex flex-col items-center gap-4 w-full">
          <button
            type="button"
            onClick={onMachinePickerOpen}
            disabled={!onMachinePickerOpen}
            aria-haspopup="dialog"
            className={cn(
              "inline-flex items-center gap-2 rounded-full border border-[#AEC9B4] bg-white px-6 py-2 text-sm font-semibold text-[#1F3527] shadow-[0_8px_18px_-12px_rgba(46,82,58,0.35)]",
              !onMachinePickerOpen && "cursor-default opacity-80"
            )}
          >
            {selectedMachine}
            <ChevronDown className="h-4 w-4 text-[#2E523A]" />
          </button>
          
          <button
            type="button"
            onClick={() => setIsLearnMoreOpen(true)}
            className="group flex items-center gap-2 text-sm font-medium text-[#2E523A] hover:text-[#1F3527] transition-colors"
          >
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#E4F2E9] text-[#2E523A] group-hover:bg-[#D4E8DB] transition-colors">
              <Info size={12} strokeWidth={2.5} />
            </span>
            Learn More
          </button>
        </div>
        
        <p className="max-w-3xl text-center text-sm leading-relaxed text-[#405B4D]">{narration}</p>
      </footer>
    </div>
  );
};

const StageToggle: React.FC<{ accent: string; display: string }> = ({ accent, display }) => (
  <div className="inline-flex items-center">
    <span
      className="relative inline-flex h-8 min-w-[72px] items-center rounded-full border border-[#D1E3D7] bg-white/90 px-1 shadow-[0_14px_32px_-20px_rgba(33,64,46,0.6)] backdrop-blur-sm"
      style={{ boxShadow: "0 18px 38px -26px rgba(33,64,46,0.65)" }}
    >
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-semibold text-[#2E523A] shadow-[0_3px_8px_rgba(46,82,58,0.18)]">
        {display}
      </span>
      <span
        className="ml-2 flex h-6 min-w-[36px] items-center justify-end rounded-full px-2"
        style={{
          background: `linear-gradient(135deg, ${accent} 0%, ${accent}d0 100%)`,
          boxShadow: "inset 0 1px 1px rgba(255,255,255,0.5)",
        }}
      >
        <span className="h-2.5 w-2.5 rounded-full bg-white/90" />
      </span>
    </span>
  </div>
);

const SupportCardContent: React.FC<{
  card: SupportCard;
  accent: string;
  onAdditivesHistoryOpen?: () => void;
}> = ({ card, accent, onAdditivesHistoryOpen }) => {
  if (card.type === "additives") {
    return (
      <div className="rounded-2xl border border-[#D6E4D9] bg-white px-5 py-5 shadow-sm min-h-[208px]">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#2E523A]">{card.title}</h3>
          {onAdditivesHistoryOpen && (
            <button
              type="button"
              onClick={onAdditivesHistoryOpen}
              className="text-xs font-semibold text-[#2E523A] hover:text-[#1F3527]"
            >
              View history
            </button>
          )}
        </div>
        <div className="mt-4 space-y-3">
          {card.items.map((item) => (
            <div key={item.name} className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-[#1F3527]">{item.name}</p>
                <p className="text-xs text-[#5B7462]">{item.detail}</p>
              </div>
              {item.trailing ? (
                <span className="text-sm font-semibold text-[#2E523A]">{item.trailing}</span>
              ) : (
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#E4F2E9] text-[#2E523A]">
                  <Check className="h-3.5 w-3.5" strokeWidth={2.2} />
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (card.type === "gauge") {
    return (
      <div className="rounded-2xl border border-[#D6E4D9] bg-white px-5 py-5 shadow-sm min-h-[208px]">
        <h3 className="text-sm font-semibold text-[#2E523A]">{card.title}</h3>
        <div className="mt-4 flex flex-col items-center gap-3">
          <CircularGauge percent={card.percent} accent={accent} />
          <span className="text-sm font-semibold text-[#1F3527]">{card.status}</span>
          <span className="rounded-full bg-[#F1F6F2] px-4 py-1 text-xs font-semibold text-[#2E523A]">{card.valueLabel}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#D6E4D9] bg-white px-5 py-5 shadow-sm min-h-[208px]">
      <h3 className="text-sm font-semibold text-[#2E523A]">{card.title}</h3>
      <div className="mt-4 flex flex-col items-center gap-3">
        <CounterDisplay value={card.value} />
        <span className="text-xs text-[#5B7462]">{card.caption}</span>
      </div>
    </div>
  );
};

const StageIllustration: React.FC<{ image: string; accent: string }> = ({ image, accent }) => (
  <div className="relative h-[13.5rem] w-[13.5rem] max-w-full md:h-56 md:w-56">
    <div className="absolute inset-0 rounded-full border border-[#D2E2D7] bg-[#F7FBF8]" />
    <CircularArrows accent={accent} />
    <div className="absolute inset-[20px] flex items-center justify-center rounded-full bg-white shadow-[0_18px_38px_-22px_rgba(46,82,58,0.55)] md:inset-[21px]">
      <img src={image} alt="Stage illustration" className="max-h-36 w-auto md:max-h-[9.5rem]" />
    </div>
  </div>
);

const SensorsCard: React.FC<{ sensors: SensorMetric[]; accent: string }> = ({ sensors, accent }) => {
  const statusLabel = sensors[0]?.status ?? "Status";
  return (
    <div className="h-full rounded-2xl border border-[#D6E4D9] bg-white px-5 py-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#2E523A]">Sensors</h3>
        <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6B8976]">{statusLabel}</span>
      </div>
      <div className="mt-4 space-y-4">
        {sensors.map((sensor) => (
          <SensorRow key={sensor.id} sensor={sensor} accent={accent} />
        ))}
      </div>
    </div>
  );
};

const SensorRow: React.FC<{ sensor: SensorMetric; accent: string }> = ({ sensor, accent }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between text-sm text-[#1F3527]">
      <span>{sensor.label}</span>
      <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#5C7664]">{sensor.status}</span>
    </div>
    <div className="relative h-3 rounded-full bg-[#E5EEE8]">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          width: `${sensor.percent}%`,
          background: `linear-gradient(90deg, ${accent}, rgba(46,82,58,0.65))`,
        }}
      />
      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-white">
        {sensor.value}
      </span>
    </div>
  </div>
);

const CircularGauge: React.FC<{ percent: number; accent: string }> = ({ percent, accent }) => {
  const normalized = Math.min(Math.max(percent, 0), 100);
  const rotation = (normalized / 100) * 180 - 90;
  return (
    <div className="relative h-28 w-28">
      <svg viewBox="0 0 120 120" className="h-full w-full">
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={`${accent}`} stopOpacity={0.9} />
            <stop offset="100%" stopColor="#A6C7B0" />
          </linearGradient>
        </defs>
        <path
          d="M20 92a40 40 0 0 1 80 0"
          fill="none"
          stroke="#E5EEE8"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d="M20 92a40 40 0 0 1 80 0"
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${normalized * 2.513} ${251.3}`}
        />
        <circle cx="60" cy="92" r="6" fill="#2E523A" />
        <line
          x1="60"
          y1="92"
          x2={60 + 34 * Math.cos((rotation * Math.PI) / 180)}
          y2={92 + 34 * Math.sin((rotation * Math.PI) / 180)}
          stroke="#2E523A"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-x-0 bottom-0 text-center text-sm font-semibold text-[#2E523A]">{percent}%</span>
    </div>
  );
};

const CounterDisplay: React.FC<{ value: string }> = ({ value }) => (
  <div className="inline-flex gap-1 rounded-xl border border-[#D6E4D9] bg-[#F6FAF7] px-3 py-2">
    {value.split("").map((char, idx) => (
      <span
        key={`${char}-${idx}`}
        className="flex h-9 w-7 items-center justify-center rounded-md bg-white text-base font-semibold text-[#1F3527] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
        style={{ boxShadow: `inset 0 1px 0 rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.05)` }}
      >
        {char}
      </span>
    ))}
  </div>
);

const CircularArrows: React.FC<{ accent: string }> = ({ accent }) => (
  <svg
    className="absolute inset-0 h-full w-full"
    viewBox="0 0 240 240"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M120 30c-49.706 0-90 40.294-90 90"
      stroke={accent}
      strokeWidth={4}
      strokeLinecap="round"
      strokeDasharray="12 12"
      opacity={0.4}
    />
    <path
      d="M120 210c49.706 0 90-40.294 90-90"
      stroke={accent}
      strokeWidth={4}
      strokeLinecap="round"
      strokeDasharray="12 12"
      opacity={0.4}
    />
    <polygon points="120,30 128,44 112,44" fill={accent} opacity={0.5} />
    <polygon points="210,120 196,128 196,112" fill={accent} opacity={0.5} />
  </svg>
);

export default StagePopupTemplate;

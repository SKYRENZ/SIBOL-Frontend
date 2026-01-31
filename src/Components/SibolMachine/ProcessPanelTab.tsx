import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import StagePopupTemplate from "./Popups/StagePopupTemplate";
import { stage3Data } from "./Popups/Stage3Popup";
import { stage4Data } from "./Popups/Stage4Popup";
import { stage5Data } from "./Popups/Stage5Popup";
import { cn } from "../../lib/utils";

const ProcessPanelTab: React.FC = () => {
  const stages = useMemo(
    () => [stage3Data, stage4Data, stage5Data],
    []
  );
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev === stages.length - 1 ? 0 : prev + 1));
    }, 6500);

    return () => window.clearInterval(timer);
  }, [stages.length]);

  const goPrev = () => {
    setActiveIndex((prev) => (prev === 0 ? stages.length - 1 : prev - 1));
  };

  const goNext = () => {
    setActiveIndex((prev) => (prev === stages.length - 1 ? 0 : prev + 1));
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

      <main className="relative z-10 mt-6 flex justify-center">
        <div className="relative w-full max-w-[1080px]">
          <div className="pointer-events-none absolute inset-y-6 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-b from-[#e8f5e963] via-transparent to-[#e8f5e963] blur-3xl" aria-hidden />
          {stages.map((stage, index) => {
            const position = (index - activeIndex + stages.length) % stages.length;
            const isActive = position === 0;
            const isRight = position === 1;
            const isLeft = position === stages.length - 1;

            const translateX = isActive ? "0px" : isRight ? "min(24vw, 230px)" : isLeft ? "max(-24vw, -230px)" : "0px";
            const translateY = isActive ? "0px" : "28px";
            const scale = isActive ? 0.9 : 0.8;
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
                    className={cn(
                      "max-w-[760px] shadow-[0_36px_80px_-48px_rgba(34,62,48,0.48)]",
                      !isActive && "max-w-[700px] border-white/60 bg-white/85 backdrop-blur-md"
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
          <div className="relative h-[600px]" aria-hidden />
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

      <div className="pointer-events-none absolute inset-6 rounded-[30px] border border-dashed border-[#E2ECE5]" aria-hidden />
    </div>
  );
};

export default ProcessPanelTab;

import React from "react";
// SVG imports temporarily disabled for testing
// import Line from "../../assets/images/line.svg?react";
// import Arrow from "../../assets/images/arrow.svg?react";
// import Stage1 from "../../assets/images/stage1.svg?react";
// import Stage2 from "../../assets/images/stage2.svg?react";
// import Stage3 from "../../assets/images/stage3.svg?react";
// import Stage4 from "../../assets/images/stage4.svg?react";

const ProcessPanel: React.FC = () => {
  return (
    <div className="relative flex flex-col items-center justify-center w-full overflow-hidden">
      {/* Title */}
      {/* tightened spacing between title and process line */}
      <h2 className="text-xl sm:text-2xl font-semibold text-[#214E41] mb-[20px] sm:mb-[0.75rem]">
        Process Panel
      </h2>

      {/* Main Flow Container - SVGs TEMPORARILY DISABLED */}
      <div className="relative w-full max-w-[1100px] mx-auto min-h-[200px] flex items-center justify-center overflow-hidden">
        {/* Background Line - DISABLED */}
        {/* <div className="absolute inset-0 flex items-center justify-center z-0">
          <Line className="w-[95%] h-auto" />
        </div> */}

        {/* Arrows (aligned perfectly) - DISABLED */}
        {/* <Arrow className="absolute w-[26px] h-auto top-[70%] left-[10.3%] z-10" />
        <Arrow className="absolute w-[26px] h-auto top-[36%] left-[21%] rotate-[90deg] z-10" />
        <Arrow className="absolute w-[26px] h-auto top-[75%] left-[40%] -rotate-[-90deg] z-10" />
        <Arrow className="absolute w-[26px] h-auto top-[36.5%] left-[60%] rotate-[90deg] z-10" />
        <Arrow className="absolute w-[26px] h-auto top-[69.5%] left-[87%] rotate-[90deg] z-10" /> */}

        {/* Stage 1 */}
        <div className="absolute left-[17%] top-[70%] flex flex-col items-center text-center -translate-y-1/2">
          {/* <Stage1 className="w-[90px] h-auto mb-[-18px] -mt-[8px]" /> */}
          <div className="w-[90px] h-[90px] bg-gray-200 rounded-full mb-2"></div>
          <p className="text-sm text-gray-700 leading-tight">Filtering</p>
          <p className="text-sm font-semibold text-[#214E41] mt-[4px]">Stage 1</p>
        </div>

        {/* Stage 2 */}
        <div className="absolute left-[36%] top-[44%] flex flex-col items-center text-center -translate-y-1/2">
          {/* <Stage2 className="w-[90px] h-auto mb-[-18px] -mt-[8px]" /> */}
          <div className="w-[90px] h-[90px] bg-gray-200 rounded-full mb-2"></div>
          <p className="text-sm text-gray-700">Slurry Making</p>
          <p className="text-sm font-semibold text-[#214E41] mt-[3px]">Stage 2</p>
        </div>

        {/* Stage 3 */}
        <div className="absolute left-[55%] top-[70%] flex flex-col items-center text-center -translate-y-1/2">
          {/* <Stage3 className="w-[90px] h-auto mb-[-18px] -mt-[8px]" /> */}
          <div className="w-[90px] h-[90px] bg-gray-200 rounded-full mb-2"></div>
          <p className="text-sm text-gray-700">Biogas Generation</p>
          <p className="text-sm font-semibold text-[#214E41] mt-[3px]">Stage 3</p>
        </div>

        {/* Stage 4 */}
        <div className="absolute left-[73%] top-[45%] flex flex-col items-center text-center -translate-y-1/2">
          {/* <Stage4 className="w-[90px] h-[60px] mb-[-8px] -mt-[8px]" /> */}
          <div className="w-[90px] h-[90px] bg-gray-200 rounded-full mb-2"></div>
          <p className="text-sm text-gray-700">Electricity Generation</p>
          <p className="text-sm font-semibold text-[#214E41] mt-[3px]">Stage 4</p>
        </div>
      </div>
      
      <p className="text-xs text-gray-500 mt-4 italic">SVGs temporarily disabled for testing</p>
    </div>
  );
};

export default ProcessPanel;

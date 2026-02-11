import React from "react";

interface MascotPanelProps {
  firstName?: string;
  lastName?: string;
  onHelpClick?: () => void;
}

const MascotPanel: React.FC<MascotPanelProps> = ({ firstName, lastName, onHelpClick }) => {
  return (
    <aside className="relative bg-[#94b59a] h-full flex flex-col items-center justify-center px-4 sm:px-10 overflow-hidden rounded-t-[28px] lg:rounded-none lg:rounded-l-[28px]">

      {/* CLOUDS */}
      <img
        src={new URL("../../assets/images/cloud.svg", import.meta.url).href}
        className="absolute top-10 -left-16 w-16 sm:w-20 opacity-60 animate-cloudSlow hidden sm:block"
        alt=""
      />

      <img
        src={new URL("../../assets/images/cloud.svg", import.meta.url).href}
        className="absolute top-20 left-32 w-20 sm:w-28 opacity-50 animate-cloudSlower hidden md:block"
        alt=""
      />

      <img
        src={new URL("../../assets/images/cloud.svg", import.meta.url).href}
        className="absolute bottom-16 -left-24 w-20 sm:w-28 opacity-40 animate-cloudSlow hidden lg:block"
        alt=""
      />

      <img
        src={new URL("../../assets/images/cloud.svg", import.meta.url).href}
        className="absolute bottom-8 left-60 w-16 sm:w-24 opacity-50 animate-cloudSlower hidden lg:block"
        alt=""
      />

      <img
        src={new URL("../../assets/images/cloud.svg", import.meta.url).href}
        className="absolute top-36 left-64 w-16 sm:w-24 opacity-45 animate-cloudSlow hidden xl:block"
        alt=""
      />

      {/* CONTENT WRAPPER */}
      <div className="relative z-10 flex flex-col items-center text-center">

        {/* GREETING */}
        <h3 className="text-white text-lg sm:text-xl font-semibold">
           Hi, {firstName || "User"} {lastName || ""}!
        </h3>
        <p className="text-white/80 mt-1 text-sm sm:text-base mb-8 sm:mb-10">
          Lili here!
        </p>

        {/* MASCOT */}
        <div className="bg-transparent rounded-full p-4 sm:p-5 mb-6 sm:mb-10">
          <img
            src={new URL("../../assets/images/lili.svg", import.meta.url).href}
            alt="Lili mascot"
            className="w-32 h-32 sm:w-40 sm:h-40"
          />
        </div>

        {/* CTA BUTTON */}
        <button
          className="bg-[#2E523A] text-white text-sm sm:text-base px-6 sm:px-7 py-2 rounded-full shadow-md hover:shadow-lg hover:bg-[#244630] transition"
          onClick={onHelpClick}
        >
          How may I help?
        </button>

      </div>
    </aside>
  );
};

export default MascotPanel;

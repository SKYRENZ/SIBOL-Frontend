import React from "react";

interface MascotPanelProps {
  user: {
    firstName: string;
    lastName: string;
  };
  onHelpClick?: () => void;
}

const MascotPanel: React.FC<MascotPanelProps> = ({ user, onHelpClick }) => {
  return (
    <aside className="relative bg-[#94b59a] h-full flex flex-col items-center justify-center px-10 overflow-hidden rounded-t-[28px] lg:rounded-none lg:rounded-l-[28px]">

      {/* CLOUDS */}
      <img
        src={new URL("../../assets/images/cloud.svg", import.meta.url).href}
        className="absolute top-10 -left-20 w-20 opacity-60 animate-cloudSlow"
        alt=""
      />

      <img
        src={new URL("../../assets/images/cloud.svg", import.meta.url).href}
        className="absolute top-20 left-40 w-28 opacity-50 animate-cloudSlower"
        alt=""
      />

      <img
        src={new URL("../../assets/images/cloud.svg", import.meta.url).href}
        className="absolute bottom-16 -left-32 w-28 opacity-40 animate-cloudSlow"
        alt=""
      />

      <img
        src={new URL("../../assets/images/cloud.svg", import.meta.url).href}
        className="absolute bottom-8 left-72 w-24 opacity-50 animate-cloudSlower"
        alt=""
      />

      <img
        src={new URL("../../assets/images/cloud.svg", import.meta.url).href}
        className="absolute top-36 left-80 w-24 opacity-45 animate-cloudSlow"
        alt=""
      />

      {/* CONTENT WRAPPER */}
      <div className="relative z-10 flex flex-col items-center text-center">

        {/* GREETING */}
        <h3 className="text-white text-xl font-semibold">
          Hi, {user.firstName} {user.lastName}!
        </h3>
        <p className="text-white/80 mt-1 text-sm mb-10">
          Lili here!
        </p>

        {/* MASCOT */}
        <div className="bg-white rounded-full p-5 shadow-md mb-10">
          <img
            src={new URL("../../assets/images/lili.svg", import.meta.url).href}
            alt="Lili mascot"
            className="w-28 h-28 sm:w-32 sm:h-32"
          />
        </div>

        {/* CTA BUTTON */}
        <button
          className="bg-[#a8c3ad] text-white text-sm px-7 py-2 rounded-full shadow-md hover:shadow-lg hover:bg-[#98b89e] transition focus:outline-none focus:ring-0
             active:outline-none"
          onClick={onHelpClick}
        >
          How may I help?
        </button>

      </div>
    </aside>
  );
};

export default MascotPanel;

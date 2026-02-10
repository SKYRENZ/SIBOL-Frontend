import React from "react";
import DASHTRASH from "../../assets/images/DASHTRASH.png";

const GreetingCard = ({ firstName, lastName }: { firstName?: string; lastName?: string }) => (
  <div
    className="rounded-xl overflow-hidden relative h-[120px] bg-cover bg-center bg-no-repeat"
    style={{
      backgroundImage: `url(${DASHTRASH})`,
    }}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-[#E8F5E9]/90 via-[#C8E6C9]/70 to-transparent" />
    <div className="relative h-full flex items-center justify-between px-5">
      <div className="z-10">
        <h2 className="text-xl font-bold text-[#1B5E20] whitespace-nowrap">Hello, {firstName || "Ezedrex"} {lastName || "Jo"}!</h2>
      </div>
    </div>
  </div>
);

export default GreetingCard;
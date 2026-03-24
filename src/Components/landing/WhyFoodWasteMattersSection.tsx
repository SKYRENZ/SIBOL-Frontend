import React from 'react';

const WhyFoodWasteMattersSection: React.FC = () => {
  return (
    <section className="h-screen min-h-[600px] max-h-[1080px] px-4 sm:px-6 md:px-8 py-16 sm:py-20 bg-gradient-to-br from-[#2D5F2E] to-[#4A7C4E] snap-start flex items-center justify-center">
      <div className="max-w-7xl mx-auto w-full">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-5 md:mb-6">
            Why Food Waste Matters
          </h2>
          <p className="text-sm sm:text-base md:text-lg leading-relaxed mb-10 md:mb-14 px-4">
            Food waste in landfills produces methane, a greenhouse gas 25 times more potent than CO₂.
            By converting food waste to energy, we're not just reducing waste—we're actively fighting climate change.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 md:p-10 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <div className="text-5xl md:text-6xl font-bold mb-3 md:mb-4">1.3B</div>
              <div className="text-base md:text-lg font-semibold">
                Tons of food wasted globally per year
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 md:p-10 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <div className="text-5xl md:text-6xl font-bold mb-3 md:mb-4">8%</div>
              <div className="text-base md:text-lg font-semibold">
                Of global greenhouse gas emissions from food waste
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyFoodWasteMattersSection;

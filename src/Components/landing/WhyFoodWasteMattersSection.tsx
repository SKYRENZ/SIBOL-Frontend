import React from 'react';

const WhyFoodWasteMattersSection: React.FC = () => {
  return (
    <section className="py-12 sm:py-14 md:py-20 lg:py-22 px-4 sm:px-6 md:px-8 lg:px-12 bg-gradient-to-br from-[#2D5F2E] to-[#4A7C4E] snap-start scroll-mt-16">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-full sm:max-w-3xl md:max-w-4xl lg:max-w-5xl mx-auto text-center text-white">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-5 md:mb-6">
            Why Food Waste Matters
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed mb-8 sm:mb-10 md:mb-12 lg:mb-16 px-4">
            Food waste in landfills produces methane, a greenhouse gas 25 times more potent than CO₂.
            By converting food waste to energy, we're not just reducing waste—we're actively fighting climate change.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 md:gap-8 lg:gap-10 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 sm:p-7 md:p-8 lg:p-10 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-3 sm:mb-4">1.3B</div>
              <div className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold">
                Tons of food wasted globally per year
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 sm:p-7 md:p-8 lg:p-10 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-3 sm:mb-4">8%</div>
              <div className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold">
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

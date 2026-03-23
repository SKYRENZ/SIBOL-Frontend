import React from 'react';

const EnvironmentalImpactSection: React.FC = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-26   px-4 sm:px-6 md:px-8 lg:px-12 bg-white snap-start scroll-mt-16">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center text-gray-900 mb-3 sm:mb-4">
          Our Environmental Impact
        </h2>
        <p className="text-center text-gray-600 max-w-full sm:max-w-2xl md:max-w-3xl mx-auto mb-8 sm:mb-10 md:mb-12 lg:mb-16 leading-relaxed text-sm sm:text-base md:text-lg px-4">
          Together, we're making a real difference in reducing carbon emissions and promoting sustainable energy.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
          <div className="text-center p-10 sm:p-12 md:p-14 bg-[#E8F5E9] rounded-2xl">
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#2D5F2E] mb-2 sm:mb-3">50+</div>
            <div className="text-gray-700 font-semibold text-base sm:text-lg md:text-xl">Tons of Waste Processed</div>
            <p className="text-xs sm:text-sm text-gray-600 mt-1.5 sm:mt-2">Monthly average</p>
          </div>

          <div className="text-center p-10 sm:p-12 md:p-14 bg-[#E8F5E9] rounded-2xl">
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#2D5F2E] mb-2 sm:mb-3">30%</div>
            <div className="text-gray-700 font-semibold text-base sm:text-lg md:text-xl">CO₂ Reduction</div>
            <p className="text-xs sm:text-sm text-gray-600 mt-1.5 sm:mt-2">Compared to landfills</p>
          </div>

          <div className="text-center p-10 sm:p-12 md:p-14 bg-[#E8F5E9] rounded-2xl sm:col-span-2 lg:col-span-1">
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#2D5F2E] mb-2 sm:mb-3">1000+</div>
            <div className="text-gray-700 font-semibold text-base sm:text-lg md:text-xl">Active Households</div>
            <p className="text-xs sm:text-sm text-gray-600 mt-1.5 sm:mt-2">And growing</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EnvironmentalImpactSection;

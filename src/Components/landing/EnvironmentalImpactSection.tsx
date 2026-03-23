import React from 'react';

const EnvironmentalImpactSection: React.FC = () => {
  return (
    <section className="h-screen min-h-[600px] max-h-[1080px] px-4 sm:px-6 md:px-8 py-16 sm:py-20 bg-white snap-start flex items-center justify-center">
      <div className="max-w-7xl mx-auto w-full">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center text-gray-900 mb-4 sm:mb-5">
          Our Environmental Impact
        </h2>
        <p className="text-center text-gray-600 max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-14 leading-relaxed text-sm sm:text-base md:text-lg px-4">
          Together, we're making a real difference in reducing carbon emissions and promoting sustainable energy.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          <div className="text-center p-8 md:p-10 bg-[#E8F5E9] rounded-2xl">
            <div className="text-4xl md:text-5xl font-bold text-[#2D5F2E] mb-3">50+</div>
            <div className="text-gray-700 font-semibold text-lg md:text-xl">Tons of Waste Processed</div>
            <p className="text-sm text-gray-600 mt-2">Monthly average</p>
          </div>

          <div className="text-center p-8 md:p-10 bg-[#E8F5E9] rounded-2xl">
            <div className="text-4xl md:text-5xl font-bold text-[#2D5F2E] mb-3">30%</div>
            <div className="text-gray-700 font-semibold text-lg md:text-xl">CO₂ Reduction</div>
            <p className="text-sm text-gray-600 mt-2">Compared to landfills</p>
          </div>

          <div className="text-center p-8 md:p-10 bg-[#E8F5E9] rounded-2xl sm:col-span-2 lg:col-span-1">
            <div className="text-4xl md:text-5xl font-bold text-[#2D5F2E] mb-3">1000+</div>
            <div className="text-gray-700 font-semibold text-lg md:text-xl">Active Households</div>
            <p className="text-sm text-gray-600 mt-2">And growing</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EnvironmentalImpactSection;

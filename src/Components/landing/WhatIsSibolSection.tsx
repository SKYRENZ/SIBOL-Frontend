import React from 'react';
import { Recycle, Leaf, Zap } from 'lucide-react';

const WhatIsSibolSection: React.FC = () => {
  return (
    <section id="about-section" className="py-12 sm:py-14 md:py-16 lg:py-20 px-4 sm:px-6 md:px-8 lg:px-12 bg-[#88AB8E] snap-start scroll-mt-16">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center text-white mb-3 sm:mb-4">
          What is SIBOL Project?
        </h2>
        <p className="text-center text-white/90 max-w-full sm:max-w-2xl md:max-w-3xl mx-auto mb-8 sm:mb-10 md:mb-10 lg:mb-10 leading-relaxed text-sm sm:text-base md:text-lg px-4">
          SIBOL is an innovative waste management system that transforms food waste into renewable energy.
          We use reward-based incentives to encourage proper waste segregation, creating a sustainable cycle
          that benefits both the environment and our community.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 sm:p-7 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#2D5F2E] rounded-full flex items-center justify-center mb-4 sm:mb-5">
              <Recycle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
              Food Waste Segregation
            </h3>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              Our smart system helps you properly segregate food waste at the source,
              making the conversion process more efficient and environmentally friendly.
            </p>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 sm:p-7 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#2D5F2E] rounded-full flex items-center justify-center mb-4 sm:mb-5">
              <Leaf className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
              Reward-Based System
            </h3>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              Earn points and rewards for every kilogram of food waste you contribute.
              Redeem your points for discounts, vouchers, and other exciting benefits.
            </p>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 sm:p-7 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#2D5F2E] rounded-full flex items-center justify-center mb-4 sm:mb-5">
              <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
              Biogas to Electricity
            </h3>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              Your food waste is converted into biogas through anaerobic digestion,
              which is then transformed into clean, renewable electricity for the community.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatIsSibolSection;

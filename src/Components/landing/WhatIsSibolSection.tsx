import React from 'react';
import { Recycle, Leaf, Zap } from 'lucide-react';

const WhatIsSibolSection: React.FC = () => {
  return (
    <section id="about-section" className="h-screen min-h-[700px] max-h-[1080px] px-4 sm:px-6 md:px-8 py-16 sm:py-20 bg-[#88AB8E] snap-start flex items-center justify-center">
      <div className="max-w-7xl mx-auto w-full">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center text-white mb-4 sm:mb-5">
          What is SIBOL Project?
        </h2>
        <p className="text-center text-white/90 max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-14 leading-relaxed text-sm sm:text-base md:text-lg px-4">
          SIBOL is an innovative waste management system that transforms food waste into renewable energy.
          We use reward-based incentives to encourage proper waste segregation, creating a sustainable cycle
          that benefits both the environment and our community.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 lg:gap-8">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 md:p-6 lg:p-7 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-11 h-11 md:w-12 md:h-12 bg-[#2D5F2E] rounded-full flex items-center justify-center mb-3 md:mb-4">
              <Recycle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-2">
              Food Waste Segregation
            </h3>
            <p className="text-gray-600 leading-relaxed text-sm md:text-base">
              Our smart system helps you properly segregate food waste at the source,
              making the conversion process more efficient and environmentally friendly.
            </p>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 md:p-6 lg:p-7 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-11 h-11 md:w-12 md:h-12 bg-[#2D5F2E] rounded-full flex items-center justify-center mb-3 md:mb-4">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-2">
              Reward-Based System
            </h3>
            <p className="text-gray-600 leading-relaxed text-sm md:text-base">
              Earn points and rewards for every kilogram of food waste you contribute.
              Redeem your points for discounts, vouchers, and other exciting benefits.
            </p>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 md:p-6 lg:p-7 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-11 h-11 md:w-12 md:h-12 bg-[#2D5F2E] rounded-full flex items-center justify-center mb-3 md:mb-4">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-2">
              Biogas to Electricity
            </h3>
            <p className="text-gray-600 leading-relaxed text-sm md:text-base">
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

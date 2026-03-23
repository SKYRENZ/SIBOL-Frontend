import React from 'react';
import { useNavigate } from 'react-router-dom';

interface HeroSectionProps {
  trashBgSrc: string;
  onOpenGame: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ trashBgSrc, onOpenGame }) => {
  const navigate = useNavigate();

  return (
    <section className="pt-20 pb-8 px-4 sm:px-6 md:px-8 lg:px-12 relative overflow-hidden min-h-screen flex items-center bg-white snap-start scroll-mt-16">
      <div className="absolute right-0 bottom-0 top-auto h-[60%] md:h-[70%] w-auto z-0">
        <img
          src={trashBgSrc}
          alt="Food Waste"
          className="h-full w-auto object-cover object-bottom"
        />
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto relative z-10 w-full">
        <div className="max-w-full sm:max-w-[550px] md:max-w-[650px] lg:max-w-[700px] space-y-4 sm:space-y-5 md:space-y-6 relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[64px] font-bold text-gray-900 leading-tight">
            Make your food waste
            <br />
            <span className="text-[#2D5F2E]">powerful.</span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed max-w-[550px]">
            Transform your food waste into renewable energy. Join SIBOL's innovative
            waste-to-energy program and contribute to a sustainable future while earning rewards.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={() => navigate('/signup')}
              className="px-5 sm:px-6 md:px-7 lg:px-8 py-2.5 sm:py-3 md:py-3.5 bg-[#5F8D4E] text-white rounded-full font-semibold text-sm sm:text-base hover:bg-[#4a6d3d] transition-colors shadow-lg hover:shadow-xl"
            >
              Get Started
            </button>
            <button
              onClick={() => {
                const featuresSection = document.getElementById('features-section');
                featuresSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-5 sm:px-6 md:px-7 lg:px-8 py-2.5 sm:py-3 md:py-3.5 bg-white text-[#5F8D4E] border-2 border-[#5F8D4E] rounded-full font-semibold text-sm sm:text-base hover:bg-[#5F8D4E] hover:text-white transition-colors shadow-lg hover:shadow-xl"
            >
              Learn More
            </button>
            <button
              onClick={onOpenGame}
              className="px-5 sm:px-6 md:px-7 lg:px-8 py-2.5 sm:py-3 md:py-3.5 bg-[#88AB8E] text-white rounded-full font-semibold text-sm sm:text-base hover:bg-[#6d8b70] transition-colors shadow-lg hover:shadow-xl"
            >
              🎮 Play Game
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

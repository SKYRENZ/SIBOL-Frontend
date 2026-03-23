import React from 'react';

interface LandingFooterProps {
  logoSrc: string;
}

const LandingFooter: React.FC<LandingFooterProps> = ({ logoSrc }) => {
  return (
    <footer className="bg-[#2D5F2E] text-white py-4 sm:py-4 md:py-4 px-4 sm:px-6 md:px-8 snap-start scroll-mt-16">
      <div className="max-w-7xl mx-auto text-center">
        <div className="flex items-center justify-center gap-1 mb-2 sm:mb-3">
          <img
            src={logoSrc}
            alt="SIBOL Logo"
            className="h-6 w-6 sm:h-7 sm:w-7"
          />
          <span className="text-base sm:text-lg font-bold">SIBOL</span>
        </div>
        <p className="text-white/80 text-xs sm:text-sm px-4">
          © 2024 SIBOL Project. All rights reserved. | Transforming waste into energy, one household at a time.
        </p>
      </div>
    </footer>
  );
};

export default LandingFooter;

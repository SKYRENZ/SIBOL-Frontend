import React from 'react';

interface LandingFooterProps {
  logoSrc: string;
}

const LandingFooter: React.FC<LandingFooterProps> = ({ logoSrc }) => {
  return (
    <footer
      className="bg-[#2D5F2E] text-white py-6 md:py-8 px-4 sm:px-6"
      style={{ scrollSnapAlign: 'end', scrollSnapStop: 'normal' }}
    >
      <div className="max-w-7xl mx-auto text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <img
            src={logoSrc}
            alt="SIBOL Logo"
            className="h-7 w-7"
          />
          <span className="text-lg font-bold">SIBOL</span>
        </div>
        <p className="text-white/80 text-sm">
          © 2024 SIBOL Project. All rights reserved. | Transforming waste into energy, one household at a time.
        </p>
      </div>
    </footer>
  );
};

export default LandingFooter;

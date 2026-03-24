import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface LandingHeaderProps {
  logoSrc: string;
}

const LandingHeader: React.FC<LandingHeaderProps> = ({ logoSrc }) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 10) {
        // Always show header at the top
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        // Scrolling down
        setIsVisible(false);
      } else {
        // Scrolling up
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  const handleSignIn = () => {
    navigate('/login');
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 bg-white z-50 shadow-md border-b border-gray-100 transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-5 lg:px-[15px] py-2.5 sm:py-3.5 md:py-4 lg:py-5 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-3.5">
          <img
            src={logoSrc}
            alt="SIBOL Logo"
            className="h-7 sm:h-8 md:h-9 lg:h-[43px]"
          />
        </div>
        <button
          onClick={handleSignIn}
          className="px-6 sm:px-7 md:px-8 lg:px-10 py-2 sm:py-2.5 md:py-3 lg:py-3 bg-[#2D5F2E] text-white rounded-3xl hover:bg-[#234A23] transition-colors duration-200 font-semibold text-sm sm:text-base md:text-lg shadow-md"
        >
          Sign In
        </button>
      </div>
    </header>
  );
};

export default LandingHeader;

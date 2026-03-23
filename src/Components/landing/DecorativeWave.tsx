import React from 'react';

const DecorativeWave: React.FC = () => {
  return (
    <div className="w-screen relative left-[50%] right-[50%] -mx-[50vw] h-[80px] bg-[#E8F5E9]">
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="w-full h-full">
        <path
          fill="#88AB8E"
          d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
        />
      </svg>
    </div>
  );
};

export default DecorativeWave;

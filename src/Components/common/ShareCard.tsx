import React from 'react';
import shareGameImg from '../../assets/images/sharegame.png';

interface ShareCardProps {
  score: number;
  moves: number;
  matchedPairs: number;
  totalPairs: number;
  isGameComplete: boolean;
}

export const ShareCard = React.forwardRef<HTMLDivElement, ShareCardProps>(
  ({ score, moves, matchedPairs, totalPairs, isGameComplete }, ref) => {
    const completionPercentage = totalPairs > 0 ? Math.round((matchedPairs / totalPairs) * 100) : 0;

    return (
      <div
        ref={ref}
        className="relative inline-block font-['Segoe UI'] text-white overflow-hidden shadow-2xl"
        style={{
          position: 'absolute',
          left: '-9999px',
          backgroundColor: '#071a07',
          // Force base size based on standard Facebook OG image width
          width: '1200px',
        }}
      >
        {/* Render the image at its natural aspect ratio constrained by our fixed width */}
        <img 
          src={shareGameImg} 
          alt="Share Template" 
          className="block w-[1200px] h-auto object-cover z-0" 
        />

        {/* DETAILS OVERLAY in the dark box on the right */}
        {/* Based on common landscape split UI: left ~50%, right ~45% box */}
        <div 
          className="absolute z-10 flex flex-col items-center justify-center p-8" 
          style={{ 
            left: '46%', 
            top: '20%', 
            width: '48%', 
            height: '60%',
          }}
        >
          {isGameComplete ? (
            <p className="text-[32px] font-bold text-white/90 mb-2 uppercase tracking-widest text-center">Final Score</p>
          ) : (
            <p className="text-[32px] font-bold text-white/90 mb-2 uppercase tracking-widest text-center">Current Score</p>
          )}

          <div 
            className="text-[160px] font-extrabold text-[#00e676] leading-none mb-10" 
            style={{ textShadow: '0 0 30px rgba(0,230,118,0.4)' }}
          >
            {score}
          </div>

          <div className="flex w-full justify-center items-center">
            <div className="flex flex-col items-center flex-1">
              <span className="text-[28px] text-white/60 mb-2 uppercase tracking-widest">Moves</span>
              <span className="text-[64px] font-bold text-white leading-none tracking-wide">{moves}</span>
            </div>
            
            {/* Divider */}
            <div className="w-[3px] h-[70px] bg-white/10 rounded-full mx-4"></div>
            
            <div className="flex flex-col items-center flex-1">
              <span className="text-[28px] text-white/60 mb-2 uppercase tracking-widest">Found</span>
              <span className="text-[64px] font-bold text-white leading-none tracking-wide">{matchedPairs}/{totalPairs}</span>
            </div>
          </div>
          
          {/* Progress Bar under stats */}
          <div className="w-[85%] h-[12px] bg-black/50 rounded-full mt-12 overflow-hidden outline outline-1 outline-white/10" style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)' }}>
             {completionPercentage > 0 && (
               <div 
                 className="h-full transition-all"
                 style={{ 
                   background: 'linear-gradient(90deg, #00e676 0%, #00c853 100%)',
                   width: `${completionPercentage}%`, 
                   boxShadow: '0 0 10px rgba(0,230,118,0.5)' 
                 }}
               ></div>
             )}
          </div>
        </div>
      </div>
    );
  }
);

ShareCard.displayName = 'ShareCard';

export default ShareCard;

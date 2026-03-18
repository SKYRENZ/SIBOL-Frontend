import React from 'react';

interface ShareCardProps {
  score: number;
  moves: number;
  matchedPairs: number;
  totalPairs: number;
  isGameComplete: boolean;
}

const MidGameShareCard = React.forwardRef<HTMLDivElement, ShareCardProps>(
  ({ score, moves, matchedPairs, totalPairs }, ref) => {
    const completionPercentage = Math.round((matchedPairs / totalPairs) * 100);

    return (
      <div
        ref={ref}
        className="w-[1080px] h-[1080px] bg-gradient-to-br from-[#88AB8E] to-[#5a7e5b] flex flex-col items-center justify-center p-12 text-white font-['Segoe UI']"
        style={{
          boxShadow: '0 0 40px rgba(0,0,0,0.3)',
          position: 'absolute',
          left: '-9999px',
        }}
      >
        {/* Top Logo Area */}
        <div className="mb-12 text-center">
          <div className="text-8xl mb-4">🎮</div>
          <h1 className="text-6xl font-bold mb-2">SIBOL Games</h1>
          <p className="text-2xl text-green-100">In Progress...</p>
        </div>

        {/* Main Content */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-12 w-full mb-12 text-center border-2 border-white/20">
          <p className="text-3xl font-bold text-green-200 mb-6">🎴 MATCHING GAME 🎴</p>
          <div className="text-7xl font-bold text-[#FFD700] mb-4">{score}</div>
          <p className="text-3xl mb-12">Current Score</p>

          <div className="grid grid-cols-3 gap-8">
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <p className="text-xl text-gray-200 mb-2">Moves</p>
              <p className="text-4xl font-bold">{moves}</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <p className="text-xl text-gray-200 mb-2">Found</p>
              <p className="text-4xl font-bold">{matchedPairs}/{totalPairs}</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <p className="text-xl text-gray-200 mb-2">Progress</p>
              <p className="text-4xl font-bold">{completionPercentage}%</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-8 bg-black/20 rounded-full h-6 overflow-hidden">
            <div
              className="bg-gradient-to-r from-yellow-300 to-yellow-500 h-full rounded-full transition-all"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <p className="text-2xl font-bold mb-4">Can you beat my score?</p>
          <p className="text-xl text-gray-100 mb-8">
            Join me learning about waste management 🌱
          </p>
          <p className="text-xl font-bold text-[#FFD700]">
            SIBOL: Transform Waste into Energy ⚡
          </p>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/30 py-6 text-center text-lg">
          <p>🎮 Play SIBOL Games & Learn About Sustainability 🌍</p>
        </div>
      </div>
    );
  }
);

MidGameShareCard.displayName = 'MidGameShareCard';

export const ShareCard = React.forwardRef<HTMLDivElement, ShareCardProps>(
  ({ score, moves, matchedPairs, totalPairs, isGameComplete }, ref) => {
    const completionPercentage = Math.round((matchedPairs / totalPairs) * 100);

    if (!isGameComplete) {
      return (
        <MidGameShareCard
          ref={ref}
          score={score}
          moves={moves}
          matchedPairs={matchedPairs}
          totalPairs={totalPairs}
          isGameComplete={false}
        />
      );
    }

    return (
      <div
        ref={ref}
        className="w-[1080px] h-[1080px] bg-gradient-to-br from-[#2D5F2E] to-[#1a3a1b] flex flex-col items-center justify-center p-12 text-white font-['Segoe UI']"
        style={{
          boxShadow: '0 0 40px rgba(0,0,0,0.3)',
          position: 'absolute',
          left: '-9999px',
        }}
      >
        {/* Top Logo Area */}
        <div className="mb-12 text-center">
          <div className="text-8xl mb-4">🎮</div>
          <h1 className="text-6xl font-bold mb-2">SIBOL Game</h1>
          <p className="text-2xl text-green-200">Matching Challenge</p>
        </div>

        {/* Main Content */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-12 w-full mb-12 text-center border-2 border-white/20">
          <p className="text-3xl font-bold text-green-300 mb-6">🎉 VICTORY! 🎉</p>
          <div className="text-7xl font-bold text-[#FFD700] mb-4">{score}</div>
          <p className="text-3xl mb-12">Final Score</p>

          <div className="grid grid-cols-3 gap-8">
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <p className="text-xl text-gray-300 mb-2">Moves</p>
              <p className="text-4xl font-bold">{moves}</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <p className="text-xl text-gray-300 mb-2">Pairs Found</p>
              <p className="text-4xl font-bold">{matchedPairs}/{totalPairs}</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <p className="text-xl text-gray-300 mb-2">Progress</p>
              <p className="text-4xl font-bold">{completionPercentage}%</p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <p className="text-2xl font-bold mb-4">Join me on SIBOL!</p>
          <p className="text-xl text-gray-200 mb-8">
            Transform food waste into renewable energy 🌱
          </p>
          <div className="flex gap-3 justify-center">
            <span className="px-6 py-3 bg-white/20 rounded-full text-xl">♻️ Waste to Energy</span>
            <span className="px-6 py-3 bg-white/20 rounded-full text-xl">🎮 Play & Learn</span>
            <span className="px-6 py-3 bg-white/20 rounded-full text-xl">🌍 Save Planet</span>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/30 py-6 text-center text-lg">
          <p>🌱 SIBOL - Transforming Food Waste into Energy 🌱</p>
        </div>
      </div>
    );
  }
);

ShareCard.displayName = 'ShareCard';

export default ShareCard;

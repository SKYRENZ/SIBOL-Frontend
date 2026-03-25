import React, { useState } from 'react';
import { Lock, X } from 'lucide-react';
import ReactDOM from 'react-dom';
import WasteGame from './WasteGame';
import MatchingGame from './MatchingGame';
import liliIcon from '../../assets/images/lili.png';

interface GameSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

type GameType = 'selector' | 'wasteCatcher' | 'matching';

const WASTE_CATCHER_LOCKED = true;
const WASTE_CATCHER_LOCK_NOTE = 'Temporarily unavailable while we tune gameplay fixes.';

const GameSelector: React.FC<GameSelectorProps> = ({ isOpen, onClose }) => {
  const [selectedGame, setSelectedGame] = useState<GameType>('selector');

  if (!isOpen) return null;

  const handleGameSelect = (game: GameType) => {
    if (game === 'wasteCatcher' && WASTE_CATCHER_LOCKED) {
      return;
    }
    setSelectedGame(game);
  };

  const handleBackToSelector = () => {
    setSelectedGame('selector');
  };

  // Show WasteGame
  if (selectedGame === 'wasteCatcher' && !WASTE_CATCHER_LOCKED) {
    return (
      <WasteGame
        isOpen={true}
        onClose={() => {
          handleBackToSelector();
        }}
      />
    );
  }

  // Show MatchingGame
  if (selectedGame === 'matching') {
    return (
      <MatchingGame
        isOpen={true}
        onClose={() => {
          handleBackToSelector();
        }}
      />
    );
  }

  // Show selector modal
  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        <div className="p-4 sm:p-6" style={{ maxHeight: '95vh', overflow: 'hidden' }}>
          {/* Header with close button */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#2D5F2E]">
                🎮 Choose Your Game
              </h2>
              <p className="text-xs sm:text-sm text-gray-600">Learn about waste management while having fun!</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 ml-4"
              aria-label="Close game selector"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Game Cards - compact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Waste Catcher Card */}
            <div
              onClick={() => handleGameSelect('wasteCatcher')}
              className={`relative rounded-lg p-4 transition-all transform bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9] ${
                WASTE_CATCHER_LOCKED
                  ? 'cursor-not-allowed opacity-90'
                  : 'cursor-pointer hover:shadow-lg hover:scale-105'
              }`}
              aria-disabled={WASTE_CATCHER_LOCKED}
            >
              <div className="text-3xl mb-2">🗑️</div>
              <h3 className="text-lg font-bold text-[#2D5F2E] mb-1">Waste Catcher</h3>
              <p className="text-xs text-gray-700 mb-2">
                Catch falling food waste with your bin. Build combos and avoid bad waste!
              </p>
              <div className="space-y-0 text-xs text-gray-600">
                <p>✨ WASD or Arrow Keys | ⚡ Progressive Difficulty</p>
              </div>

              {WASTE_CATCHER_LOCKED && (
                <div className="absolute inset-0 rounded-lg bg-black/30 border border-[#2D5F2E]/20 backdrop-blur-[1px] flex items-center justify-center">
                  <div className="px-3 py-2 rounded-md bg-white/95 text-[#2D5F2E] shadow-sm border border-[#2D5F2E]/20 flex items-center gap-2 text-xs font-semibold">
                    <Lock className="w-4 h-4" />
                    <span>Locked</span>
                  </div>
                  <p className="absolute bottom-2 left-2 right-2 text-[10px] text-center text-[#1f3b20] font-medium">
                    {WASTE_CATCHER_LOCK_NOTE}
                  </p>
                </div>
              )}
            </div>

            {/* Matching Game Card */}
            <div
              onClick={() => handleGameSelect('matching')}
              className="rounded-lg p-4 cursor-pointer hover:shadow-lg hover:shadow-green-900/30 transition-all transform hover:scale-105 border border-[#2e7d32]/40"
              style={{ background: 'linear-gradient(135deg, #0a2e0a, #1a4a1a)' }}
            >
              <div className="mb-2">
                <img
                  src={liliIcon}
                  alt="Lili mascot"
                  className="w-14 h-14 object-contain"
                />
              </div>
              <h3 className="text-lg font-bold text-[#00c853] mb-1">Matching Game</h3>
              <p className="text-xs text-white/70 mb-2">
                Flip cards to find matching food waste pairs. Test your memory!
              </p>
              <div className="space-y-0 text-xs text-[#4caf50]/70">
                <p>🖱️ Click to flip | 🧠 Memory & Speed Challenge</p>
              </div>
            </div>
          </div>

          {/* Decorative footer - minimal */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-center text-xs text-gray-500">
              🌱 Learn while playing!
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default GameSelector;

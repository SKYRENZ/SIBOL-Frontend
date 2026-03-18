import React, { useRef } from 'react';
import { X, Facebook } from 'lucide-react';
import { useMatchingGame } from '../../hooks/useMatchingGame';
import { getMidGameTemplate, getPostGameTemplate } from '../../utils/socialShare';
import SharePreview from './SharePreview';
import ReactDOM from 'react-dom';
import liliImg from '../../assets/images/lili.png';

interface MatchingGameProps {
  isOpen: boolean;
  onClose: () => void;
}

const MatchingGame: React.FC<MatchingGameProps> = ({ isOpen, onClose }) => {
  const { gameState, flipCard, togglePause, resetGame } = useMatchingGame(4);
  const gameLoopRef = useRef<number>();
  const [sharePreviewOpen, setSharePreviewOpen] = React.useState(false);
  const [shareText, setShareText] = React.useState('');

  // Handle ESC key
  React.useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen && !sharePreviewOpen) return null;

  const gridSize = 4;
  const cardSize = 80;
  const gap = 12;
  const gridWidth = gridSize * (cardSize + gap) - gap;

  const gamePortal = isOpen ? ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        <div className="p-3 sm:p-4 flex flex-col" style={{ maxHeight: '95vh', overflow: 'hidden' }}>
          {/* Header with close button */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <img src={liliImg} alt="Lili" className="w-10 h-10 object-contain flex-shrink-0" />
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#2D5F2E]">Matching Game</h2>
                <p className="text-xs sm:text-sm text-gray-600">Flip cards to find matching food waste pairs!</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 ml-4"
              aria-label="Close game"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Game Stats - compact */}
          <div className="grid grid-cols-3 gap-2 mb-2 bg-[#E8F5E9] rounded-lg p-2">
            <div className="text-center">
              <p className="text-gray-600 text-xs">Moves</p>
              <p className="text-lg font-bold text-[#2D5F2E]">{gameState.moves}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-xs">Pairs</p>
              <p className="text-lg font-bold text-[#2D5F2E]">
                {gameState.matchedPairs}/{gameState.totalPairs}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-xs">Score</p>
              <p className="text-lg font-bold text-[#2D5F2E]">{gameState.score}</p>
            </div>
          </div>

          {/* Game Grid - compact with smaller cards */}
          <div
            className="flex justify-center mb-2 mx-auto flex-shrink-0 relative"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${gridSize}, ${cardSize}px)`,
              gap: `${gap}px`,
              width: 'fit-content',
            }}
          >
            {/* Initialization Overlays */}
            {gameState.gamePhase !== 'playing' && (
              <div
                className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 rounded-xl"
                style={{
                  pointerEvents: 'auto',
                }}
              >
                <div className="bg-white px-8 py-6 rounded-lg shadow-xl text-center">
                  {gameState.gamePhase === 'showing' && (
                    <>
                      <p className="text-3xl font-bold text-[#2D5F2E] animate-pulse">👀 Memorize!</p>
                      <p className="text-sm text-gray-600 mt-2">Remember card positions...</p>
                    </>
                  )}
                  {gameState.gamePhase === 'shuffling' && (
                    <>
                      <p className="text-3xl font-bold text-[#2D5F2E] animate-spin">🔄 Shuffling...</p>
                      <p className="text-sm text-gray-600 mt-2">Cards are being mixed...</p>
                    </>
                  )}
                  {gameState.gamePhase === 'flipping' && (
                    <>
                      <p className="text-3xl font-bold text-[#2D5F2E] animate-pulse">🫥 Flipping...</p>
                      <p className="text-sm text-gray-600 mt-2">Get ready to play...</p>
                    </>
                  )}
                </div>
              </div>
            )}

            {gameState.cards.map((card) => (
              <button
                key={card.id}
                onClick={() => flipCard(card.id)}
                disabled={gameState.gameOver || gameState.isPaused || card.isMatched || gameState.gamePhase !== 'playing'}
                className={`
                  relative rounded-lg font-bold text-4xl
                  transition-all duration-300 cursor-pointer select-none
                  flex items-center justify-center
                  ${
                    card.isMatched
                      ? 'bg-green-200 border-2 border-green-400'
                      : card.isFlipped
                      ? 'bg-[#E8F5E9] border-2 border-[#2D5F2E]'
                      : 'bg-gradient-to-br from-[#C8E6C9] to-[#5F8D4E] border-2 border-[#2D5F2E] hover:shadow-lg'
                  }
                  ${gameState.gameOver || gameState.isPaused || gameState.gamePhase !== 'playing' ? 'opacity-75' : ''}
                  ${gameState.gamePhase === 'shuffling' ? 'animate-bounce' : ''}
                `}
                style={{
                  width: `${cardSize}px`,
                  height: `${cardSize}px`,
                  transform: gameState.gamePhase !== 'playing' ? 'scale(1.05)' : 'scale(1)',
                }}
              >
                {card.isFlipped || card.isMatched ? (
                  card.emoji
                ) : (
                  <span className="text-2xl">?</span>
                )}
              </button>
            ))}
          </div>

          {/* Instructions - compact */}
          <div className="bg-[#E8F5E9] rounded-lg p-2 text-xs flex-shrink-0">
            <h3 className="font-bold text-[#2D5F2E] mb-1">Controls:</h3>
            <p className="text-gray-700">🎴 Click cards to flip | 🔍 Match pairs | 🧠 Test your memory | ESC to exit</p>
          </div>

          {/* Share Buttons - always visible */}
          <div className="flex gap-2 mt-2 justify-center">
            <button
              onClick={() => {
                const text = gameState.gameOver
                  ? getPostGameTemplate({
                      gameName: 'Matching Game',
                      score: gameState.score,
                      extraStats: `${gameState.moves} moves and ${gameState.matchedPairs}/${gameState.totalPairs} pairs matched!`,
                      isGameComplete: true
                    })
                  : getMidGameTemplate({
                      gameName: 'Matching Game',
                      score: gameState.score,
                      extraStats: `${gameState.moves} moves and ${gameState.matchedPairs}/${gameState.totalPairs} pairs matched!`,
                      isGameComplete: false
                    });
                setShareText(text);
                setSharePreviewOpen(true);
              }}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              <Facebook className="w-5 h-5" />
              <span>Share</span>
            </button>
          </div>

          {/* Game Over Screen */}
          {gameState.gameOver && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]">
              <div className="bg-white rounded-xl p-6 sm:p-8 text-center max-w-sm mx-4">
                <h3 className="text-3xl sm:text-4xl font-bold text-[#2D5F2E] mb-3 sm:mb-4">
                  🎉 You Won!
                </h3>
                <p className="text-4xl sm:text-5xl font-bold text-[#5F8D4E] mb-2">{gameState.score}</p>
                <p className="text-gray-600 mb-4">Final Score</p>

                <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
                  <div className="bg-[#E8F5E9] p-3 rounded-lg">
                    <p className="text-gray-600">Total Moves</p>
                    <p className="text-2xl font-bold text-[#2D5F2E]">{gameState.moves}</p>
                  </div>
                  <div className="bg-[#E8F5E9] p-3 rounded-lg">
                    <p className="text-gray-600">Pairs Matched</p>
                    <p className="text-2xl font-bold text-[#2D5F2E]">{gameState.matchedPairs}</p>
                  </div>
                </div>

                {/* Share Buttons */}
                <div className="flex gap-2 mb-6 justify-center">
                  <button
                    onClick={() => {
                      const text = getPostGameTemplate({
                        gameName: 'Matching Game',
                        score: gameState.score,
                        extraStats: `${gameState.moves} moves and ${gameState.matchedPairs}/${gameState.totalPairs} pairs matched!`,
                        isGameComplete: true
                      });
                      setShareText(text);
                      setSharePreviewOpen(true);
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-md"
                  >
                    <Facebook className="w-5 h-5" />
                    <span>Share</span>
                  </button>
                </div>

                <div className="flex gap-3 sm:gap-4">
                  <button
                    onClick={() => {
                      resetGame();
                    }}
                    className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-[#2D5F2E] text-white rounded-lg font-semibold text-sm sm:text-base hover:bg-[#1a3a1b] transition-colors"
                  >
                    ▶️ Play Again
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-gray-300 text-gray-800 rounded-lg font-semibold text-sm sm:text-base hover:bg-gray-400 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      {gamePortal}
      <SharePreview
        isOpen={sharePreviewOpen}
        onClose={() => setSharePreviewOpen(false)}
        shareText={shareText}
        gameName="Matching Game"
        score={gameState.score}
        moves={gameState.moves}
        matchedPairs={gameState.matchedPairs}
        totalPairs={gameState.totalPairs}
        isGameComplete={gameState.gameOver}
      />
    </>
  );
};

export default MatchingGame;

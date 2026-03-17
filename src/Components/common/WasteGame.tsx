import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useWasteGame } from '../../hooks/useWasteGame';
import { shareToFacebook, shareToInstagram } from '../../utils/socialShare';
import ReactDOM from 'react-dom';

interface WasteGameProps {
  isOpen: boolean;
  onClose: () => void;
}

const WasteGame: React.FC<WasteGameProps> = ({ isOpen, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();

  const {
    gameState,
    updateGame,
    resetGame,
    endGame,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    BIN_WIDTH,
    BIN_HEIGHT,
    PARTICLE_SIZE,
  } = useWasteGame();

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Game loop - render and update
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = () => {
      // Clear canvas
      ctx.fillStyle = '#E8F5E9';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw border
      ctx.strokeStyle = '#2D5F2E';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Update game state
      updateGame();

      // Draw particles (waste items)
      gameState.particles.forEach((particle) => {
        ctx.font = `${PARTICLE_SIZE}px Arial`;
        ctx.textAlign = 'center';

        // Add glow effect for bad waste
        if (particle.isBadWaste) {
          ctx.shadowColor = '#ff6b6b';
          ctx.shadowBlur = 15;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
        } else {
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
        }

        // Draw emoji centered
        ctx.fillText(particle.emoji, particle.x + PARTICLE_SIZE / 2, particle.y + PARTICLE_SIZE);
      });

      ctx.shadowColor = 'transparent'; // Reset shadow
      ctx.textAlign = 'left';

      // Draw waste bin (green rectangle with emoji)
      ctx.fillStyle = '#5F8D4E';
      ctx.fillRect(gameState.binX, gameState.binY, BIN_WIDTH, BIN_HEIGHT);

      // Draw bin outline
      ctx.strokeStyle = '#2D5F2E';
      ctx.lineWidth = 2;
      ctx.strokeRect(gameState.binX, gameState.binY, BIN_WIDTH, BIN_HEIGHT);

      // Draw bin emoji/icon
      ctx.font = '40px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('♻️', gameState.binX + BIN_WIDTH / 2, gameState.binY + BIN_HEIGHT / 2 + 12);
      ctx.textAlign = 'left';

      // Draw score
      ctx.fillStyle = '#2D5F2E';
      ctx.font = 'bold 24px Arial';
      ctx.fillText(`Score: ${gameState.score}`, 20, 40);

      // Draw level
      ctx.font = 'bold 16px Arial';
      ctx.fillText(`Level: ${gameState.level}`, 20, 65);

      // Draw combo (highlight if active)
      if (gameState.combo > 0) {
        ctx.fillStyle = '#FF6B6B';
        ctx.font = 'bold 20px Arial';
        ctx.fillText(`🔥 Combo: ${gameState.combo}x`, CANVAS_WIDTH - 180, 40);
      }

      // Draw missed counter
      ctx.fillStyle = '#666';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(`Missed: ${gameState.missed}`, CANVAS_WIDTH - 120, 65);

      // Draw paused overlay
      if (gameState.isPaused) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        ctx.textAlign = 'left';
      }

      if (!gameState.gameOver) {
        gameLoopRef.current = requestAnimationFrame(gameLoop);
      }
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [isOpen, gameState, updateGame, CANVAS_WIDTH, CANVAS_HEIGHT, BIN_WIDTH, BIN_HEIGHT, PARTICLE_SIZE]);

  // Initialize game when modal opens
  useEffect(() => {
    if (isOpen) {
      resetGame();
    }
  }, [isOpen, resetGame]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        <div className="p-3 sm:p-4 flex flex-col" style={{ maxHeight: '95vh', overflow: 'hidden' }}>
          {/* Header with close button */}
          <div className="flex items-start justify-between mb-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#2D5F2E]">🎮 Waste Catcher</h2>
              <p className="text-xs sm:text-sm text-gray-600">Catch the falling waste to earn points!</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 ml-4"
              aria-label="Close game"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Canvas container - centered and responsive */}
          <div className="bg-[#E8F5E9] rounded-lg overflow-hidden mb-2 flex justify-center flex-shrink-0">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="border-2 border-[#2D5F2E] max-w-full"
              style={{ display: 'block', height: 'auto' }}
            />
          </div>

          {/* Instructions and controls - compact */}
          <div className="bg-[#E8F5E9] rounded-lg p-2 sm:p-3 text-xs sm:text-sm flex-shrink-0">
            <h3 className="font-bold text-[#2D5F2E] mb-1">Controls:</h3>
            <ul className="text-gray-700 space-y-0 text-xs">
              <li>✨ WASD or Arrow Keys - Move bin | 🍎 Catch waste +1pt | 🛍️ Avoid bad waste -2pt</li>
            </ul>
          </div>

          {/* Game Over Screen */}
          {gameState.gameOver && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]">
              <div className="bg-white rounded-xl p-6 sm:p-8 text-center max-w-sm mx-4">
                <h3 className="text-3xl sm:text-4xl font-bold text-[#2D5F2E] mb-3 sm:mb-4">Game Over!</h3>
                <p className="text-4xl sm:text-5xl font-bold text-[#5F8D4E] mb-2">{gameState.score}</p>
                <p className="text-gray-600 mb-4">Final Score</p>

                <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
                  <div className="bg-[#E8F5E9] p-3 rounded-lg">
                    <p className="text-gray-600">Max Combo</p>
                    <p className="text-2xl font-bold text-[#FF6B6B]">🔥 {gameState.maxCombo}x</p>
                  </div>
                  <div className="bg-[#E8F5E9] p-3 rounded-lg">
                    <p className="text-gray-600">Missed</p>
                    <p className="text-2xl font-bold text-[#FF6B6B]">{gameState.missed}</p>
                  </div>
                </div>

                {/* Share Buttons */}
                <div className="flex gap-2 mb-6 justify-center">
                  <button
                    onClick={() => {
                      shareToFacebook({
                        gameName: 'Waste Catcher',
                        score: gameState.score,
                        extraStats: `with ${gameState.maxCombo}x combo!`
                      });
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>👍</span>
                    <span>Facebook</span>
                  </button>
                  <button
                    onClick={() => {
                      shareToInstagram({
                        gameName: 'Waste Catcher',
                        score: gameState.score,
                        extraStats: `with ${gameState.maxCombo}x combo!`
                      });
                    }}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    <span>📷</span>
                    <span>Instagram</span>
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
  );
};

export default WasteGame;

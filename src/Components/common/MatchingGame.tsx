import React, { useRef } from 'react';
import { X, Facebook } from 'lucide-react';
import { useMatchingGame } from '../../hooks/useMatchingGame';
import { getMidGameTemplate, getPostGameTemplate } from '../../utils/socialShare';
import SharePreview from './SharePreview';
import ReactDOM from 'react-dom';
import leafIcon from '../../assets/images/leaf-icon.png';

interface MatchingGameProps {
  isOpen: boolean;
  onClose: () => void;
}

/* ── Decorative SVG leaf ───────────────────────────────── */
const LeafSVG: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 80 80"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M60 20C60 20 55 45 35 55C15 65 10 60 10 60C10 60 15 35 35 25C55 15 60 20 60 20Z"
      fill="#1a5c2a"
      stroke="#00c853"
      strokeWidth="1.5"
    />
    <path
      d="M58 22C40 35 20 55 12 58"
      stroke="#00c853"
      strokeWidth="1"
      opacity="0.6"
    />
    <path d="M45 32C38 40 28 50 18 56" stroke="#00c853" strokeWidth="0.7" opacity="0.4" />
    {/* Small dots / berries */}
    <circle cx="52" cy="18" r="2.5" fill="#00c853" opacity="0.5" />
    <circle cx="58" cy="14" r="1.5" fill="#00c853" opacity="0.4" />
    <circle cx="48" cy="14" r="1.8" fill="#00c853" opacity="0.35" />
  </svg>
);

/* ── Small diamond accent ──────────────────────────────── */
const Diamond: React.FC<{ className?: string; size?: number }> = ({
  className,
  size = 10,
}) => (
  <svg width={size} height={size} viewBox="0 0 10 10" className={className}>
    <rect
      x="5"
      y="0"
      width="5"
      height="5"
      transform="rotate(45 5 5)"
      fill="#2e7d32"
      stroke="#00c853"
      strokeWidth="0.8"
    />
  </svg>
);

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

  /* ── Inline styles ─────────────────────────────────────── */
  const gridPatternStyle: React.CSSProperties = {
    backgroundImage:
      'linear-gradient(rgba(0,200,83,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,83,0.06) 1px, transparent 1px)',
    backgroundSize: '28px 28px',
  };

  const cornerBracketBase: React.CSSProperties = {
    position: 'absolute',
    width: '28px',
    height: '28px',
    borderColor: '#2e7d32',
    borderStyle: 'solid',
    borderWidth: 0,
    pointerEvents: 'none',
  };

  const gamePortal = isOpen
    ? ReactDOM.createPortal(
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(5,15,5,0.85)' }}>
          <div
            className="rounded-2xl shadow-2xl w-full max-w-2xl relative overflow-hidden"
            style={{
              background: '#071a07',
              ...gridPatternStyle,
            }}
          >
            <div
              className="p-4 sm:p-5 flex flex-col relative"
              style={{ maxHeight: '95vh', overflow: 'hidden' }}
            >
              {/* ── Corner brackets ──────────────────────────── */}
              {/* top-left */}
              <div
                style={{
                  ...cornerBracketBase,
                  top: 10,
                  left: 10,
                  borderTopWidth: 2,
                  borderLeftWidth: 2,
                }}
              />
              {/* top-right */}
              <div
                style={{
                  ...cornerBracketBase,
                  top: 10,
                  right: 10,
                  borderTopWidth: 2,
                  borderRightWidth: 2,
                }}
              />
              {/* bottom-left */}
              <div
                style={{
                  ...cornerBracketBase,
                  bottom: 10,
                  left: 10,
                  borderBottomWidth: 2,
                  borderLeftWidth: 2,
                }}
              />
              {/* bottom-right */}
              <div
                style={{
                  ...cornerBracketBase,
                  bottom: 10,
                  right: 10,
                  borderBottomWidth: 2,
                  borderRightWidth: 2,
                }}
              />

              {/* ── Leaf decorations ────────────────────────── */}
              <LeafSVG className="absolute -top-2 -left-2 w-20 h-20 opacity-60 -rotate-12 pointer-events-none" />
              <LeafSVG className="absolute -bottom-2 -right-2 w-16 h-16 opacity-50 rotate-[160deg] pointer-events-none" />

              {/* ── Diamond accents ─────────────────────────── */}
              <Diamond
                className="absolute pointer-events-none"
                size={12}
                // positioned top-center
              />
              <div className="absolute top-3 left-1/2 -translate-x-1/2 pointer-events-none">
                <Diamond size={10} />
              </div>

              {/* ── Header ──────────────────────────────────── */}
              <div className="relative flex items-center justify-center mb-2 relative z-10">
                <div className="text-center">
                  <span className="text-white/90 text-lg sm:text-2xl font-bold tracking-widest uppercase block mb-1">
                    SIBOL GAMES
                  </span>
                  <span className="text-[#00c853] text-xl sm:text-3xl font-extrabold tracking-widest uppercase">
                    MATCHING GAME
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="absolute right-0 top-0 p-2 hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Close game"
                >
                  <X className="w-5 h-5 text-white/70" />
                </button>
              </div>

              {/* ── Tagline + Share/Controls (Vertical Centered) ──── */}
              <div className="flex flex-col items-center gap-3 mb-2 relative z-10 w-full">


                {/* Bottom: Share + Controls (horizontal) */}
                <div className="flex flex-row flex-wrap items-center justify-center gap-3 w-full">
                  <button
                    onClick={() => {
                      const text = gameState.gameOver
                        ? getPostGameTemplate({
                            gameName: 'Matching Game',
                            score: gameState.score,
                            extraStats: `${gameState.moves} moves and ${gameState.matchedPairs}/${gameState.totalPairs} pairs matched!`,
                            isGameComplete: true,
                          })
                        : getMidGameTemplate({
                            gameName: 'Matching Game',
                            score: gameState.score,
                            extraStats: `${gameState.moves} moves and ${gameState.matchedPairs}/${gameState.totalPairs} pairs matched!`,
                            isGameComplete: false,
                          });
                      setShareText(text);
                      setSharePreviewOpen(true);
                    }}
                    className="px-4 py-1.5 rounded-lg font-semibold text-xs transition-colors flex items-center gap-2 shadow-md text-white"
                    style={{
                      background: 'linear-gradient(135deg, #1b5e20, #2e7d32)',
                      border: '1px solid rgba(0,200,83,0.3)',
                    }}
                  >
                    <Facebook className="w-4 h-4" />
                    <span>Share</span>
                  </button>

                  <div
                    className="rounded-lg p-2 text-xs flex flex-row flex-wrap items-center gap-3 sm:gap-4 justify-center"
                    style={{
                      background: 'rgba(0,200,83,0.06)',
                      border: '1px solid rgba(0,200,83,0.12)',
                    }}
                  >
                    <span className="text-[#4caf50]/70 flex items-center gap-1 justify-center whitespace-nowrap">🍃 Click to flip</span>
                    <span className="text-[#4caf50]/70 flex items-center gap-1 justify-center whitespace-nowrap">🔍 Match pairs</span>
                    <span className="text-[#4caf50]/70 flex items-center gap-1 justify-center whitespace-nowrap">🧠 Test memory</span>
                    <span className="text-[#4caf50]/50 flex items-center gap-1 justify-center whitespace-nowrap">ESC to exit</span>
                  </div>
                </div>
              </div>

              {/* ── Game Stats ──────────────────────────────── */}
              <div className="grid grid-cols-3 gap-2 mb-3 rounded-lg p-2 relative z-10"
                style={{ background: 'rgba(0,200,83,0.08)', border: '1px solid rgba(0,200,83,0.15)' }}
              >
                <div className="text-center">
                  <p className="text-[#4caf50]/70 text-xs">Moves</p>
                  <p className="text-lg font-bold text-[#00c853]">{gameState.moves}</p>
                </div>
                <div className="text-center">
                  <p className="text-[#4caf50]/70 text-xs">Pairs</p>
                  <p className="text-lg font-bold text-[#00c853]">
                    {gameState.matchedPairs}/{gameState.totalPairs}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[#4caf50]/70 text-xs">Score</p>
                  <p className="text-lg font-bold text-[#00c853]">{gameState.score}</p>
                </div>
              </div>

              {/* ── Game Grid ──────────────────────────────── */}
              <div
                className="flex justify-center mb-3 mx-auto flex-shrink-0 relative z-10"
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
                    className="fixed inset-0 flex items-center justify-center z-50 rounded-xl"
                    style={{
                      pointerEvents: 'auto',
                      background: 'rgba(5,15,5,0.7)',
                    }}
                  >
                    <div
                      className="px-8 py-6 rounded-xl shadow-xl text-center border"
                      style={{
                        background: 'linear-gradient(135deg, #0d2b0d, #071a07)',
                        borderColor: 'rgba(0,200,83,0.3)',
                      }}
                    >
                      {gameState.gamePhase === 'showing' && (
                        <>
                          <p className="text-3xl font-bold text-[#00c853] animate-pulse">
                            🍃 Memorize!
                          </p>
                          <p className="text-sm text-[#4caf50]/70 mt-2">
                            Remember card positions...
                          </p>
                        </>
                      )}
                      {gameState.gamePhase === 'shuffling' && (
                        <>
                          <p className="text-3xl font-bold text-[#00c853] animate-spin">
                            🔄 Shuffling...
                          </p>
                          <p className="text-sm text-[#4caf50]/70 mt-2">
                            Cards are being mixed...
                          </p>
                        </>
                      )}
                      {gameState.gamePhase === 'flipping' && (
                        <>
                          <p className="text-3xl font-bold text-[#00c853] animate-pulse">
                            🌿 Flipping...
                          </p>
                          <p className="text-sm text-[#4caf50]/70 mt-2">
                            Get ready to play...
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {gameState.cards.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => flipCard(card.id)}
                    disabled={
                      gameState.gameOver ||
                      gameState.isPaused ||
                      card.isMatched ||
                      gameState.gamePhase !== 'playing'
                    }
                    className={`
                      relative rounded-lg font-bold text-4xl
                      transition-all duration-300 cursor-pointer select-none
                      flex items-center justify-center
                      ${
                        card.isMatched
                          ? 'border-2'
                          : card.isFlipped
                          ? 'border-2'
                          : 'border-2 hover:shadow-lg hover:shadow-green-900/40'
                      }
                      ${
                        gameState.gameOver ||
                        gameState.isPaused ||
                        gameState.gamePhase !== 'playing'
                          ? 'opacity-75'
                          : ''
                      }
                      ${gameState.gamePhase === 'shuffling' ? 'animate-bounce' : ''}
                    `}
                    style={{
                      width: `${cardSize}px`,
                      height: `${cardSize}px`,
                      transform:
                        gameState.gamePhase !== 'playing'
                          ? 'scale(1.05)'
                          : 'scale(1)',
                      background: card.isMatched
                        ? 'linear-gradient(135deg, #1b5e20, #2e7d32)'
                        : card.isFlipped
                        ? 'linear-gradient(135deg, #0d3b0d, #1a5c2a)'
                        : 'linear-gradient(135deg, #0a2e0a, #112211)',
                      borderColor: card.isMatched
                        ? '#00c853'
                        : card.isFlipped
                        ? '#4caf50'
                        : '#1b5e20',
                    }}
                  >
                    {card.isFlipped || card.isMatched ? (
                      <span style={{ filter: card.isMatched ? 'brightness(1.2)' : 'none' }}>
                        {card.emoji}
                      </span>
                    ) : (
                      <div className="relative flex items-center justify-center w-full h-full">
                        <div className="absolute inset-3 rounded-full bg-[#00e676]/20 blur-sm" />
                        <img
                          src={leafIcon}
                          alt="Leaf card back"
                          className="relative w-12 h-12 object-contain"
                          style={{
                            filter: 'drop-shadow(0 0 8px rgba(0, 230, 118, 0.65))',
                          }}
                        />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* ── Game Over Screen ─────────────────────────── */}
              {gameState.gameOver && (
                <div className="fixed inset-0 flex items-center justify-center z-[60]"
                  style={{ background: 'rgba(5,15,5,0.85)' }}
                >
                  <div
                    className="rounded-xl p-6 sm:p-8 text-center max-w-sm mx-4 border"
                    style={{
                      background: 'linear-gradient(160deg, #0d2b0d 0%, #071a07 100%)',
                      borderColor: 'rgba(0,200,83,0.3)',
                      ...gridPatternStyle,
                    }}
                  >
                    {/* Corner brackets on game-over card */}
                    <div className="relative">
                      <h3 className="text-3xl sm:text-4xl font-bold text-[#00c853] mb-3 sm:mb-4">
                        🎉 You Won!
                      </h3>
                      <p className="text-4xl sm:text-5xl font-bold text-[#00e676] mb-2">
                        {gameState.score}
                      </p>
                      <p className="text-[#4caf50]/70 mb-4">Final Score</p>

                      <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
                        <div
                          className="p-3 rounded-lg"
                          style={{
                            background: 'rgba(0,200,83,0.08)',
                            border: '1px solid rgba(0,200,83,0.15)',
                          }}
                        >
                          <p className="text-[#4caf50]/70">Total Moves</p>
                          <p className="text-2xl font-bold text-[#00c853]">
                            {gameState.moves}
                          </p>
                        </div>
                        <div
                          className="p-3 rounded-lg"
                          style={{
                            background: 'rgba(0,200,83,0.08)',
                            border: '1px solid rgba(0,200,83,0.15)',
                          }}
                        >
                          <p className="text-[#4caf50]/70">Pairs Matched</p>
                          <p className="text-2xl font-bold text-[#00c853]">
                            {gameState.matchedPairs}
                          </p>
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
                              isGameComplete: true,
                            });
                            setShareText(text);
                            setSharePreviewOpen(true);
                          }}
                          className="flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-md text-white"
                          style={{
                            background: 'linear-gradient(135deg, #1b5e20, #2e7d32)',
                            border: '1px solid rgba(0,200,83,0.3)',
                          }}
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
                          className="flex-1 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base text-white transition-all hover:brightness-110"
                          style={{
                            background: 'linear-gradient(135deg, #00c853, #2e7d32)',
                          }}
                        >
                          ▶️ Play Again
                        </button>
                        <button
                          onClick={onClose}
                          className="flex-1 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-colors text-white/80 hover:text-white"
                          style={{
                            background: 'rgba(255,255,255,0.08)',
                            border: '1px solid rgba(255,255,255,0.15)',
                          }}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

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

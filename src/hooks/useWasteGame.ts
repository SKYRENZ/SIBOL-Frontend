import { useState, useCallback, useRef, useEffect } from 'react';

export interface WasteParticle {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  velocity: number;
  emoji: string;
  isBadWaste: boolean;
}

export interface GameState {
  score: number;
  particles: WasteParticle[];
  binX: number;
  binY: number;
  gameOver: boolean;
  isPaused: boolean;
  level: number;
  combo: number;
  maxCombo: number;
  missed: number;
}

const WASTE_EMOJIS = ['🍎', '🥕', '🥬', '🍌', '🥚', '🥘', '🍽️', '🧄', '🥒'];
const BAD_WASTE_EMOJIS = ['🛍️', '🏺', '🧪', '⚙️', '🔧']; // Plastic, glass, harmful
const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;
const BIN_WIDTH = 60;
const BIN_HEIGHT = 50;
const PARTICLE_SIZE = 50; // Much bigger (was 25)

export const useWasteGame = () => {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    particles: [],
    binX: CANVAS_WIDTH / 2 - BIN_WIDTH / 2,
    binY: CANVAS_HEIGHT - BIN_HEIGHT - 15,
    gameOver: false,
    isPaused: false,
    level: 1,
    combo: 0,
    maxCombo: 0,
    missed: 0,
  });

  const keysPressed = useRef<Record<string, boolean>>({});
  const particleIdRef = useRef(0);
  const frameCountRef = useRef(0);

  // Get current spawn rate based on level
  const getSpawnRate = useCallback((level: number) => {
    return Math.max(3, 10 - level); // Every N frames spawn a particle
  }, []);

  // Update game state with particle and collision detection
  const updateGame = useCallback(() => {
    setGameState((prevState) => {
      if (prevState.gameOver || prevState.isPaused) return prevState;

      let newParticles = [...prevState.particles];
      const level = Math.floor(prevState.score / 10) + 1;

      // Update particle positions
      newParticles = newParticles
        .map((p) => ({
          ...p,
          y: p.y + p.velocity,
        }))
        .filter((p) => {
          // Remove particles that fell off screen and decrease score
          if (p.y >= CANVAS_HEIGHT) {
            setGameState((state) => ({
              ...state,
              score: Math.max(0, state.score - 1),
              combo: 0,
              missed: state.missed + 1,
            }));
            return false;
          }
          return true;
        });

      // Check collisions with bin
      let newScore = prevState.score;
      let newCombo = prevState.combo;
      let newMaxCombo = prevState.maxCombo;
      const binRightEdge = prevState.binX + BIN_WIDTH;
      const binTopEdge = prevState.binY;

      newParticles = newParticles.filter((particle) => {
        const particleBottom = particle.y + PARTICLE_SIZE;
        const particleRight = particle.x + PARTICLE_SIZE;

        // Check if particle collides with bin
        if (
          particle.x < binRightEdge &&
          particleRight > prevState.binX &&
          particle.y < CANVAS_HEIGHT &&
          particleBottom > binTopEdge
        ) {
          if (particle.isBadWaste) {
            // Bad waste: lose points and reset combo
            newScore = Math.max(0, newScore - 2);
            newCombo = 0;
          } else {
            // Good waste: gain points with combo multiplier
            const comboMultiplier = Math.floor(newCombo / 3) + 1;
            newScore += Math.max(1, comboMultiplier);
            newCombo += 1;
            newMaxCombo = Math.max(newMaxCombo, newCombo);
          }
          return false; // Remove particle
        }
        return true;
      });

      // Spawn new particles based on spawn rate (more aggressive with level)
      frameCountRef.current += 1;
      const spawnRate = Math.max(3, 15 - level * 0.5); // Start slow: Level 1 = every 15 frames, gradually increases

      // Spawn multiple particles at higher levels (very gradual increase)
      const particlesToSpawn = 1 + Math.floor(level / 5); // 1 at level 1, 2 at level 5, 3 at level 10, etc.

      if (frameCountRef.current % spawnRate === 0) {
        for (let i = 0; i < particlesToSpawn; i++) {
          const randomX = Math.random() * (CANVAS_WIDTH - PARTICLE_SIZE);
          const isBad = Math.random() < 0.2; // 20% chance of bad waste
          const emojis = isBad ? BAD_WASTE_EMOJIS : WASTE_EMOJIS;
          const emoji = emojis[Math.floor(Math.random() * emojis.length)];

          newParticles.push({
            id: particleIdRef.current++,
            x: randomX,
            y: -PARTICLE_SIZE,
            width: PARTICLE_SIZE,
            height: PARTICLE_SIZE,
            velocity: 1.5 + level * 0.15, // Much more gradual speed increase (was 0.3, way too fast)
            emoji: emoji,
            isBadWaste: isBad,
          });
        }
      }

      // Update bin position based on keys pressed
      let newBinX = prevState.binX;
      let newBinY = prevState.binY;

      if (keysPressed.current['a'] || keysPressed.current['arrowleft']) {
        newBinX = Math.max(0, newBinX - 7);
      }
      if (keysPressed.current['d'] || keysPressed.current['arrowright']) {
        newBinX = Math.min(CANVAS_WIDTH - BIN_WIDTH, newBinX + 7);
      }
      if (keysPressed.current['w'] || keysPressed.current['arrowup']) {
        newBinY = Math.max(0, newBinY - 7);
      }
      if (keysPressed.current['s'] || keysPressed.current['arrowdown']) {
        newBinY = Math.min(CANVAS_HEIGHT - BIN_HEIGHT, newBinY + 7);
      }

      return {
        ...prevState,
        particles: newParticles,
        binX: newBinX,
        binY: newBinY,
        score: newScore,
        combo: newCombo,
        maxCombo: newMaxCombo,
        level: Math.floor(newScore / 10) + 1,
      };
    });
  }, [getSpawnRate]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        keysPressed.current[key] = true;
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        keysPressed.current[key] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Game reset
  const resetGame = useCallback(() => {
    frameCountRef.current = 0;
    particleIdRef.current = 0;
    setGameState({
      score: 0,
      particles: [],
      binX: CANVAS_WIDTH / 2 - BIN_WIDTH / 2,
      binY: CANVAS_HEIGHT - BIN_HEIGHT - 15,
      gameOver: false,
      isPaused: false,
      level: 1,
      combo: 0,
      maxCombo: 0,
      missed: 0,
    });
  }, []);

  // Pause/Resume
  const togglePause = useCallback(() => {
    setGameState((prev) => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  // End game
  const endGame = useCallback(() => {
    setGameState((prev) => ({ ...prev, gameOver: true }));
  }, []);

  return {
    gameState,
    updateGame,
    resetGame,
    togglePause,
    endGame,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    BIN_WIDTH,
    BIN_HEIGHT,
    PARTICLE_SIZE,
  };
};

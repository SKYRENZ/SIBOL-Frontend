import { useState, useCallback, useEffect } from 'react';

export interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface MatchingGameState {
  cards: Card[];
  score: number;
  moves: number;
  matchedPairs: number;
  totalPairs: number;
  gameOver: boolean;
  isPaused: boolean;
  flippedCards: number[]; // IDs of currently flipped cards
  gamePhase: 'showing' | 'shuffling' | 'flipping' | 'playing'; // NEW: Track animation phase
}

const WASTE_EMOJIS = ['🍎', '🥕', '🥬', '🍌', '🥚', '🥘', '🍽️', '🧄'];

export const useMatchingGame = (gridSize: number = 4) => {
  // gridSize: 4 = 4x4 = 16 cards = 8 pairs, 3 = 3x3 = 9 cards (not perfect pairs), 4 recommended
  const pairsCount = (gridSize * gridSize) / 2;

  const [gameState, setGameState] = useState<MatchingGameState>({
    cards: [],
    score: 0,
    moves: 0,
    matchedPairs: 0,
    totalPairs: pairsCount,
    gameOver: false,
    isPaused: false,
    flippedCards: [],
    gamePhase: 'showing', // Start with showing cards
  });

  // Initialize game cards
  const initializeGame = useCallback(() => {
    const totalCards = gridSize * gridSize;
    const emojisNeeded = totalCards / 2;

    // Create pairs of emojis
    let cardEmojis: string[] = [];
    for (let i = 0; i < emojisNeeded; i++) {
      const emoji = WASTE_EMOJIS[i % WASTE_EMOJIS.length];
      cardEmojis.push(emoji, emoji); // Add pair
    }

    // Fisher-Yates shuffle
    for (let i = cardEmojis.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cardEmojis[i], cardEmojis[j]] = [cardEmojis[j], cardEmojis[i]];
    }

    const newCards: Card[] = cardEmojis.map((emoji, index) => ({
      id: index,
      emoji,
      isFlipped: true, // Start FLIPPED to show emojis for memorization
      isMatched: false,
    }));

    setGameState({
      cards: newCards,
      score: 0,
      moves: 0,
      matchedPairs: 0,
      totalPairs: pairsCount,
      gameOver: false,
      isPaused: false,
      flippedCards: [],
      gamePhase: 'showing', // Start with showing cards
    });
  }, [gridSize, pairsCount]);

  // Initialize on mount
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Handle initialization animation sequence: Show -> Shuffle -> Flip -> Play
  useEffect(() => {
    if (gameState.gamePhase === 'playing') return;

    let timers: NodeJS.Timeout[] = [];

    if (gameState.gamePhase === 'showing') {
      // Phase 1: Show cards for 1 second, then move to shuffling
      timers.push(
        setTimeout(() => {
          setGameState((prev) => ({
            ...prev,
            gamePhase: 'shuffling',
          }));
        }, 1000)
      );
    } else if (gameState.gamePhase === 'shuffling') {
      // Phase 2: Shuffle animation for 1 second, then move to flipping
      timers.push(
        setTimeout(() => {
          // Shuffle cards array for visual effect
          const shuffledCards = [...gameState.cards];
          for (let i = shuffledCards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]];
          }

          setGameState((prev) => ({
            ...prev,
            cards: shuffledCards,
            gamePhase: 'flipping',
          }));
        }, 1000)
      );
    } else if (gameState.gamePhase === 'flipping') {
      // Phase 3: Flip all cards to hidden and wait 1 second, then ready to play
      const withFlippedCards = gameState.cards.map((c) => ({
        ...c,
        isFlipped: false, // Set to FALSE to HIDE emojis (show "?")
      }));

      setGameState((prev) => ({
        ...prev,
        cards: withFlippedCards,
      }));

      timers.push(
        setTimeout(() => {
          setGameState((prev) => ({
            ...prev,
            gamePhase: 'playing',
          }));
        }, 1000)
      );
    }

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [gameState.gamePhase]);

  // Handle card flip
  const flipCard = useCallback(
    (cardId: number) => {
      setGameState((prevState) => {
        // Don't allow flipping if:
        // - Card is already matched
        // - Card is already flipped
        // - Already 2 cards flipped
        // - Game is over or paused
        // - Still in initialization phase
        if (
          prevState.gameOver ||
          prevState.isPaused ||
          prevState.flippedCards.length >= 2 ||
          prevState.gamePhase !== 'playing'
        ) {
          return prevState;
        }

        const card = prevState.cards.find((c) => c.id === cardId);
        if (!card || card.isMatched || card.isFlipped) {
          return prevState;
        }

        // Flip the card
        const newFlippedCards = [...prevState.flippedCards, cardId];
        const updatedCards = prevState.cards.map((c) =>
          c.id === cardId ? { ...c, isFlipped: true } : c
        );

        // If 2 cards are flipped, check for match
        if (newFlippedCards.length === 2) {
          const card1 = updatedCards.find((c) => c.id === newFlippedCards[0])!;
          const card2 = updatedCards.find((c) => c.id === newFlippedCards[1])!;

          const isMatch = card1.emoji === card2.emoji;

          // Determine new game state after match check
          if (isMatch) {
            const matchedCards = updatedCards.map((c) =>
              c.id === newFlippedCards[0] || c.id === newFlippedCards[1]
                ? { ...c, isMatched: true }
                : c
            );

            const newMatchedPairs = prevState.matchedPairs + 1;
            const isGameOver = newMatchedPairs === prevState.totalPairs;

            return {
              ...prevState,
              cards: matchedCards,
              flippedCards: [],
              matchedPairs: newMatchedPairs,
              moves: prevState.moves + 1,
              score: prevState.score + 10, // +10 points per match
              gameOver: isGameOver,
            };
          } else {
            // No match - flip back after a delay
            setTimeout(() => {
              setGameState((currentState) => {
                const faceDownCards = currentState.cards.map((c) =>
                  c.id === newFlippedCards[0] || c.id === newFlippedCards[1]
                    ? { ...c, isFlipped: false }
                    : c
                );
                return {
                  ...currentState,
                  cards: faceDownCards,
                  flippedCards: [],
                };
              });
            }, 1000); // 1 second delay before flipping back

            return {
              ...prevState,
              cards: updatedCards,
              flippedCards: newFlippedCards,
              moves: prevState.moves + 1,
              score: Math.max(0, prevState.score - 1), // -1 point for mismatch
            };
          }
        }

        return {
          ...prevState,
          cards: updatedCards,
          flippedCards: newFlippedCards,
        };
      });
    },
    []
  );

  // Toggle pause
  const togglePause = useCallback(() => {
    setGameState((prev) => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  // Reset game
  const resetGame = useCallback(() => {
    initializeGame();
  }, [initializeGame]);

  return {
    gameState,
    flipCard,
    togglePause,
    resetGame,
    gridSize,
  };
};

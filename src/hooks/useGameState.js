import { useState, useCallback } from 'react';
import { buildDeck } from '../data/deck';
import { shuffle, drawCards } from '../utils/deckUtils';
import { evaluateHand } from '../utils/handEvaluator';
import { calculateScore } from '../utils/scoreCalculator';
import { DIFFICULTIES } from '../data/difficulties';
import { pickRandomTarot } from '../data/tarots';

const HAND_SIZE = 8;

function targetForRound(round, diff) {
  return Math.round(diff.baseTarget * Math.pow(diff.growth, round - 1));
}

function evaluatePhase(state) {
  if (state.score >= state.target) return 'WON_ROUND';
  if (state.deck.length < 5) return 'GAME_OVER';
  return 'PLAYING';
}

export function useGameState(difficultyKey = 'normal') {
  const diff = DIFFICULTIES[difficultyKey] || DIFFICULTIES.normal;

  const init = useCallback(() => {
    const shuffled = shuffle(buildDeck());
    const { hand, remaining } = drawCards(shuffled, HAND_SIZE);
    return {
      round: 1,
      score: 0,
      hand,
      deck: remaining,
      target: targetForRound(1, diff),
      phase: 'PLAYING',
      lives: diff.lives,
      discardsLeft: diff.discards,
      tarots: [pickRandomTarot(), pickRandomTarot()],
      tempChipsBonus: 0,
    };
  }, [diff]);

  const [state, setState] = useState(init);

  const nextRound = useCallback(() => {
    setState(prev => {
      const fresh = shuffle(buildDeck());
      const { hand, remaining } = drawCards(fresh, HAND_SIZE);
      const r = prev.round + 1;
      return {
        round: r,
        score: 0,
        hand,
        deck: remaining,
        target: targetForRound(r, diff),
        phase: 'PLAYING',
        lives: prev.lives,
        discardsLeft: diff.discards,
        tarots: prev.tarots,
        tempChipsBonus: 0,
      };
    });
  }, [diff]);

  const addScore = useCallback((points) => {
    setState(prev => ({ ...prev, score: prev.score + points }));
  }, []);

  const playHand = useCallback((selectedIds, jokers = []) => {
    setState(prev => {
      const played = prev.hand.filter(c => selectedIds.includes(c.id));
      const handType = evaluateHand(played);
      let { score: gained, chips, mult } = calculateScore(handType, played, jokers);

      if (prev.tempChipsBonus) {
        chips += prev.tempChipsBonus;
        gained = Math.round(chips * mult);
      }

      const needed = Math.min(selectedIds.length, prev.deck.length);
      const { hand: drawn, remaining: newDeck } = drawCards(prev.deck, needed);
      
      let drawnIndex = 0;
      const newHand = prev.hand.map(c => {
        if (selectedIds.includes(c.id)) {
          if (drawnIndex < drawn.length) {
            const newCard = drawn[drawnIndex];
            drawnIndex++;
            return newCard;
          }
          return null;
        }
        return c;
      }).filter(Boolean);

      const updated = {
        ...prev,
        hand: newHand,
        deck: newDeck,
        score: prev.score + gained,
        lastPlay: { handType, gained, chips, mult },
        tempChipsBonus: 0,
      };
      updated.phase = evaluatePhase(updated);
      return updated;
    });
  }, []);

  const discard = useCallback((selectedIds) => {
    setState(prev => {
      if (prev.discardsLeft <= 0) return prev;
      if (selectedIds.length > prev.deck.length) return prev;

      const needed = selectedIds.length;
      const { hand: drawn, remaining } = drawCards(prev.deck, needed);
      
      let drawnIndex = 0;
      const newHand = prev.hand.map(c => {
        if (selectedIds.includes(c.id)) {
          if (drawnIndex < drawn.length) {
            const newCard = drawn[drawnIndex];
            drawnIndex++;
            return newCard;
          }
          return null;
        }
        return c;
      }).filter(Boolean);

      return {
        ...prev,
        hand: newHand,
        deck: remaining,
        discardsLeft: prev.discardsLeft - 1,
      };
    });
  }, []);

  const skipRound = useCallback(() => {
    setState(prev => ({
      ...prev,
      lives: prev.lives - 1,
      phase: prev.lives - 1 <= 0 ? 'GAME_OVER' : 'WON_ROUND',
    }));
  }, []);

  const loseLife = useCallback(() => {
    setState(prev => {
      const lives = prev.lives - 1;
      return { ...prev, lives, phase: lives <= 0 ? 'GAME_OVER' : 'PLAYING' };
    });
  }, []);

  const useTarot = useCallback((tarotId, selectedCardsIds) => {
    setState(prev => {
      const tarot = prev.tarots.find(t => t.id === tarotId);
      if (!tarot) return prev;

      let updatedHand = [...prev.hand];
      let updatedDeck = [...prev.deck];
      let updatedTempChipsBonus = prev.tempChipsBonus;

      if (tarot.effect === 'enhanceChips') {
        updatedHand = updatedHand.map(c => {
          if (selectedCardsIds.includes(c.id)) {
            return { ...c, chipsBonus: (c.chipsBonus || 0) + tarot.value };
          }
          return c;
        });
      } else if (tarot.effect === 'transformToAce') {
        const aceRank = { id: 'A', label: 'A', value: 14, chips: 11 };
        let count = 0;
        updatedHand = updatedHand.map(c => {
          if (selectedCardsIds.includes(c.id) && count < (tarot.maxCards || 2)) {
            count++;
            return { ...c, rank: aceRank, id: `A-${c.suit.id}-${Date.now()}-${count}` };
          }
          return c;
        });
      } else if (tarot.effect === 'tempBonusChips') {
        updatedTempChipsBonus += tarot.value;
      } else if (tarot.effect === 'destroyCard') {
        const idToDestroy = selectedCardsIds[0];
        if (idToDestroy) {
          updatedHand = updatedHand.filter(c => c.id !== idToDestroy);
          if (updatedDeck.length > 0) {
            const { hand: drawn, remaining } = drawCards(updatedDeck, 1);
            updatedHand = [...updatedHand, ...drawn];
            updatedDeck = remaining;
          }
        }
      }

      const updatedTarots = prev.tarots.filter(t => t.id !== tarotId);

      return {
        ...prev,
        hand: updatedHand,
        deck: updatedDeck,
        tarots: updatedTarots,
        tempChipsBonus: updatedTempChipsBonus,
      };
    });
  }, []);

  const resetGame = useCallback(() => setState(init()), [init]);

  return { ...state, nextRound, addScore, playHand, resetGame, loseLife, discard, skipRound, useTarot };
}

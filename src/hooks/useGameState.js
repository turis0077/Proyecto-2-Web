import { useState, useCallback } from 'react';
import { buildDeck } from '../data/deck';
import { shuffle, drawCards } from '../utils/deckUtils';
import { evaluateHand } from '../utils/handEvaluator';
import { calculateScore } from '../utils/scoreCalculator';
import { DIFFICULTIES } from '../data/difficulties';

const HAND_SIZE = 8;

function targetForRound(blindIndex, subRound, diff) {
  const absoluteRound = blindIndex * 5 + subRound;
  return Math.round(diff.baseTarget * Math.pow(diff.growth, absoluteRound - 1));
}

function evaluatePhase(state) {
  if (state.deck.length < 5) return 'GAME_OVER';
  return state.phase;
}

export function useGameState(difficultyKey = 'normal') {
  const diff = DIFFICULTIES[difficultyKey] || DIFFICULTIES.normal;

  const init = useCallback(() => {
    const shuffled = shuffle(buildDeck());
    const { hand, remaining } = drawCards(shuffled, HAND_SIZE);
    return {
      blindIndex: 0,
      subRound: 1,
      score: 0,
      hand,
      deck: remaining,
      target: targetForRound(0, 1, diff),
      phase: 'PLAYING',
      lives: diff.lives,
      discardsLeft: diff.discards,
      money: 10,
      inventory: { jokers: [], tarots: [] },
      activeJokers: [],
      tempChipsBonus: 0,
    };
  }, [diff]);

  const [state, setState] = useState(init);

  const nextBlind = useCallback(() => {
    setState(prev => {
      if (prev.blindIndex >= 2 && prev.subRound >= 5) return prev; 
      
      const isNextBlind = prev.subRound >= 5;
      const newBlindIndex = isNextBlind ? prev.blindIndex + 1 : prev.blindIndex;
      const newSubRound = isNextBlind ? 1 : prev.subRound + 1;
      
      const fresh = shuffle(buildDeck());
      const { hand, remaining } = drawCards(fresh, HAND_SIZE);
      
      return {
        ...prev,
        blindIndex: newBlindIndex,
        subRound: newSubRound,
        score: 0,
        hand,
        deck: remaining,
        target: targetForRound(newBlindIndex, newSubRound, diff),
        phase: 'PLAYING',
        discardsLeft: diff.discards,
        tempChipsBonus: 0,
        lastPlayResult: null,
      };
    });
  }, [diff]);

  const playHand = useCallback((selectedIds) => {
    setState(prev => {
      const played = prev.hand.filter(c => selectedIds.includes(c.id));
      const handType = evaluateHand(played);
      let { score: gained, chips, mult } = calculateScore(handType, played, prev.activeJokers);

      if (prev.tempChipsBonus) {
        chips += prev.tempChipsBonus;
        gained = Math.round(chips * mult);
      }

      let newScore = prev.score + gained;
      let newSubRound = prev.subRound;
      let newBlindIndex = prev.blindIndex;
      let newMoney = prev.money;
      let newLives = prev.lives;
      let newPhase = 'ROUND_RESULT';
      let moneyEarned = 0;
      let won = false;

      if (newScore >= prev.target) {
        won = true;
        moneyEarned = 2 + Math.floor(newScore / prev.target);
        newMoney += moneyEarned;
      } else {
        won = false;
        newLives -= 1;
        if (newLives <= 0) {
          newPhase = 'GAME_OVER';
        }
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
        score: newScore,
        money: newMoney,
        lives: newLives,
        phase: newPhase,
        lastPlay: { handType, gained, chips, mult },
        lastPlayResult: { won, moneyEarned, score: newScore, target: prev.target },
        tempChipsBonus: 0,
      };
      
      if (updated.phase === 'PLAYING') {
        updated.phase = evaluatePhase(updated);
      }
      return updated;
    });
  }, [diff]);

  const continueToShop = useCallback(() => {
    setState(prev => {
      if (prev.blindIndex >= 2 && prev.subRound >= 5 && prev.lastPlayResult?.won) {
        return { ...prev, phase: 'GAME_WON' };
      }
      return { ...prev, phase: 'WON_ROUND' };
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

  const skipHand = useCallback(() => {
    setState(prev => {
      let newLives = prev.lives - 1;
      let newPhase = newLives <= 0 ? 'GAME_OVER' : 'ROUND_RESULT';
      return { 
        ...prev, 
        lives: newLives, 
        phase: newPhase,
        lastPlayResult: { won: false, moneyEarned: 0, score: 0, target: prev.target }
      };
    });
  }, []);

  const skipBlind = useCallback(() => {
    setState(prev => ({
      ...prev,
      lives: prev.lives - 1,
      phase: prev.lives - 1 <= 0 || prev.blindIndex === 2 ? 'GAME_OVER' : 'WON_ROUND',
    }));
  }, []);

  const loseLife = useCallback(() => {
    setState(prev => {
      const lives = prev.lives - 1;
      return { ...prev, lives, phase: lives <= 0 ? 'GAME_OVER' : 'PLAYING' };
    });
  }, []);

  const buyItem = useCallback((item, type) => {
    setState(prev => {
      if (prev.money < item.price) return prev;
      const updatedInventory = { ...prev.inventory };
      if (type === 'joker') updatedInventory.jokers = [...updatedInventory.jokers, item];
      if (type === 'tarot') updatedInventory.tarots = [...updatedInventory.tarots, item];
      return { ...prev, money: prev.money - item.price, inventory: updatedInventory };
    });
  }, []);

  const toggleActiveJoker = useCallback((joker) => {
    setState(prev => {
      const isActive = prev.activeJokers.some(j => j.id === joker.id);
      if (isActive) {
        return { ...prev, activeJokers: prev.activeJokers.filter(j => j.id !== joker.id) };
      } else {
        if (prev.activeJokers.length >= 2) return prev;
        return { ...prev, activeJokers: [...prev.activeJokers, joker] };
      }
    });
  }, []);

  const useTarot = useCallback((tarotId, selectedCardsIds) => {
    setState(prev => {
      const tarot = prev.inventory.tarots.find(t => t.id === tarotId);
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

      const updatedTarots = prev.inventory.tarots.filter(t => t.id !== tarotId);
      return {
        ...prev,
        hand: updatedHand,
        deck: updatedDeck,
        inventory: { ...prev.inventory, tarots: updatedTarots },
        tempChipsBonus: updatedTempChipsBonus,
      };
    });
  }, []);

  const resetGame = useCallback(() => setState(init()), [init]);

  return { 
    ...state, 
    nextBlind, 
    playHand, 
    resetGame, 
    loseLife, 
    discard, 
    skipHand,
    skipBlind, 
    continueToShop,
    buyItem,
    toggleActiveJoker,
    useTarot 
  };
}

import { useState, useCallback } from 'react';
import { buildDeck } from '../data/deck';
import { shuffle, drawCards } from '../utils/deck/deckUtils';
import { evaluateHand } from '../utils/hand/handIdentificator';
import { calculateScore } from '../utils/score/scoreCalculator';
import { DIFFICULTIES } from '../data/difficulties';
import { generateRiggedHand } from '../utils/hand/handProbabilityManager';

const HAND_SIZE = 8;

function targetForRound(blindIndex, subRound, diff) {
  let absoluteRound = blindIndex * 5 + subRound;
  if (absoluteRound > 10) {
    absoluteRound = 10 + ((absoluteRound - 10) * 0.5);
  }
  return Math.round(diff.baseTarget * Math.pow(diff.growth, absoluteRound - 1));
}

function evaluatePhase(state) {
  if (state.deck.length < 5) return 'GAME_OVER';
  return state.phase;
}

export function useGameState(difficultyKey = 'normal') {
  const diff = DIFFICULTIES[difficultyKey] || DIFFICULTIES.normal;

  const init = useCallback(() => {
    const shuffled = shuffle(buildDeck(0));
    const { hand, remaining } = generateRiggedHand(shuffled, HAND_SIZE);
    return {
      blindIndex: 0,
      subRound: 1,
      score: 0,
      hand,
      deck: remaining,
      target: targetForRound(0, 1, diff),
      phase: 'BLIND_INTRO',
      lives: diff.lives,
      consecutiveSkips: 0,
      consecutiveLosses: 0,
      changesLeft: 3,
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

      const fresh = shuffle(buildDeck(newBlindIndex));
      const { hand, remaining } = generateRiggedHand(fresh, HAND_SIZE);

      return {
        ...prev,
        blindIndex: newBlindIndex,
        subRound: newSubRound,
        score: 0,
        hand,
        deck: remaining,
        target: targetForRound(newBlindIndex, newSubRound, diff),
        phase: 'BLIND_INTRO',
        consecutiveSkips: 0,
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

      let newConsecutiveLosses = prev.consecutiveLosses;
      let newConsecutiveSkips = 0;

      if (newScore >= prev.target) {
        won = true;
        moneyEarned = 2 + Math.floor(newScore / prev.target);
        newMoney += moneyEarned;
        newConsecutiveLosses = 0;
      } else {
        won = false;
        newLives -= 1;
        newConsecutiveLosses += 1;
        if (newLives <= 0 || newConsecutiveLosses >= 3) {
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
        consecutiveLosses: newConsecutiveLosses,
        consecutiveSkips: newConsecutiveSkips,
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



  const replaceFullHand = useCallback(() => {
    setState(prev => {
      if (prev.changesLeft <= 0) return prev;
      const { hand, remaining } = generateRiggedHand(prev.deck, HAND_SIZE);
      return {
        ...prev,
        hand,
        deck: remaining,
        changesLeft: prev.changesLeft - 1,
      };
    });
  }, []);

  const performCardSwaps = useCallback((handCardIds) => {
    setState(prev => {
      if (prev.changesLeft <= 0 || handCardIds.length === 0) return prev;
      const needed = handCardIds.length;
      const { hand: drawn, remaining } = drawCards(prev.deck, needed);

      let drawnIndex = 0;
      const newHand = prev.hand.map(c => {
        if (handCardIds.includes(c.id)) {
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
        changesLeft: prev.changesLeft - 1,
      };
    });
  }, []);

  const skipRound = useCallback(() => {
    setState(prev => {
      if (prev.consecutiveSkips >= 2) return prev;
      return {
        ...prev,
        consecutiveSkips: prev.consecutiveSkips + 1,
        phase: 'ROUND_RESULT',
        lastPlayResult: { won: false, skipped: true, consecutiveSkips: prev.consecutiveSkips + 1, moneyEarned: 0, score: 0, target: prev.target }
      };
    });
  }, []);

  const skipBlind = useCallback(() => {
    setState(prev => {
      if (prev.blindIndex === 2) return prev;
      const cost = prev.blindIndex === 0 ? 1 : 2;
      const newLives = prev.lives - cost;
      return {
        ...prev,
        lives: newLives,
        subRound: 5,
        phase: newLives <= 0 ? 'GAME_OVER' : 'WON_ROUND',
      };
    });
  }, []);

  const startBlind = useCallback(() => {
    setState(prev => ({ ...prev, phase: 'PLAYING' }));
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
      const itemWithInstanceId = { ...item, instanceId: Date.now() + Math.random().toString() };
      if (type === 'joker') updatedInventory.jokers = [...updatedInventory.jokers, itemWithInstanceId];
      if (type === 'tarot') updatedInventory.tarots = [...updatedInventory.tarots, itemWithInstanceId];
      return { ...prev, money: prev.money - item.price, inventory: updatedInventory };
    });
  }, []);

  const toggleActiveJoker = useCallback((joker) => {
    setState(prev => {
      const uniqueId = joker.instanceId || joker.id;
      const isActive = prev.activeJokers.some(j => (j.instanceId || j.id) === uniqueId);
      if (isActive) {
        return { ...prev, activeJokers: prev.activeJokers.filter(j => (j.instanceId || j.id) !== uniqueId) };
      } else {
        if (prev.activeJokers.length >= 2) return prev;
        return { ...prev, activeJokers: [...prev.activeJokers, joker] };
      }
    });
  }, []);

  const useTarot = useCallback((uniqueTarotId, selectedCardsIds) => {
    setState(prev => {
      const tarot = prev.inventory.tarots.find(t => (t.instanceId || t.id) === uniqueTarotId);
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

      const updatedTarots = prev.inventory.tarots.filter(t => (t.instanceId || t.id) !== uniqueTarotId);
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
    skipRound,
    skipBlind,
    continueToShop,
    buyItem,
    replaceFullHand,
    performCardSwaps,
    toggleActiveJoker,
    useTarot,
    startBlind
  };
}

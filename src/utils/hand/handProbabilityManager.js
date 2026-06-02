import { shuffle, drawCards } from '../deck/deckUtils';

const PROBABILITIES = [
  { type: 'ROYAL_FLUSH', weight: 0.10 },
  { type: 'STRAIGHT_FLUSH', weight: 0.20 },
  { type: 'FOUR_OF_A_KIND', weight: 1.00 },
  { type: 'FULL_HOUSE', weight: 3.50 },
  { type: 'FLUSH', weight: 5.00 },
  { type: 'STRAIGHT', weight: 6.00 },
  { type: 'THREE_OF_A_KIND', weight: 7.50 },
  { type: 'TWO_PAIR', weight: 13.00 },
  { type: 'PAIR', weight: 23.70 },
  { type: 'HIGH_CARD', weight: 40.00 }
];

function pickTargetHand() {
  const roll = Math.random() * 100;
  let accumulated = 0;
  for (const prob of PROBABILITIES) {
    accumulated += prob.weight;
    if (roll <= accumulated) return prob.type;
  }
  return 'HIGH_CARD';
}

function findRoyalFlush(deck) {
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  const req = [10, 11, 12, 13, 14];
  for (let suit of suits) {
    const suited = deck.filter(c => c.suit.id === suit);
    const hasAll = req.every(v => suited.some(c => c.rank.value === v));
    if (hasAll) {
      return req.map(v => suited.find(c => c.rank.value === v));
    }
  }
  return null;
}

function findStraightFlush(deck) {
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  for (let suit of suits) {
    const suited = deck.filter(c => c.suit.id === suit).sort((a,b) => a.rank.value - b.rank.value);
    if (suited.length < 5) continue;
    // Check sequences
    for (let i = 0; i <= suited.length - 5; i++) {
      let isSeq = true;
      for (let j = 1; j < 5; j++) {
        if (suited[i+j].rank.value - suited[i+j-1].rank.value !== 1) isSeq = false;
      }
      if (isSeq && suited[i+4].rank.value !== 14) { // exclude Royal
        return suited.slice(i, i+5);
      }
    }
  }
  return null;
}

function findNOfAKind(deck, n) {
  const counts = {};
  deck.forEach(c => {
    if (!counts[c.rank.value]) counts[c.rank.value] = [];
    counts[c.rank.value].push(c);
  });
  for (let val in counts) {
    if (counts[val].length >= n) return counts[val].slice(0, n);
  }
  return null;
}

function findFullHouse(deck) {
  const counts = {};
  deck.forEach(c => {
    if (!counts[c.rank.value]) counts[c.rank.value] = [];
    counts[c.rank.value].push(c);
  });
  let three = null;
  let two = null;
  for (let val in counts) {
    if (!three && counts[val].length >= 3) {
      three = counts[val].slice(0, 3);
    } else if (!two && counts[val].length >= 2) {
      two = counts[val].slice(0, 2);
    }
  }
  if (three && two) return [...three, ...two];
  return null;
}

function findFlush(deck) {
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  for (let suit of suits) {
    const suited = deck.filter(c => c.suit.id === suit);
    if (suited.length >= 5) return suited.slice(0, 5);
  }
  return null;
}

function findStraight(deck) {
  const uniqueVals = [...new Set(deck.map(c => c.rank.value))].sort((a,b) => a - b);
  for (let i = 0; i <= uniqueVals.length - 5; i++) {
    let isSeq = true;
    for (let j = 1; j < 5; j++) {
      if (uniqueVals[i+j] - uniqueVals[i+j-1] !== 1) isSeq = false;
    }
    if (isSeq) {
      const seqVals = uniqueVals.slice(i, i+5);
      return seqVals.map(v => deck.find(c => c.rank.value === v));
    }
  }
  return null;
}

function findTwoPair(deck) {
  const counts = {};
  deck.forEach(c => {
    if (!counts[c.rank.value]) counts[c.rank.value] = [];
    counts[c.rank.value].push(c);
  });
  let p1 = null;
  let p2 = null;
  for (let val in counts) {
    if (!p1 && counts[val].length >= 2) {
      p1 = counts[val].slice(0, 2);
    } else if (!p2 && counts[val].length >= 2) {
      p2 = counts[val].slice(0, 2);
    }
  }
  if (p1 && p2) return [...p1, ...p2];
  return null;
}

function getRiggedCoreCards(deck, type) {
  let core = null;
  switch (type) {
    case 'ROYAL_FLUSH': core = findRoyalFlush(deck); break;
    case 'STRAIGHT_FLUSH': core = findStraightFlush(deck); break;
    case 'FOUR_OF_A_KIND': core = findNOfAKind(deck, 4); break;
    case 'FULL_HOUSE': core = findFullHouse(deck); break;
    case 'FLUSH': core = findFlush(deck); break;
    case 'STRAIGHT': core = findStraight(deck); break;
    case 'THREE_OF_A_KIND': core = findNOfAKind(deck, 3); break;
    case 'TWO_PAIR': core = findTwoPair(deck); break;
    case 'PAIR': core = findNOfAKind(deck, 2); break;
    case 'HIGH_CARD': 
    default:
      return [];
  }
  return core || []; // fallback to random if we can't find it (rare with full deck)
}

export function generateRiggedHand(deck, handSize = 8) {
  const targetType = pickTargetHand();
  let remainingDeck = [...deck];
  
  const coreCards = getRiggedCoreCards(remainingDeck, targetType);
  
  // Remove core cards from deck
  const coreIds = coreCards.map(c => c.id);
  remainingDeck = remainingDeck.filter(c => !coreIds.includes(c.id));
  
  // Fill the rest randomly
  remainingDeck = shuffle(remainingDeck);
  const needed = handSize - coreCards.length;
  const { hand: fillerCards, remaining } = drawCards(remainingDeck, needed);
  
  let finalHand = [...coreCards, ...fillerCards];
  finalHand = shuffle(finalHand); // scramble them so they aren't ordered in the UI
  
  return { hand: finalHand, remaining };
}

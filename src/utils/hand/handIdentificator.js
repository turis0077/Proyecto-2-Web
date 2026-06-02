function rankCounts(cards) {
  const counts = {};
  cards.forEach(c => { counts[c.rank.value] = (counts[c.rank.value] || 0) + 1; });
  const sortedValues = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return { 
    countsArray: sortedValues.map(v => v[1]),
    ranksArray: sortedValues.map(v => parseInt(v[0]))
  };
}

function isFlush(cards) {
  if (cards.length < 5) return false;
  return cards.every(c => c.suit.id === cards[0].suit.id);
}

function getStraightHighCard(cards) {
  if (cards.length < 5) return null;
  const values = [...new Set(cards.map(c => c.rank.value))].sort((a, b) => a - b);
  if (values.length < 5) return null;
  
  // Normal straight
  let isSeq = true;
  for (let i = 1; i < values.length; i++) {
    if (values[i] - values[i-1] !== 1) {
      isSeq = false;
      break;
    }
  }
  if (isSeq) return values[values.length - 1];

  // A-2-3-4-5 straight (Wheel)
  // In our system A is 14.
  const isWheel = JSON.stringify(values) === JSON.stringify([2,3,4,5,14]);
  if (isWheel) return 5;

  return null;
}

export function evaluateHand(cards) {
  if (!cards.length) return 'HIGH_CARD';
  
  const { countsArray } = rankCounts(cards);
  const flush = isFlush(cards);
  const straightHighCard = getStraightHighCard(cards);

  // Royal Flush: A, K, Q, J, 10 of same suit
  if (flush && straightHighCard === 14) return 'ROYAL_FLUSH';

  // Straight Flush: Sequential same suit, not Royal
  if (flush && straightHighCard !== null && straightHighCard !== 14) return 'STRAIGHT_FLUSH';

  // Four of a Kind: 4 cards of same rank
  if (countsArray[0] === 4) return 'FOUR_OF_A_KIND';

  // Full House: 3 cards of same rank + 2 of another
  if (countsArray[0] === 3 && countsArray[1] === 2) return 'FULL_HOUSE';

  // Flush: 5 cards of same suit
  if (flush) return 'FLUSH';

  // Straight: 5 sequential cards, not same suit
  if (straightHighCard !== null) return 'STRAIGHT';

  // Three of a Kind: 3 cards of same rank
  if (countsArray[0] === 3) return 'THREE_OF_A_KIND';

  // Two Pair: 2 distinct pairs
  if (countsArray[0] === 2 && countsArray[1] === 2) return 'TWO_PAIR';

  // One Pair: 1 pair
  if (countsArray[0] === 2) return 'PAIR';

  // High Card: anything else
  return 'HIGH_CARD';
}

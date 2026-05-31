function rankCounts(cards) {
  const counts = {};
  cards.forEach(c => { counts[c.rank.id] = (counts[c.rank.id] || 0) + 1; });
  return Object.values(counts).sort((a, b) => b - a);
}

function isFlush(cards) {
  if (cards.length < 5) return false;
  return cards.every(c => c.suit.id === cards[0].suit.id);
}

function isStraight(cards) {
  if (cards.length < 5) return false;
  const values = [...new Set(cards.map(c => c.rank.value))].sort((a, b) => a - b);
  if (values.length !== cards.length) return false;
  for (let i = 1; i < values.length; i++) {
    if (values[i] - values[i-1] !== 1) {
      // A-2-3-4-5 wheel
      const isWheel = JSON.stringify(values) === JSON.stringify([2,3,4,5,14]);
      return isWheel;
    }
  }
  return true;
}

export function evaluateHand(cards) {
  if (!cards.length) return 'HIGH_CARD';
  const counts = rankCounts(cards);
  const flush = isFlush(cards);
  const straight = isStraight(cards);
  const hasAce = cards.some(c => c.rank.id === 'A');
  const has10 = cards.some(c => c.rank.id === '10');

  if (flush && straight && hasAce && has10) return 'ROYAL_FLUSH';
  if (flush && straight) return 'STRAIGHT_FLUSH';
  if (counts[0] === 4) return 'FOUR_OF_A_KIND';
  if (counts[0] === 3 && counts[1] === 2) return 'FULL_HOUSE';
  if (flush) return 'FLUSH';
  if (straight) return 'STRAIGHT';
  if (counts[0] === 3) return 'THREE_OF_A_KIND';
  if (counts[0] === 2 && counts[1] === 2) return 'TWO_PAIR';
  if (counts[0] === 2) return 'PAIR';
  return 'HIGH_CARD';
}

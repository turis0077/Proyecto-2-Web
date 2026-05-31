import { HAND_TYPES } from '../data/pokerHands';

function appliesCondition(joker, ctx) {
  if (!joker.condition) return true;
  const [type, val] = joker.condition.split(':');
  if (type === 'suit') return ctx.cards.some(c => c.suit.id === val);
  if (type === 'hand') {
    // Match estricto: PAIR solo gatilla con PAIR, no con TWO_PAIR o FULL_HOUSE
    return ctx.handType === val;
  }
  return false;
}

export function calculateScore(handType, cards, jokers = []) {
  const base = HAND_TYPES[handType];
  let chips = base.chips;
  let mult = base.mult;

  // Sumar chips y mult base de cartas y sus ediciones (Foil / Holo)
  cards.forEach(c => {
    let cardChips = c.rank.chips + (c.chipsBonus || 0);
    if (c.edition === 'foil') cardChips += 50;
    chips += cardChips;

    if (c.edition === 'holographic') mult += 10;
  });

  // Aplicar factor multiplicador por ediciones (Polychrome)
  let editionMultFactor = 1;
  cards.forEach(c => {
    if (c.edition === 'polychrome') editionMultFactor *= 1.5;
  });

  const ctx = { cards, handType };
  jokers.forEach(j => {
    if (!appliesCondition(j, ctx)) return;
    switch (j.effect) {
      case 'addChips':         chips += j.value; break;
      case 'addMult':          mult  += j.value; break;
      case 'mulMult':          mult  *= j.value; break;
      case 'conditionalChips': chips += j.value; break;
      case 'conditionalMulMult': mult *= j.value; break;
      case 'perFaceCard': {
        // Cuenta figuras (J, Q, K) por separado e individualmente
        const faces = cards.filter(c => ['J','Q','K'].includes(c.rank.id)).length;
        chips += faces * j.value;
        break;
      }
    }
  });

  mult *= editionMultFactor;

  // Evitar flotantes extraños en mult
  if (mult % 1 !== 0) {
    mult = Math.round(mult * 100) / 100;
  }

  return { chips, mult, score: Math.round(chips * mult) };
}

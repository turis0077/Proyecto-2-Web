import { HAND_TYPES } from '../../data/poker/pokerHands';
import { EDITIONS } from '../../data/poker/deck';

export function appliesCondition(joker, ctx) {
  if (!joker.condition) return true;
  const [type, val] = joker.condition.split(':');
  if (type === 'suit') return ctx.cards.some(c => c.suit.id === val);
  if (type === 'hand') {
    if (val === 'PAIR' && (ctx.handType === 'TWO_PAIR' || ctx.handType === 'FULL_HOUSE')) {
      return false;
    }
    // Match estricto: PAIR solo gatilla con PAIR, no con TWO_PAIR o FULL_HOUSE
    return ctx.handType === val;
  }
  return false;
}

export function calculateScore(handType, cards, jokers = []) {
  const base = HAND_TYPES[handType];
  let chips = base.chips;
  let mult = base.mult;

  let editionMultFactor = 1;

  // Sumar chips y mult base de cartas y sus ediciones
  cards.forEach(c => {
    let cardChips = c.rank.chips + (c.chipsBonus || 0);

    if (c.edition && EDITIONS[c.edition]) {
      cardChips += EDITIONS[c.edition].chipsBonus || 0;
      mult += EDITIONS[c.edition].multBonus || 0;
      if (EDITIONS[c.edition].multFactor) {
        editionMultFactor *= EDITIONS[c.edition].multFactor;
      }
    } else {
      // Fallback in case EDITIONS is not used or missing
      if (c.edition === 'foil') cardChips += 50;
      if (c.edition === 'holographic') mult += 10;
      if (c.edition === 'polychrome') editionMultFactor *= 1.5;
    }

    chips += cardChips;
  });

  const ctx = { cards, handType };
  jokers.forEach(j => {
    if (!appliesCondition(j, ctx)) return;
    switch (j.effect) {
      case 'addChips': chips += j.value; break;
      case 'addMult': mult += j.value; break;
      case 'mulMult': mult *= j.value; break;
      case 'conditionalChips': chips += j.value; break;
      case 'conditionalMulMult': mult *= j.value; break;
      case 'perFaceCard': {
        // Cuenta figuras (J, Q, K) por separado e individualmente
        const faces = cards.filter(c => ['J', 'Q', 'K'].includes(c.rank.id)).length;
        chips += faces * j.value;
        break;
      }
    }
  });

  mult *= editionMultFactor;

  // Forzar Math.round al final para evitar flotantes raros
  mult = Math.round(mult);
  chips = Math.round(chips);

  return { chips, mult, score: chips * mult };
}

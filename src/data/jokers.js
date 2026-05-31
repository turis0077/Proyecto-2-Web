export const JOKERS = [
  {
    id: 'joker-basic',
    name: 'Joker Básico',
    description: '+4 Mult',
    rarity: 'common',
    effect: 'addMult',
    value: 4,
  },
  {
    id: 'joker-greedy',
    name: 'Avaricia',
    description: '+20 Chips si juegas un Diamante',
    rarity: 'common',
    effect: 'conditionalChips',
    value: 20,
    condition: 'suit:diamonds',
  },
  {
    id: 'joker-lucky',
    name: 'Suerte',
    description: '×1.5 Mult si jugaste un Par',
    rarity: 'uncommon',
    effect: 'conditionalMulMult',
    value: 1.5,
    condition: 'hand:PAIR',
  },
  {
    id: 'joker-flush',
    name: 'Inundación',
    description: '+30 Chips por Color',
    rarity: 'uncommon',
    effect: 'conditionalChips',
    value: 30,
    condition: 'hand:FLUSH',
  },
  {
    id: 'joker-multiplier',
    name: 'Multiplicador',
    description: '×2 Mult global',
    rarity: 'rare',
    effect: 'mulMult',
    value: 2,
  },
  {
    id: 'joker-face',
    name: 'Realeza',
    description: '+8 Chips por cada figura (J/Q/K)',
    rarity: 'rare',
    effect: 'perFaceCard',
    value: 8,
  },
];

export function pickRandomJokers(n) {
  const shuffled = [...JOKERS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

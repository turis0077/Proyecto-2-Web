// Palos de la baraja
export const SUITS = [
  { id: 'hearts', symbol: '♥', color: '#d4334a', name: 'Corazones' },
  { id: 'diamonds', symbol: '♦', color: '#d4334a', name: 'Diamantes' },
  { id: 'clubs', symbol: '♣', color: '#1a1d29', name: 'Tréboles' },
  { id: 'spades', symbol: '♠', color: '#1a1d29', name: 'Picas' },
];

// Rangos con sus chips base
export const RANKS = [
  { id: '2', label: '2', value: 2, chips: 12 },
  { id: '3', label: '3', value: 3, chips: 13 },
  { id: '4', label: '4', value: 4, chips: 14 },
  { id: '5', label: '5', value: 5, chips: 15 },
  { id: '6', label: '6', value: 6, chips: 16 },
  { id: '7', label: '7', value: 7, chips: 17 },
  { id: '8', label: '8', value: 8, chips: 18 },
  { id: '9', label: '9', value: 9, chips: 19 },
  { id: '10', label: '10', value: 10, chips: 20 },
  { id: 'J', label: 'J', value: 11, chips: 20 },
  { id: 'Q', label: 'Q', value: 12, chips: 20 },
  { id: 'K', label: 'K', value: 13, chips: 20 },
  { id: 'A', label: 'A', value: 14, chips: 21 },
];

export const EDITIONS = {
  foil: { name: 'Foil', chipsBonus: 50, multBonus: 0, multFactor: 1, glow: '#4a90e2' },
  holographic: { name: 'Holo', chipsBonus: 0, multBonus: 10, multFactor: 1, glow: '#a855f7' },
  polychrome: { name: 'Polychrome', chipsBonus: 0, multBonus: 0, multFactor: 1.5, glow: '#ff5c5c' },
};

export function applyRandomEdition(card, chance = 0.08) {
  if (Math.random() > chance) return card;
  const keys = Object.keys(EDITIONS);
  const edition = keys[Math.floor(Math.random() * keys.length)];
  return { ...card, edition };
}

// Genera las 52 cartas
export function buildDeck() {
  const deck = [];
  SUITS.forEach(suit => {
    RANKS.forEach(rank => {
      const card = {
        id: `${rank.id}-${suit.id}`,
        rank,
        suit,
      };
      deck.push(applyRandomEdition(card, 0.08));
    });
  });
  return deck;
}
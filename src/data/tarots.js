// Inspirados en los tarots de Balatro (versión simplificada y propia)
export const TAROTS = [
  {
    id: 'the-fool',
    name: 'El Loco',
    description: 'Mejora una carta seleccionada: +30 chips permanentes',
    effect: 'enhanceChips',
    value: 30,
    price: 3,
  },
  {
    id: 'the-magician',
    name: 'El Mago',
    description: 'Convierte hasta 2 cartas seleccionadas en Ases',
    effect: 'transformToAce',
    maxCards: 2,
    price: 4,
  },
  {
    id: 'the-empress',
    name: 'La Emperatriz',
    description: '+50 chips a la próxima mano',
    effect: 'tempBonusChips',
    value: 50,
    price: 2,
  },
  {
    id: 'the-tower',
    name: 'La Torre',
    description: 'Destruye 1 carta seleccionada del mazo',
    effect: 'destroyCard',
    maxCards: 1,
    price: 5,
  },
];

export function pickRandomTarot() {
  return TAROTS[Math.floor(Math.random() * TAROTS.length)];
}

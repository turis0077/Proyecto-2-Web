// Fisher-Yates shuffle, retorna un nuevo arreglo
export function shuffle(array) {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Toma las primeras n cartas del mazo, devuelve { hand, remaining }
export function drawCards(deck, n) {
  return {
    hand: deck.slice(0, n),
    remaining: deck.slice(n),
  };
}

// Quita del mazo las cartas cuyos ids estén en la lista
export function removeCards(deck, ids) {
  const idSet = new Set(ids);
  return deck.filter(card => !idSet.has(card.id));
}

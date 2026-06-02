import { TAROTS } from '../../data/tarots';

export function pickRandomTarot() {
  return TAROTS[Math.floor(Math.random() * TAROTS.length)];
}

export function pickRandomTarots(n) {
  const selected = [];
  for (let i = 0; i < n; i++) {
    const picked = TAROTS[Math.floor(Math.random() * TAROTS.length)];
    if (!selected.some(s => s.id === picked.id) || TAROTS.length === 1) {
      selected.push(picked);
    } else {
      const others = TAROTS.filter(t => t.id !== picked.id);
      selected.push(others[Math.floor(Math.random() * others.length)]);
    }
  }
  return selected;
}

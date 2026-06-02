import { TAROTS } from '../../data/tarots';

export function pickRandomTarot() {
  return TAROTS[Math.floor(Math.random() * TAROTS.length)];
}

export function pickRandomTarots(n) {
  const selected = [];
  for (let i = 0; i < n; i++) {
    const picked = TAROTS[Math.floor(Math.random() * TAROTS.length)];
    selected.push({ ...picked, instanceId: Date.now() + Math.random().toString() });
  }
  return selected;
}

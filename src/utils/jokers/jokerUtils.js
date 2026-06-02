import { JOKERS } from '../../data/jokers';

export function pickRandomJokers(n) {
  const selected = [];
  for (let i = 0; i < n; i++) {
    const roll = Math.random() * 100;
    let targetRarity = 'common';
    if (roll <= 15) {
      targetRarity = 'rare';
    } else if (roll <= 50) { // 15 + 35 = 50
      targetRarity = 'uncommon';
    }

    const available = JOKERS.filter(j => j.rarity === targetRarity);
    if (available.length > 0) {
      const picked = available[Math.floor(Math.random() * available.length)];
      selected.push({ ...picked, instanceId: Date.now() + Math.random().toString() });
    }
  }
  return selected;
}

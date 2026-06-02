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
      // Prevent duplicates in shop if possible
      if (!selected.some(s => s.id === picked.id) || available.length === 1) {
        selected.push(picked);
      } else {
        const others = available.filter(j => j.id !== picked.id);
        selected.push(others[Math.floor(Math.random() * others.length)]);
      }
    }
  }
  return selected;
}

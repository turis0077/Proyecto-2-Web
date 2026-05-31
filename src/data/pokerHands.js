export const HAND_TYPES = {
  HIGH_CARD:        { name: 'Carta Alta',          chips: 5,   mult: 1  },
  PAIR:             { name: 'Par',                 chips: 10,  mult: 2  },
  TWO_PAIR:         { name: 'Doble Par',           chips: 20,  mult: 2  },
  THREE_OF_A_KIND:  { name: 'Tercia',              chips: 30,  mult: 3  },
  STRAIGHT:         { name: 'Escalera',            chips: 30,  mult: 4  },
  FLUSH:            { name: 'Color',               chips: 35,  mult: 4  },
  FULL_HOUSE:       { name: 'Full House',          chips: 40,  mult: 4  },
  FOUR_OF_A_KIND:   { name: 'Poker',               chips: 60,  mult: 7  },
  STRAIGHT_FLUSH:   { name: 'Escalera de Color',   chips: 100, mult: 8  },
  ROYAL_FLUSH:      { name: 'Escalera Real',       chips: 150, mult: 12 },
};

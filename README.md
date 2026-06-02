# Proyecto 2: Not-Balatro 🎰
Versión simplificada del videojuego Balatro construida en React + Vite
para el curso Sistemas y Tecnologías Web (UVG, 2026).

## Equipo
- Axel Cruz (turis0077)
- Enya Gálvez (GalvezEnya)


## Cómo se juega (Mecánicas Principales):
- **Estructura del Juego**: Progresas a través de "Ciegas" (Pequeña, Grande y La Casa). Cada ciega consta de hasta 5 rondas donde debes alcanzar un puntaje objetivo.
- **Cartas y Jugadas**: Se reparte una mano de 8 cartas. Selecciona hasta 5 cartas para formar una jugada de póker (Par, Escalera, Color, etc.).
- **Puntuación**: El puntaje se calcula multiplicando las Fichas (Chips) de las cartas por un Multiplicador base según la jugada de póker.
- **Vidas y Derrotas**: Si juegas una mano y no superas el objetivo, pierdes 1 vida. Si acumulas 3 derrotas seguidas o pierdes todas tus vidas → Game Over.
- **Tienda (Jokers y Tarots)**: Al ganar, obtienes dinero y vas a la Tienda. Puedes equipar hasta 2 Jokers (efectos pasivos permanentes) y comprar Tarots (consumibles de un uso para alterar cartas).
- **Ediciones Especiales**: A partir de la Ciega Grande, el mazo puede contener cartas Foil, Holo o Polychrome, las cuales otorgan bonos masivos de chips o multiplicadores al jugarse.
- **Saltos y Descartes**: Puedes "Saltar Ronda" (máx. 2 veces seguidas) para ir a la tienda sin ganar dinero. Puedes "Saltar Ciega" sacrificando vidas. También cuentas con 3 descartes ("Cambiar Cartas") por ronda.

## Stack
- React 18 + Vite 5
- JavaScript (sin TypeScript)
- CSS puro (sin frameworks externos)

## Cómo correr
```bash
npm install
npm run dev
```

## Features extra implementadas 
- 6 jokers únicos (común, poco común, raro)
- 3 niveles de dificultad (easy, normal, hard)
- Música dinámica según fase del juego
- Diseño 100% responsive
- Botón de reinicio con confirmación
- Menú principal con selección de dificultad
- Sistema de vidas con corazones visuales
- 3 tipos de cartas especiales (Foil, Holo Polychrome)
- 4 cartas de tarot consumibles
- Animaciones de cartas, score y transiciones
- Descarte y skip de ronda

## Video de demostración
[Enlace al Video]()


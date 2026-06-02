import { useState } from 'react';
import './Menu.css';

function Menu({ onStart }) {
  const [difficulty, setDifficulty] = useState('normal');

  const DIFF_DESC = {
    easy: 'Objetivos iniciales bajos (200), bajo crecimiento (x1.4) y 7 vidas. Ideal para principiantes.',
    normal: 'Objetivos moderados (300), crecimiento estándar (x1.5) y 5 vidas. La experiencia recomendada.',
    hard: 'Objetivos altos (400), crecimiento acelerado (x1.6) y solo 4 vidas. Para jugadores experimentados.'
  };
  return (
    <div className="menu">
      <h1 className="menu__title">Not-Balatro 🎰</h1>
      <h2 className="menu__subtitle">Una versión simplificada de Balatro. Deberás pasar por 3 Ciegas para ganar, cada Ciega consiste de 5 Rondas en las que deberás alcanzar un puntaje objetivo.</h2>

      <div className="menu__difficulty">
        <span>Dificultad:</span>
        {['easy', 'normal', 'hard'].map(d => (
          <button
            key={d}
            type="button"
            className={`menu__diff-btn ${difficulty === d ? 'active' : ''}`}
            onClick={() => setDifficulty(d)}
          >
            {d.toUpperCase()}
          </button>
        ))}
      </div>
      <p className="menu__diff-desc">
        {DIFF_DESC[difficulty]}
      </p>

      <button type="button" className="menu__start" onClick={() => onStart(difficulty)}>
        Jugar
      </button>

      <p className="menu__credits">UVG · Sistemas y Tecnologías Web · 2026</p>
    </div>
  );
}

export default Menu;

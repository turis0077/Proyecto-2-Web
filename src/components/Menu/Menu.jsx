import { useState } from 'react';
import './Menu.css';

function Menu({ onStart }) {
  const [difficulty, setDifficulty] = useState('normal');
  return (
    <div className="menu">
      <h1 className="menu__title">Not-Balatro 🎰</h1>
      <p className="menu__subtitle">Una versión simplificada de Balatro</p>

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

      <button type="button" className="menu__start" onClick={() => onStart(difficulty)}>
        Jugar
      </button>

      <p className="menu__credits">UVG · Sistemas y Tecnologías Web · 2026</p>
    </div>
  );
}

export default Menu;

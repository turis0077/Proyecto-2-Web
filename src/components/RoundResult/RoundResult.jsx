import React from 'react';
import './RoundResult.css';

function RoundResult({ result, onContinue }) {
  if (!result) return null;

  return (
    <div className="round-result">
      <h2>{result.won ? '¡Objetivo Alcanzado!' : '¡Ronda Fallida!'}</h2>
      
      <div className="round-result__stats">
        <p>Puntaje Obtenido: <strong>{result.score}</strong> / {result.target}</p>
        <p>Dinero Ganado: <strong className="money-earned">+${result.moneyEarned}</strong></p>
        {!result.won && <p className="life-lost">Has perdido 1 ♥</p>}
      </div>

      <button className="round-result__continue-btn" onClick={onContinue}>
        Continuar a la Tienda ➡
      </button>
    </div>
  );
}

export default RoundResult;

import React from 'react';
import './RoundResult.css';

function RoundResult({ result, onContinue }) {
  if (!result) return null;

  return (
    <div className="round-result">
      <h2>{result.skipped ? '¡Ronda Saltada!' : result.won ? '¡Objetivo Alcanzado!' : '¡Ronda Fallida!'}</h2>
      
      <div className="round-result__stats">
        <p>Puntaje Obtenido: <strong>{result.score}</strong> / {result.target}</p>
        <p>Dinero Ganado: <strong className="money-earned">+${result.moneyEarned}</strong></p>
        {result.skipped ? (
          <p className="life-lost" style={{ color: '#f39c12' }}>Saltos consecutivos: {result.consecutiveSkips} / 2</p>
        ) : (
          !result.won && <p className="life-lost">Has perdido 1 ♥</p>
        )}
      </div>

      <button className="round-result__continue-btn" onClick={onContinue}>
        Continuar a la Tienda ➡
      </button>
    </div>
  );
}

export default RoundResult;

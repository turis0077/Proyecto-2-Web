import React, { useState } from 'react';
import './Inventory.css';

function Inventory({ inventory, activeJokers, onToggleJoker, onUseTarot, selectedCardsIds }) {
  const [jokerIndex, setJokerIndex] = useState(0);
  const [tarotIndex, setTarotIndex] = useState(0);

  const handleJokerSlide = (dir) => {
    setJokerIndex(prev => Math.max(0, Math.min(prev + dir, inventory.jokers.length - 2)));
  };

  const handleTarotSlide = (dir) => {
    setTarotIndex(prev => Math.max(0, Math.min(prev + dir, inventory.tarots.length - 2)));
  };
  return (
    <div className="inventory">
      <div className="inventory__section">
        <h4 className="inventory__title">Mis Comodines (Max 2 activos)</h4>
        <div className="inventory__carousel-container">
          <button
            className="carousel-btn left"
            style={{ visibility: jokerIndex > 0 ? 'visible' : 'hidden', display: inventory.jokers.length > 2 ? 'block' : 'none' }}
            onClick={() => handleJokerSlide(-1)}
          >◀</button>

          <div className="inventory__carousel-view">
            {inventory.jokers.length === 0 && <span className="inventory__empty">Vacío</span>}
            <div className="inventory__carousel-track" style={{ transform: `translateX(-${jokerIndex * 88}px)` }}>
              {inventory.jokers.map((j, idx) => {
                const uniqueId = j.instanceId || j.id;
                const isActive = activeJokers.some(active => (active.instanceId || active.id) === uniqueId);
                return (
                  <div
                    key={`${j.id}-${idx}`}
                    className={`inventory__item inventory__item--joker ${isActive ? 'is-active' : ''}`}
                    onClick={() => onToggleJoker(j)}
                    title={j.description}
                  >
                    <div className="item-name">{j.name}</div>
                    <div className="item-status">{isActive ? 'Activo' : 'Inactivo'}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            className="carousel-btn right"
            style={{ visibility: jokerIndex < inventory.jokers.length - 2 ? 'visible' : 'hidden', display: inventory.jokers.length > 2 ? 'block' : 'none' }}
            onClick={() => handleJokerSlide(1)}
          >
            ▶
          </button>
        </div>
      </div>

      <div className="inventory__section">
        <h4 className="inventory__title">Mis Tarots (Clic para usar)</h4>
        <div className="inventory__carousel-container">
          <button
            className="carousel-btn left"
            style={{ visibility: tarotIndex > 0 ? 'visible' : 'hidden', display: inventory.tarots.length > 2 ? 'block' : 'none' }}
            onClick={() => handleTarotSlide(-1)}
          >
            ◀
          </button>

          <div className="inventory__carousel-view">
            {inventory.tarots.length === 0 && <span className="inventory__empty">Vacío</span>}
            <div className="inventory__carousel-track" style={{ transform: `translateX(-${tarotIndex * 88}px)` }}>
              {inventory.tarots.map((t, idx) => (
                <div
                  key={`${t.id}-${idx}`}
                  className="inventory__item inventory__item--tarot"
                  onClick={() => {
                    if (selectedCardsIds.length > 0) {
                      onUseTarot(t.instanceId || t.id, selectedCardsIds);
                    } else {
                      alert('Selecciona al menos una carta para usar el Tarot.');
                    }
                  }}
                  title={t.description}
                >
                  <div className="item-name">{t.name}</div>
                  <div className="item-desc">{t.description}</div>
                </div>
              ))}
            </div>
          </div>

          <button
            className="carousel-btn right"
            style={{ visibility: tarotIndex < inventory.tarots.length - 2 ? 'visible' : 'hidden', display: inventory.tarots.length > 2 ? 'block' : 'none' }}
            onClick={() => handleTarotSlide(1)}
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  );
}

export default Inventory;

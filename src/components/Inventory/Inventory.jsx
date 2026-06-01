import React from 'react';
import './Inventory.css';

function Inventory({ inventory, activeJokers, onToggleJoker, onUseTarot, selectedCardsIds }) {
  return (
    <div className="inventory">
      <div className="inventory__section">
        <h4 className="inventory__title">Mis Comodines (Max 2 activos)</h4>
        <div className="inventory__items">
          {inventory.jokers.map((j, idx) => {
            const isActive = activeJokers.some(active => active.id === j.id);
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
          {inventory.jokers.length === 0 && <span className="inventory__empty">Vacío</span>}
        </div>
      </div>

      <div className="inventory__section">
        <h4 className="inventory__title">Mis Tarots (Clic para usar)</h4>
        <div className="inventory__items">
          {inventory.tarots.map((t, idx) => (
            <div 
              key={`${t.id}-${idx}`} 
              className="inventory__item inventory__item--tarot"
              onClick={() => {
                if (selectedCardsIds.length > 0) {
                  onUseTarot(t.id, selectedCardsIds);
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
          {inventory.tarots.length === 0 && <span className="inventory__empty">Vacío</span>}
        </div>
      </div>
    </div>
  );
}

export default Inventory;

import { useState, useEffect } from 'react';
import { pickRandomJokers } from '../../utils/jokers/jokerUtils';
import { pickRandomTarots } from '../../utils/tarot/tarotUtils';
import Joker from '../Joker/Joker';
import './Shop.css';

function Shop({ money, onBuy, onNextBlind }) {
  const [jokers, setJokers] = useState([]);
  const [tarots, setTarots] = useState([]);
  const [selectedJokers, setSelectedJokers] = useState([]);
  const [selectedTarots, setSelectedTarots] = useState([]);

  useEffect(() => {
    setJokers(pickRandomJokers(3));
    setTarots(pickRandomTarots(2));
  }, []);

  const totalCost = 
    selectedJokers.reduce((acc, j) => acc + j.price, 0) + 
    selectedTarots.reduce((acc, t) => acc + t.price, 0);

  const handleBuySelection = () => {
    if (money >= totalCost) {
      selectedJokers.forEach(j => onBuy(j, 'joker'));
      selectedTarots.forEach(t => onBuy(t, 'tarot'));
      
      setJokers(prev => prev.filter(j => !selectedJokers.includes(j)));
      setSelectedJokers([]);
      
      setTarots(prev => prev.filter(t => !selectedTarots.includes(t)));
      setSelectedTarots([]);
    }
  };

  const toggleJokerSelection = (j) => {
    setSelectedJokers(prev => {
      if (prev.includes(j)) return prev.filter(item => item !== j);
      if (prev.length >= 2) return prev; // Limit to max 2 jokers
      return [...prev, j];
    });
  };

  const toggleTarotSelection = (t) => {
    setSelectedTarots(prev => {
      if (prev.includes(t)) return prev.filter(item => item !== t);
      if (prev.length >= 1) return prev; // Limit to max 1 tarot
      return [...prev, t];
    });
  };

  return (
    <div className="shop">
      <h2>Tienda</h2>
      <p className="shop__money">Dinero disponible: ${money}</p>
      
      <div className="shop__items">
        <div className="shop__jokers">
          <h3>Comodines</h3>
          <div className="shop__jokers-list">
            {jokers.map(j => {
              const isSelected = selectedJokers.includes(j);
              return (
                <div 
                  key={j.id} 
                  className={`shop__item ${isSelected ? 'shop__item--selected' : ''}`}
                  onClick={() => toggleJokerSelection(j)}
                  style={{ cursor: 'pointer', border: isSelected ? '2px solid #4caf50' : '2px solid transparent', padding: '0.5rem', borderRadius: '8px' }}
                >
                  <Joker joker={j} />
                  <p>${j.price}</p>
                </div>
              );
            })}
            {jokers.length === 0 && <p>Agotado</p>}
          </div>
        </div>

        <div className="shop__tarots">
          <h3>Tarots</h3>
          <div className="shop__tarots-list" style={{ display: 'flex', gap: '1rem', overflowX: 'auto' }}>
            {tarots.map(t => {
              const isSelected = selectedTarots.includes(t);
              return (
                <div 
                  key={t.id}
                  className={`shop__item shop__item--tarot ${isSelected ? 'shop__item--selected' : ''}`}
                  onClick={() => toggleTarotSelection(t)}
                  style={{ cursor: 'pointer', border: isSelected ? '2px solid #4caf50' : '2px solid transparent', padding: '0.5rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '150px' }}
                >
                  <div className="tarot-card">
                    <h4>{t.name}</h4>
                    <p>{t.description}</p>
                  </div>
                  <p>${t.price}</p>
                </div>
              );
            })}
            {tarots.length === 0 && <p>Agotado</p>}
          </div>
        </div>
      </div>

      <div className="shop__actions">
        <button 
          className="shop__buy-btn" 
          onClick={handleBuySelection} 
          disabled={totalCost === 0 || money < totalCost}
          style={{ background: '#4caf50', padding: '0.8rem 1.5rem', fontSize: '1.1rem', fontWeight: 'bold', color: 'white', border: 'none', borderRadius: '8px', cursor: (totalCost === 0 || money < totalCost) ? 'not-allowed' : 'pointer', opacity: (totalCost === 0 || money < totalCost) ? 0.5 : 1, marginRight: '1rem' }}
        >
          Comprar Selección (${totalCost})
        </button>
        <button 
          className="shop__next-btn" 
          onClick={onNextBlind}
        >
          Continuar ➡
        </button>
      </div>
    </div>
  );
}

export default Shop;

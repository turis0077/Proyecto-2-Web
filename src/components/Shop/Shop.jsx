import { useState, useEffect } from 'react';
import { pickRandomJokers } from '../../data/jokers';
import { pickRandomTarot } from '../../data/tarots';
import Joker from '../Joker/Joker';
import './Shop.css';

function Shop({ money, onBuy, onNextBlind }) {
  const [jokers, setJokers] = useState([]);
  const [tarot, setTarot] = useState(null);
  const [selectedJokers, setSelectedJokers] = useState([]);
  const [selectedTarot, setSelectedTarot] = useState(false);

  useEffect(() => {
    setJokers(pickRandomJokers(2));
    setTarot(pickRandomTarot());
  }, []);

  const totalCost = 
    selectedJokers.reduce((acc, j) => acc + j.price, 0) + 
    (selectedTarot && tarot ? tarot.price : 0);

  const handleBuySelection = () => {
    if (money >= totalCost) {
      selectedJokers.forEach(j => onBuy(j, 'joker'));
      if (selectedTarot && tarot) onBuy(tarot, 'tarot');
      
      setJokers(prev => prev.filter(j => !selectedJokers.includes(j)));
      setSelectedJokers([]);
      
      if (selectedTarot) {
        setTarot(null);
        setSelectedTarot(false);
      }
    }
  };

  const toggleJokerSelection = (j) => {
    setSelectedJokers(prev => 
      prev.includes(j) ? prev.filter(item => item !== j) : [...prev, j]
    );
  };

  const toggleTarotSelection = () => {
    setSelectedTarot(prev => !prev);
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
          {tarot ? (
            <div 
              className={`shop__item shop__item--tarot ${selectedTarot ? 'shop__item--selected' : ''}`}
              onClick={toggleTarotSelection}
              style={{ cursor: 'pointer', border: selectedTarot ? '2px solid #4caf50' : '2px solid transparent', padding: '0.5rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <div className="tarot-card">
                <h4>{tarot.name}</h4>
                <p>{tarot.description}</p>
              </div>
              <p>${tarot.price}</p>
            </div>
          ) : (
            <p>Agotado</p>
          )}
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

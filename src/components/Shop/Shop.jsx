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
  const [infoCardId, setInfoCardId] = useState(null);

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
      if (prev.some(item => item.instanceId === j.instanceId)) return prev.filter(item => item.instanceId !== j.instanceId);
      if (prev.length >= 2) return prev; // Limit to max 2 jokers
      return [...prev, j];
    });
  };

  const toggleTarotSelection = (t) => {
    setSelectedTarots(prev => {
      if (prev.some(item => item.instanceId === t.instanceId)) return prev.filter(item => item.instanceId !== t.instanceId);
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
              const isSelected = selectedJokers.some(sel => sel.instanceId === j.instanceId);
              return (
                <div 
                  key={j.instanceId} 
                  className={`shop__item ${isSelected ? 'shop__item--selected' : ''}`}
                  onClick={() => toggleJokerSelection(j)}
                  style={{ position: 'relative', cursor: 'pointer', border: isSelected ? '2px solid #4caf50' : '2px solid transparent', padding: '0.5rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                >
                  <Joker joker={j} />
                  <p>${j.price}</p>
                  
                  <button 
                    onClick={(e) => { e.stopPropagation(); setInfoCardId(j.instanceId); }}
                    style={{ background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', padding: '2px 6px', fontSize: '0.7rem', marginTop: '4px' }}
                  >
                    Ver info
                  </button>

                  {infoCardId === j.instanceId && (
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(44, 62, 80, 0.95)', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 20, padding: '0.5rem', boxSizing: 'border-box', borderRadius: '8px' }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setInfoCardId(null); }}
                        style={{ position: 'absolute', top: '2px', right: '4px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1rem' }}
                      >✖</button>
                      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: '#f39c12' }}>{j.name}</h4>
                      <p style={{ margin: 0, fontSize: '0.7rem', textAlign: 'center' }}>{j.description}</p>
                    </div>
                  )}
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
              const isSelected = selectedTarots.some(sel => sel.instanceId === t.instanceId);
              return (
                <div 
                  key={t.instanceId}
                  className={`shop__item shop__item--tarot ${isSelected ? 'shop__item--selected' : ''}`}
                  onClick={() => toggleTarotSelection(t)}
                  style={{ position: 'relative', cursor: 'pointer', border: isSelected ? '2px solid #4caf50' : '2px solid transparent', padding: '0.5rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '150px' }}
                >
                  <div className="tarot-card">
                    <h4>{t.name}</h4>
                  </div>
                  <p>${t.price}</p>

                  <button 
                    onClick={(e) => { e.stopPropagation(); setInfoCardId(t.instanceId); }}
                    style={{ background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', padding: '2px 6px', fontSize: '0.7rem', marginTop: '4px' }}
                  >
                    Ver info
                  </button>

                  {infoCardId === t.instanceId && (
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(44, 62, 80, 0.95)', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 20, padding: '0.5rem', boxSizing: 'border-box', borderRadius: '8px' }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setInfoCardId(null); }}
                        style={{ position: 'absolute', top: '2px', right: '4px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1rem' }}
                      >✖</button>
                      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: '#f39c12' }}>{t.name}</h4>
                      <p style={{ margin: 0, fontSize: '0.7rem', textAlign: 'center' }}>{t.description}</p>
                    </div>
                  )}
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

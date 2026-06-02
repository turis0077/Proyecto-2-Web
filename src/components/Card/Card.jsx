import './Card.css';
import { EDITIONS } from '../../data/poker/deck';

function Card({ card, selected = false, onClick, style }) {
  const { rank, suit, edition } = card;

  let bgColor = 'rgba(153, 101, 21, 0.95)'; // Default dark gold/brown
  if (edition === 'foil') bgColor = 'rgba(33, 113, 199, 0.95)';
  if (edition === 'holographic') bgColor = 'rgba(124, 58, 237, 0.95)';
  if (edition === 'polychrome') bgColor = 'rgba(220, 38, 38, 0.95)';

  return (
    <button
      type="button"
      className={`card ${selected ? 'card--selected' : ''}`}
      style={{ color: suit.color, ...style }}
      onClick={onClick}
      aria-pressed={selected}
      data-edition={edition}
    >
      <span className="card__rank-top">{rank.label}</span>
      <span className="card__suit-top">{suit.symbol}</span>
      <span className="card__suit-center">{suit.symbol}</span>
      <span className="card__rank-bottom">{rank.label}</span>
      <span className="card__suit-bottom">{suit.symbol}</span>
      <span className="card__chips-indicator" style={{
        position: 'absolute',
        top: edition ? '-36px' : '-25px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: bgColor,
        color: '#fff',
        padding: '2px 6px',
        borderRadius: '4px',
        fontSize: '10px',
        fontWeight: 'bold',
        pointerEvents: 'none',
        display: selected ? 'flex' : 'none',
        flexDirection: 'column',
        alignItems: 'center',
        whiteSpace: 'nowrap',
        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
        zIndex: 10
      }}>
        <span>+{rank.chips + (card.chipsBonus || 0)}</span>
        {edition && EDITIONS[edition] && <span>{EDITIONS[edition].name}</span>}
      </span>
    </button>
  );
}

export default Card;

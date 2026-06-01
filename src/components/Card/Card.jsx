import './Card.css';

function Card({ card, selected = false, onClick, style }) {
  const { rank, suit } = card;
  return (
    <button
      type="button"
      className={`card ${selected ? 'card--selected' : ''}`}
      style={{ color: suit.color, ...style }}
      onClick={onClick}
      aria-pressed={selected}
      data-edition={card.edition}
    >
      <span className="card__rank-top">{rank.label}</span>
      <span className="card__suit-top">{suit.symbol}</span>
      <span className="card__suit-center">{suit.symbol}</span>
      <span className="card__rank-bottom">{rank.label}</span>
      <span className="card__suit-bottom">{suit.symbol}</span>
      <span className="card__chips-indicator" style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(74, 144, 226, 0.9)', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', pointerEvents: 'none', display: selected ? 'block' : 'none' }}>
        +{rank.chips + (card.chipsBonus || 0)}
      </span>
    </button>
  );
}

export default Card;

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
    </button>
  );
}

export default Card;

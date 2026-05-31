import Card from '../Card/Card';
import './Hand.css';

function Hand({ cards, selectedIds = [], onToggleCard }) {
  return (
    <div className="hand">
      {cards.map((card, i) => (
        <Card
          key={card.id}
          card={card}
          selected={selectedIds.includes(card.id)}
          onClick={() => onToggleCard?.(card.id)}
          style={{ animationDelay: `${i * 60}ms` }}
        />
      ))}
    </div>
  );
}

export default Hand;

import './Joker.css';

function Joker({ joker, onPick, picked = false }) {
  return (
    <button
      type="button"
      className={`joker joker--${joker.rarity} ${picked ? 'joker--picked' : ''}`}
      onClick={onPick}
    >
      <div className="joker__name">{joker.name}</div>
      <div className="joker__desc">{joker.description}</div>
      <div className="joker__rarity">{joker.rarity}</div>
    </button>
  );
}

export default Joker;

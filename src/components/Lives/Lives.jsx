import './Lives.css';

function Lives({ lives, max = 3 }) {
  return (
    <div className="lives" aria-label={`Vidas: ${lives} de ${max}`}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={`life ${i < lives ? 'life--active' : ''}`}>
          ♥
        </span>
      ))}
    </div>
  );
}

export default Lives;

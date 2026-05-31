import './GameOver.css';

function GameOver({ round, score, onRestart }) {
  return (
    <div className="gameover">
      <h2>Game Over</h2>
      <p>Llegaste a la ronda {round} con {score} puntos.</p>
      <button type="button" onClick={onRestart}>Volver a jugar</button>
    </div>
  );
}

export default GameOver;

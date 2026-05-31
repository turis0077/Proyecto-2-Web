import { useCountUp } from '../../hooks/useCountUp';
import './ScoreBoard.css';

function ScoreBoard({ round, score, target, chips, mult }) {
  const animatedScore = useCountUp(score);
  return (
    <div className="scoreboard">
      <div className="scoreboard__round">Ronda {round}</div>
      <div className="scoreboard__target">
        <span>Objetivo</span>
        <strong>{target}</strong>
      </div>
      <div className="scoreboard__current">
        <span>Tu puntaje</span>
        <strong>{animatedScore}</strong>
      </div>
      <div className="scoreboard__formula">
        <span className="chips">{chips}</span>
        <span className="x">×</span>
        <span className="mult">{mult}</span>
      </div>
    </div>
  );
}

export default ScoreBoard;

import { useState, useEffect } from 'react';
import { pickRandomJokers } from '../../utils/jokers/jokerUtils';
import Joker from '../Joker/Joker';
import './JokerSelection.css';

function JokerSelection({ onPick }) {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    // Se sortean 3 internamente pero solo se muestran 2 al jugador (regla del proyecto)
    const three = pickRandomJokers(3);
    setOptions(three.slice(0, 2));
  }, []);

  return (
    <div className="joker-selection">
      <h2>Elegí un comodín</h2>
      <div className="joker-selection__options">
        {options.map(j => (
          <Joker key={j.id} joker={j} onPick={() => onPick(j)} />
        ))}
      </div>
    </div>
  );
}

export default JokerSelection;

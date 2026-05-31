import { useState, useEffect } from 'react';
import { useGameState } from './hooks/useGameState';
import Hand from './components/Hand/Hand';
import Menu from './components/Menu/Menu';
import Lives from './components/Lives/Lives';
import ScoreBoard from './components/ScoreBoard/ScoreBoard';
import GameOver from './components/GameOver/GameOver';
import JokerSelection from './components/JokerSelection/JokerSelection';
import { audio } from './utils/audioManager';
import './styles/global.css';

const MAX_SELECTION = 5;

function App() {
  const [showMenu, setShowMenu] = useState(true);
  const [difficulty, setDifficulty] = useState('normal');
  const [activeJokers, setActiveJokers] = useState([]);

  const {
    hand,
    round,
    score,
    target,
    phase,
    lives,
    discardsLeft,
    lastPlay,
    playHand,
    discard,
    skipRound,
    nextRound,
    resetGame,
  } = useGameState(difficulty);

  const [selectedIds, setSelectedIds] = useState([]);

  // Control de música dinámica según la fase y puntuación
  useEffect(() => {
    if (showMenu) {
      audio.play('menu');
    } else if (phase === 'GAME_OVER') {
      audio.play('gameover');
    } else if (score / target > 0.7) {
      audio.play('tense');
    } else {
      audio.play('gameplay');
    }
  }, [showMenu, phase, score, target]);

  const toggleCard = (cardId) => {
    setSelectedIds(prev => {
      if (prev.includes(cardId)) return prev.filter(id => id !== cardId);
      if (prev.length >= MAX_SELECTION) return prev;
      return [...prev, cardId];
    });
  };

  const handleStartGame = (selectedDiff) => {
    setDifficulty(selectedDiff);
    setActiveJokers([]);
    setShowMenu(false);
  };

  const handlePlayHand = () => {
    playHand(selectedIds, activeJokers);
    setSelectedIds([]);
  };

  const handleDiscard = () => {
    discard(selectedIds);
    setSelectedIds([]);
  };

  const handlePickJoker = (joker) => {
    setActiveJokers(prev => [...prev, joker]);
    nextRound();
  };

  const handleRestart = () => {
    setActiveJokers([]);
    resetGame();
    setShowMenu(true);
  };

  if (showMenu) {
    return <Menu onStart={handleStartGame} />;
  }

  if (phase === 'GAME_OVER') {
    return <GameOver round={round} score={score} onRestart={handleRestart} />;
  }

  return (
    <div className="app">
      <header className="game-header">
        <span className="game-header__brand">Not-Balatro 🎰</span>
        <Lives lives={lives} max={difficulty === 'easy' ? 5 : difficulty === 'hard' ? 2 : 3} />
        <button
          type="button"
          className="game-header__restart"
          onClick={() => {
            if (window.confirm('¿Reiniciar la partida y volver al menú?')) {
              handleRestart();
            }
          }}
        >
          ↻ Reiniciar
        </button>
      </header>

      <main className="game-main">
        <ScoreBoard
          round={round}
          score={score}
          target={target}
          chips={lastPlay?.chips || 0}
          mult={lastPlay?.mult || 0}
        />

        {phase === 'WON_ROUND' ? (
          <JokerSelection onPick={handlePickJoker} />
        ) : (
          <>
            {lastPlay && (
              <div className="last-play-feedback">
                ¡Jugaste <strong>{lastPlay.handType}</strong> y ganaste <strong>{lastPlay.gained}</strong> puntos!
              </div>
            )}

            {activeJokers.length > 0 && (
              <div className="active-jokers-list">
                <h3>Comodines Activos:</h3>
                <div className="active-jokers-row">
                  {activeJokers.map((j, idx) => (
                    <div key={`${j.id}-${idx}`} className={`active-joker-tag active-joker-tag--${j.rarity}`}>
                      <strong>{j.name}</strong> ({j.description})
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="selection-count">Seleccionadas: {selectedIds.length} / {MAX_SELECTION}</p>

            <Hand cards={hand} selectedIds={selectedIds} onToggleCard={toggleCard} />

            <div className="actions">
              <button
                type="button"
                onClick={handlePlayHand}
                disabled={!selectedIds.length}
              >
                Jugar mano
              </button>
              <button
                type="button"
                onClick={handleDiscard}
                disabled={!selectedIds.length || discardsLeft === 0}
              >
                Descartar ({discardsLeft})
              </button>
              <button
                type="button"
                onClick={skipRound}
              >
                Skip ronda (-1 Vida)
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;

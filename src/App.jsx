import { useState, useEffect } from 'react';
import { useGameState } from './hooks/useGameState';
import Hand from './components/Hand/Hand';
import Menu from './components/Menu/Menu';
import Lives from './components/Lives/Lives';
import ScoreBoard from './components/ScoreBoard/ScoreBoard';
import GameOver from './components/GameOver/GameOver';
import Shop from './components/Shop/Shop';
import Inventory from './components/Inventory/Inventory';
import RoundResult from './components/RoundResult/RoundResult';
import { DIFFICULTIES } from './data/difficulties';
import { audio } from './utils/audioManager';
import { evaluateHand } from './utils/handEvaluator';
import { calculateScore } from './utils/scoreCalculator';
import './styles/global.css';

const MAX_SELECTION = 5;

const BLIND_NAMES = ['Ciega Pequeña', 'Ciega Grande', 'La Casa'];

function App() {
  const [showMenu, setShowMenu] = useState(true);
  const [difficulty, setDifficulty] = useState('normal');

  const {
    hand,
    deck,
    blindIndex,
    subRound,
    money,
    inventory,
    activeJokers,
    score,
    target,
    phase,
    lives,
    discardsLeft,
    lastPlayResult,
    tempChipsBonus,
    playHand,
    discard,
    skipBlind,
    nextBlind,
    continueToShop,
    buyItem,
    toggleActiveJoker,
    useTarot,
    resetGame,
  } = useGameState(difficulty);

  const [selectedIds, setSelectedIds] = useState([]);

  // Calculate projected score
  const projectedHand = hand.filter(c => selectedIds.includes(c.id));
  let projectedScore = 0;
  let projectedHandType = '';
  if (projectedHand.length > 0) {
    const handType = evaluateHand(projectedHand);
    let { chips, mult } = calculateScore(handType, projectedHand, activeJokers);
    if (tempChipsBonus) {
      chips += tempChipsBonus;
    }
    projectedScore = Math.round(chips * mult);
    projectedHandType = handType;
  }

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
    setShowMenu(false);
  };

  const handlePlayHand = () => {
    if (selectedIds.length > 0 && selectedIds.length <= MAX_SELECTION) {
      playHand(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleDiscard = () => {
    if (selectedIds.length > 0 && selectedIds.length <= MAX_SELECTION) {
      discard(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleRestart = () => {
    resetGame();
    setShowMenu(true);
  };

  if (showMenu) {
    return <Menu onStart={handleStartGame} />;
  }

  if (phase === 'GAME_OVER') {
    return <GameOver round={`${BLIND_NAMES[blindIndex]} (Ronda ${subRound}/5)`} score={score} onRestart={handleRestart} />;
  }

  if (phase === 'GAME_WON') {
    return (
      <div className="game-over">
        <h2>¡Felicidades! Has vencido a La Casa.</h2>
        <p>Has completado todas las ciegas.</p>
        <button onClick={handleRestart}>Volver al menú</button>
      </div>
    );
  }

  const maxLives = DIFFICULTIES[difficulty].lives;

  return (
    <div className="app">
      <header className="game-header">
        <span className="game-header__brand">Not-Balatro 🎰</span>
        <div className="game-header__info" style={{ marginLeft: '1rem', flex: 1, display: 'flex', gap: '1rem' }}>
          <span style={{ color: '#ffd700', fontWeight: 'bold' }}>Dinero: ${money}</span>
          <span>{BLIND_NAMES[blindIndex]} - Ronda {subRound}/5</span>
        </div>
        <Lives lives={lives} max={maxLives} />
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
        {phase === 'ROUND_RESULT' ? (
          <RoundResult result={lastPlayResult} onContinue={continueToShop} />
        ) : phase === 'WON_ROUND' ? (
          <Shop money={money} onBuy={buyItem} onNextBlind={nextBlind} />
        ) : (
          <>
            <ScoreBoard
              round={`${BLIND_NAMES[blindIndex]} - Ronda ${subRound}/5`}
              score={score}
              target={target}
            />

            {projectedHand.length > 0 && (
              <div className="projected-score" style={{ textAlign: 'center', margin: '1rem', padding: '1rem', background: 'rgba(76, 175, 80, 0.1)', border: '1px solid #4caf50', borderRadius: '8px', color: '#4caf50' }}>
                <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Proyección: <strong>{projectedHandType}</strong></div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{projectedScore} pts</div>
              </div>
            )}

            <div className="game-info-bar" style={{ display: 'flex', justifyContent: 'center', gap: '2rem', margin: '1rem 0', fontWeight: 'bold', fontSize: '1.1rem' }}>
              <span>Descartes: {discardsLeft}</span>
            </div>

            <p className="selection-count">Cartas seleccionadas: {selectedIds.length} / {MAX_SELECTION} (Restantes: {MAX_SELECTION - selectedIds.length})</p>

            <Hand cards={hand} selectedIds={selectedIds} onToggleCard={toggleCard} />

            <div className="actions">
              <button
                type="button"
                onClick={handlePlayHand}
                disabled={!selectedIds.length}
                style={{ background: '#4a90e2' }}
              >
                Jugar Mano
              </button>
              <button
                type="button"
                onClick={handleDiscard}
                disabled={!selectedIds.length || discardsLeft === 0 || selectedIds.length > deck.length}
              >
                Saltar Ronda
              </button>
              <button
                type="button"
                onClick={skipBlind}
                style={{ background: '#e74c3c' }}
              >
                Saltar Ciega (-1 Vida)
              </button>
            </div>

            <Inventory
              inventory={inventory}
              activeJokers={activeJokers}
              onToggleJoker={toggleActiveJoker}
              onUseTarot={useTarot}
              selectedCardsIds={selectedIds}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default App;

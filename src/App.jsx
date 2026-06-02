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
import { evaluateHand } from './utils/hand/handIdentificator';
import { calculateScore } from './utils/score/scoreCalculator';
import { EDITIONS } from './data/deck';
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
    changesLeft,
    consecutiveSkips,
    consecutiveLosses,
    lastPlayResult,
    tempChipsBonus,
    playHand,
    skipRound,
    skipBlind,
    nextBlind,
    continueToShop,
    buyItem,
    replaceFullHand,
    performCardSwaps,
    toggleActiveJoker,
    useTarot,
    startBlind,
    resetGame,
  } = useGameState(difficulty);

  const [selectedIds, setSelectedIds] = useState([]);

  // Change Menu State
  const [showChangeMenu, setShowChangeMenu] = useState(false);
  const [showDeckOptions, setShowDeckOptions] = useState(false);
  const [changeMode, setChangeMode] = useState(null); // 'SPECIFIC'
  const [swapHandCard, setSwapHandCard] = useState(null);
  const [swapMysteryCard, setSwapMysteryCard] = useState(null);

  // Reset selection on phase/round change or when entering/exiting change menu
  useEffect(() => {
    setSelectedIds([]);
  }, [phase, subRound, blindIndex, showChangeMenu]);

  // Calculate projected score
  const projectedHand = hand.filter(c => selectedIds.includes(c.id));
  let projectedScore = 0;
  let projectedHandType = '';
  let projectedChips = 0;
  let projectedMult = 0;
  let projectedEditions = [];
  
  if (projectedHand.length > 0 && !showChangeMenu) {
    const handType = evaluateHand(projectedHand);
    let { chips, mult } = calculateScore(handType, projectedHand, activeJokers);
    
    if (tempChipsBonus) {
      chips += tempChipsBonus;
    }
    projectedChips = chips;
    projectedMult = mult;
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
    if (showChangeMenu) {
      if (changeMode === 'SPECIFIC') {
        setSwapHandCard(prev => prev === cardId ? null : cardId);
      }
      return;
    }

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



  const handleRestart = () => {
    resetGame();
    setShowMenu(true);
    setShowChangeMenu(false);
    setChangeMode(null);
    setShowDeckOptions(false);
  };

  const handleConfirmSwap = () => {
    if (swapHandCard && swapMysteryCard !== null) {
      performCardSwaps([swapHandCard]);
      setSwapHandCard(null);
      setSwapMysteryCard(null);
      if (changesLeft <= 1) {
        // Just used the last change
        setShowChangeMenu(false);
        setChangeMode(null);
      }
    }
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
          style={{ marginLeft: '2rem' }}
        >
          ↻ Reiniciar
        </button>
      </header>

      <main className="game-main">
        {phase === 'BLIND_INTRO' ? (
          <div className="blind-intro" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '2rem', paddingTop: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', color: '#ffd700', margin: 0 }}>{BLIND_NAMES[blindIndex]}</h2>
            <p style={{ fontSize: '1.5rem', margin: 0 }}>Ronda {subRound}/5</p>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '2rem', borderRadius: '12px', textAlign: 'center' }}>
              <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Objetivo de la Ronda:</p>
              <p style={{ fontSize: '3rem', fontWeight: 'bold', color: '#4caf50', margin: 0 }}>{target} pts</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button onClick={startBlind} style={{ background: '#4a90e2', padding: '1rem 2rem', fontSize: '1.2rem' }}>Jugar Ciega</button>
              {blindIndex < 2 && (
                <button onClick={skipBlind} style={{ background: '#e74c3c', padding: '1rem 2rem', fontSize: '1.2rem' }}>
                  Saltar Ciega (-{blindIndex === 0 ? 1 : 2} {blindIndex === 0 ? 'Vida' : 'Vidas'})
                </button>
              )}
            </div>
          </div>
        ) : phase === 'ROUND_RESULT' ? (
          <RoundResult result={lastPlayResult} onContinue={continueToShop} />
        ) : phase === 'WON_ROUND' ? (
          <Shop money={money} onBuy={buyItem} onNextBlind={nextBlind} />
        ) : (
          <>
            <ScoreBoard
              round={`${BLIND_NAMES[blindIndex]} - Ronda ${subRound}/5`}
              score={score}
              target={target}
              chips={projectedChips}
              mult={projectedMult}
            />

            {projectedHand.length > 0 && !showChangeMenu && (
              <div className="projected-score" style={{ textAlign: 'center', margin: '1rem', padding: '1rem', background: 'rgba(76, 175, 80, 0.1)', border: '1px solid #4caf50', borderRadius: '8px', color: '#4caf50' }}>
                <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                  Proyección: <strong>{projectedHandType}</strong>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{projectedScore} pts</div>
              </div>
            )}

            <div className="game-info-bar" style={{ display: 'flex', justifyContent: 'center', gap: '2rem', margin: '1rem 0', fontWeight: 'bold', fontSize: '1.1rem' }}>
              <span>Derrotas Seguidas: {consecutiveLosses} / 3</span>
              <span>Saltos Seguidos: {consecutiveSkips} / 2</span>
            </div>

            {/* Change Menu UI */}
            {showChangeMenu && (
              <div className="change-menu-overlay" style={{ background: 'rgba(0,0,0,0.5)', padding: '2rem', borderRadius: '12px', border: '2px solid #a855f7', marginBottom: '2rem', position: 'relative' }}>
                <button 
                  onClick={() => { setShowChangeMenu(false); setChangeMode(null); setShowDeckOptions(false); setSwapHandCard(null); setSwapMysteryCard(null); }} 
                  style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}
                >
                  ✖
                </button>
                <h3 style={{ textAlign: 'center', color: '#a855f7', marginTop: 0 }}>Menú de Cambios (Restantes: {changesLeft})</h3>
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', minHeight: '150px', alignItems: 'center' }}>
                  
                  {/* The visual deck */}
                  {!changeMode && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div 
                        className="visual-deck" 
                        onClick={() => setShowDeckOptions(true)}
                        style={{ width: '80px', height: '120px', background: 'linear-gradient(135deg, #2c3e50, #3498db)', borderRadius: '8px', border: '2px solid #fff', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontSize: '2rem' }}
                      >
                        ?
                      </div>
                      
                      {showDeckOptions && (
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                          <button onClick={() => { replaceFullHand(); setShowChangeMenu(false); setShowDeckOptions(false); }} style={{ background: '#e67e22' }}>
                            Cambiar Mano
                          </button>
                          <button onClick={() => { setChangeMode('SPECIFIC'); setShowDeckOptions(false); }} style={{ background: '#9b59b6' }}>
                            Cambiar Cartas
                          </button>
                          <button onClick={() => { setShowChangeMenu(false); setShowDeckOptions(false); }} style={{ background: '#7f8c8d' }}>
                            Regresar
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Specific cards mode */}
                  {changeMode === 'SPECIFIC' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                      <p style={{ color: '#fff', marginBottom: '1rem' }}>Selecciona 1 carta misteriosa y 1 de tu mano, luego confirma.</p>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        {[0, 1, 2, 3, 4].map(idx => (
                          <div 
                            key={idx}
                            onClick={() => setSwapMysteryCard(idx)}
                            style={{ 
                              width: '60px', height: '90px', 
                              background: 'linear-gradient(135deg, #2c3e50, #3498db)', 
                              borderRadius: '6px', border: swapMysteryCard === idx ? '3px solid #4caf50' : '2px solid #fff', 
                              cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff' 
                            }}
                          >
                            ?
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <button 
                          onClick={handleConfirmSwap} 
                          disabled={swapHandCard === null || swapMysteryCard === null}
                          style={{ marginTop: '1.5rem', background: '#4caf50', opacity: (swapHandCard === null || swapMysteryCard === null) ? 0.5 : 1 }}
                        >
                          Decisión tomada
                        </button>
                        <button 
                          onClick={() => { setChangeMode(null); setSwapHandCard(null); setSwapMysteryCard(null); }}
                          style={{ marginTop: '1.5rem', background: '#7f8c8d' }}
                        >
                          Regresar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!showChangeMenu && (
              <p className="selection-count">Cartas seleccionadas: {selectedIds.length} / {MAX_SELECTION} (Restantes: {MAX_SELECTION - selectedIds.length})</p>
            )}

            {/* In Change Mode, pass a different selected array to highlight the swap card */}
            <Hand 
              cards={hand} 
              selectedIds={showChangeMenu ? (swapHandCard ? [swapHandCard] : []) : selectedIds} 
              onToggleCard={toggleCard} 
            />

            {!showChangeMenu && (
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
                  onClick={() => {
                    if (changesLeft > 0) setShowChangeMenu(true);
                  }}
                  disabled={changesLeft <= 0}
                  style={{ background: '#9b59b6', opacity: changesLeft <= 0 ? 0.5 : 1 }}
                >
                  Cambiar ({changesLeft})
                </button>
                <button
                  type="button"
                  onClick={skipRound}
                  disabled={consecutiveSkips >= 2}
                  style={{ opacity: consecutiveSkips >= 2 ? 0.5 : 1 }}
                >
                  Saltar Ronda
                </button>
              </div>
            )}
            
            <Inventory
              inventory={inventory}
              activeJokers={activeJokers}
              onToggleJoker={toggleActiveJoker}
              onUseTarot={(tarotId, selectedCardsIds) => {
                useTarot(tarotId, selectedCardsIds);
                setSelectedIds([]);
              }}
              selectedCardsIds={selectedIds}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default App;

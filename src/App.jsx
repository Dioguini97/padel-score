import { useState } from 'react';
import SetupScreen from './screens/SetupScreen';
import GameScreen from './screens/GameScreen';
import { createInitialState } from './logic/scoring';

export default function App() {
  const [gameState, setGameState] = useState(null);

  function handleStart(setup) {
    setGameState(createInitialState(setup));
  }

  function handleNewGame() {
    setGameState(null);
  }

  if (!gameState) {
    return <SetupScreen onStart={handleStart} />;
  }

  return <GameScreen initialState={gameState} onNewGame={handleNewGame} />;
}

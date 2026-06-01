import { useState } from 'react';
import SetupScreen from './screens/SetupScreen';
import GameScreen from './screens/GameScreen';
import HistoryScreen from "./screens/HistoryScreen";
import RankingScreen from "./screens/RankingScreen";
import { createInitialState } from './logic/scoring';

export default function App() {
  const [gameState, setGameState] = useState(null);
  const [screen, setScreen] = useState("setup");

  function handleStart(setup) {
    setGameState(createInitialState(setup));
    setScreen('game');
  }

  function handleNewGame() {
    setGameState(null);
    setScreen('setup');
  }

  if (screen === "history") return <HistoryScreen onBack={() => setScreen("setup")} onShowSetup={() => setScreen("setup")} />;
  if (screen === "ranking") return <RankingScreen onBack={() => setScreen("setup")} onShowSetup={() => setScreen("setup")} />;
  if (screen === "game" && gameState) return <GameScreen initialState={gameState} onNewGame={handleNewGame} />;
  return <SetupScreen onStart={handleStart} onShowHistory={() => setScreen("history")} onShowRanking={() => setScreen("ranking")} />;
}

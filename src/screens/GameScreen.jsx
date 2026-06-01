import { useState, useEffect, useCallback, useRef } from "react";
import {
  addPoint,
  undoLastPoint,
  endGamesOnly,
  getPointsDisplay,
  getAnnouncement,
  getPlayers,
  getCurrentServerName,
  isTeamAServing,
  isTeamBServing,
} from "../logic/scoring";
import { useSpeech } from "../hooks/useSpeech";
import { useKeyboard } from "../hooks/useKeyboard";
import { saveMatch } from "../services/matchStorage";

export default function GameScreen({ initialState, onNewGame }) {
  const [state, setState] = useState(initialState);
  const { speak, voiceEnabled, setVoiceEnabled } = useSpeech();
  const [showSettings, setShowSettings] = useState(false);
  const [tapKey, setTapKey] = useState(" ");
  const prevEvent = useRef(null);

  const pt = state.language === "pt";
  const players = [
    state.teamA[0],
    state.teamB[0],
    state.teamA[1],
    state.teamB[1],
  ];

  // Announce voice on every new event
  useEffect(() => {
    if (!state.lastEvent || state.lastEvent === prevEvent.current) return;
    prevEvent.current = state.lastEvent;
    const text = getAnnouncement(
      state.lastEvent,
      getPlayers(state),
      state.language,
    );
    if (text) speak(text, state.language);
  }, [state.lastEvent, players, state.language, speak]);

  // Announce who serves on mount
  useEffect(() => {
    const srv = getCurrentServerName(state);
    const text = pt
      ? `Jogo de serviço de ${srv}. Pronto!`
      : `${srv} to serve. Ready!`;
    const timer = setTimeout(() => speak(text, state.language), 600);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (state.phase === "finished") {
      saveMatch(state);
    }
  }, [state.phase]);

  const doAddPoint = useCallback((team) => {
    setState((s) => addPoint(s, team));
  }, []);

  const doUndo = useCallback(() => {
    setState((s) => undoLastPoint(s));
  }, []);

  const doEnd = useCallback(() => {
    setState((s) => endGamesOnly(s));
  }, []);

  useKeyboard({
    onTeamA: () => doAddPoint(0),
    onTeamB: () => doAddPoint(1),
    onUndo: doUndo,
    tapKey,
  });

  // Points display (tiebreak shows raw count)
  const [dA, dB] = state.isTiebreak
    ? [String(state.tiebreakPoints[0]), String(state.tiebreakPoints[1])]
    : getPointsDisplay(state.points[0], state.points[1]);

  const isFinished = state.phase === "finished";
  const hasUndo = state.history.length > 0;

  // ─── Finished screen ────────────────────────────────────────────────────────
  if (isFinished) {
    return (
      <div className="fixed inset-0 bg-gray-950 text-white flex flex-col items-center justify-center p-8 text-center">
        <div className="text-7xl mb-6">🏆</div>
        <h2 className="text-4xl font-black text-yellow-400 mb-3">
          {state.names[state.winner]}
        </h2>
        <p className="text-gray-400 text-lg mb-2">
          {pt ? "vence o jogo!" : "wins the match!"}
        </p>

        {/* Set history */}
        {state.completedSets.length > 0 && (
          <div className="flex gap-4 my-4">
            {state.completedSets.map(([a, b], i) => (
              <div key={i} className="text-2xl font-bold">
                <span
                  className={
                    state.winner === 0 ? "text-white" : "text-gray-500"
                  }
                >
                  {a}
                </span>
                <span className="text-gray-600 mx-1">–</span>
                <span
                  className={
                    state.winner === 1 ? "text-white" : "text-gray-500"
                  }
                >
                  {b}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Games only result */}
        {state.format === "games_only" && (
          <div className="text-2xl font-bold my-4">
            {state.names[0]}: {state.games[0]} — {state.names[1]}:{" "}
            {state.games[1]}
          </div>
        )}

        <div className="flex gap-3 mt-8">
          <button
            onClick={doUndo}
            disabled={!hasUndo}
            className={`py-3 px-6 rounded-2xl font-bold text-lg border transition ${
              hasUndo
                ? "border-gray-600 text-gray-300 active:bg-gray-800"
                : "border-gray-800 text-gray-700 cursor-not-allowed"
            }`}
          >
            ↩ {pt ? "Desfazer" : "Undo"}
          </button>
          <button
            onClick={onNewGame}
            className="bg-yellow-400 text-gray-950 font-black py-3 px-6 rounded-2xl text-lg active:bg-yellow-300"
          >
            {pt ? "Novo Jogo" : "New Game"}
          </button>
        </div>
      </div>
    );
  }

  // ─── Settings panel ─────────────────────────────────────────────────────────
  if (showSettings) {
    return (
      <div className="fixed inset-0 bg-gray-950 text-white flex flex-col p-6">
        <button
          onClick={() => setShowSettings(false)}
          className="text-gray-400 text-left mb-6 text-sm"
        >
          ← {pt ? "Voltar" : "Back"}
        </button>
        <h2 className="text-xl font-bold mb-6">
          {pt ? "⚙️ Configurações" : "⚙️ Settings"}
        </h2>

        <div className="mb-6">
          <p className="text-sm text-gray-400 mb-3">
            {pt
              ? "Tecla do botão Bluetooth (pressiona a tecla após clicar no campo)"
              : "Bluetooth button key (press the key after clicking the field)"}
          </p>
          <input
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-center text-xl font-mono"
            value={tapKey === " " ? "Space" : tapKey}
            readOnly
            onKeyDown={(e) => {
              e.preventDefault();
              setTapKey(e.key);
            }}
          />
          <p className="text-xs text-gray-600 mt-2 text-center">
            {pt
              ? `Tecla actual: "${tapKey === " " ? "Space" : tapKey}"`
              : `Current key: "${tapKey === " " ? "Space" : tapKey}"`}
          </p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-4 text-sm text-gray-400 space-y-2">
          <p className="font-semibold text-gray-300 mb-2">
            {pt
              ? "Como usar o botão Bluetooth:"
              : "How to use the Bluetooth button:"}
          </p>
          <p>
            1× {pt ? "toque" : "tap"} →{" "}
            {`${state.teamA[0]} / ${state.teamA[1]}`}
          </p>
          <p>
            2× {pt ? "toque" : "taps"} →{" "}
            {`${state.teamB[0]} / ${state.teamB[1]}`}
          </p>
          <p>
            {pt ? "Segurar 2s" : "Hold 2s"} → {pt ? "Desfazer" : "Undo"}
          </p>
        </div>

        <div className="mt-6 bg-gray-900 rounded-2xl p-4 text-sm text-gray-400">
          <p className="font-semibold text-gray-300 mb-2">
            {pt ? "Botões compatíveis:" : "Compatible buttons:"}
          </p>
          <p>
            •{" "}
            {pt
              ? "Botões de selfie (ligam como teclado)"
              : "Selfie buttons (pair as keyboard)"}
          </p>
          <p>• {pt ? "Apresentadores/clickers" : "Presentation clickers"}</p>
          <p>
            • {pt ? "Qualquer teclado Bluetooth" : "Any Bluetooth keyboard"}
          </p>
        </div>
      </div>
    );
  }

  // ─── Main game screen ────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-gray-950 text-white flex flex-col select-none">
      {/* Top bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-900 border-b border-gray-800 shrink-0">
        {/* Voice toggle */}
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          className="text-xl w-9 h-9 flex items-center justify-center"
        >
          {voiceEnabled ? "🔊" : "🔇"}
        </button>

        {/* Sets + completed set scores */}
        <div className="flex items-center gap-2">
          {state.completedSets.map(([a, b], i) => (
            <span key={i} className="text-xs text-gray-500 font-mono">
              {a}-{b}
            </span>
          ))}
          {state.format !== "games_only" && (
            <span className="text-base font-bold font-mono text-white">
              {state.sets[0]} – {state.sets[1]}
            </span>
          )}
        </div>

        {/* Right buttons */}
        <div className="flex items-center gap-1">
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => setShowSettings(true)}
            className="text-lg w-9 h-9 flex items-center justify-center text-gray-500"
          >
            ⚙️
          </button>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={doUndo}
            disabled={!hasUndo}
            className={`text-xl w-9 h-9 flex items-center justify-center transition ${
              hasUndo ? "text-white" : "text-gray-800"
            }`}
          >
            ↩
          </button>
        </div>
      </div>

      {/* Games row */}
      <div className="flex items-center justify-center gap-3 py-2 bg-gray-900 border-b border-gray-800 shrink-0">
        <span className="text-2xl font-black font-mono">{state.games[0]}</span>
        <span className="text-gray-600">–</span>
        <span className="text-2xl font-black font-mono">{state.games[1]}</span>
        {state.isTiebreak && (
          <span className="text-xs font-bold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full ml-1">
            TB
          </span>
        )}
      </div>

      {/* Main touch area */}
      <div className="flex flex-1 min-h-0">
        {/* Team A — left half */}
        <TouchPanel
          name={`${state.teamA[0]} & ${state.teamA[1]}`}
          score={dA}
          isServer={isTeamAServing(state)}
          side="left"
          onPoint={() => doAddPoint(0)}
          pt={pt}
        />

        {/* Divider */}
        <div className="w-px bg-gray-800 shrink-0" />

        {/* Team B — right half */}
        <TouchPanel
          name={`${state.teamB[0]} & ${state.teamB[1]}`}
          score={dB}
          isServer={isTeamBServing(state)}
          side="right"
          onPoint={() => doAddPoint(1)}
          pt={pt}
        />
      </div>

      {/* Games Only end button */}
      {state.format === "games_only" && (
        <div className="shrink-0 px-4 pb-3 pt-2 bg-gray-950">
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={doEnd}
            className="w-full py-2 rounded-xl bg-gray-800 text-gray-400 text-sm font-medium active:bg-gray-700"
          >
            {pt ? "Terminar Jogo" : "End Game"}
          </button>
        </div>
      )}

      {/* Bluetooth hint */}
      <div className="shrink-0 pb-safe text-center py-1 text-xs text-gray-800 bg-gray-950">
        {pt
          ? `Bluetooth: 1× → ${state.teamA[0]} / ${state.teamA[1]}  ·  2× → ${state.teamB[0]} / ${state.teamB[1]}  ·  2s → desfazer`
          : `Bluetooth: 1× → ${state.teamA[0]} / ${state.teamA[1]}  ·  2× → ${state.teamB[0]} / ${state.teamB[1]}  ·  2s → undo`}
      </div>
    </div>
  );
}

// ─── Touch panel component ────────────────────────────────────────────────────

function TouchPanel({ name, score, isServer, side, onPoint, pt }) {
  const isAdv = score === "ADV";

  // Detect tap vs accidental scroll
  const pointerStart = useRef(null);

  function handlePointerDown(e) {
    pointerStart.current = { x: e.clientX, y: e.clientY };
  }

  function handlePointerUp(e) {
    if (!pointerStart.current) return;
    const dx = Math.abs(e.clientX - pointerStart.current.x);
    const dy = Math.abs(e.clientY - pointerStart.current.y);
    pointerStart.current = null;
    if (dx > 10 || dy > 10) return; // ignore swipes
    onPoint();
  }

  return (
    <div
      className={`flex-1 flex flex-col items-center justify-center cursor-pointer
        ${side === "left" ? "active:bg-blue-950" : "active:bg-red-950"} transition-colors`}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      {/* Server indicator */}
      <div className="flex items-center gap-2 mb-3">
        {isServer && side === "left" && (
          <span className="text-yellow-400 text-lg">🎾</span>
        )}
        <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider truncate max-w-[120px]">
          {name}
        </span>
        {isServer && side === "right" && (
          <span className="text-yellow-400 text-lg">🎾</span>
        )}
      </div>

      {/* Score */}
      <div
        className={`font-mono font-black leading-none transition-all ${
          isAdv ? "text-5xl text-green-400" : "text-8xl text-white"
        }`}
      >
        {score}
      </div>

      <div className="mt-6 text-xs text-gray-800">
        {pt ? "toque para ponto" : "tap for point"}
      </div>
    </div>
  );
}

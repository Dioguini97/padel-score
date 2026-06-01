import { useState } from "react";

const FORMATS = [
  { value: "best_of_3", label: "Melhor de 3 sets", labelEn: "Best of 3 sets" },
  { value: "one_set", label: "1 Set", labelEn: "1 Set" },
  { value: "games_only", label: "Só jogos", labelEn: "Games only" },
];

export default function SetupScreen({ onStart, onShowHistory, onShowRanking }) {
  const [nameA1, setNameA1] = useState("");
  const [nameB1, setNameB1] = useState("");
  const [nameA2, setNameA2] = useState("");
  const [nameB2, setNameB2] = useState("");
  const [format, setFormat] = useState("best_of_3");
  const [language, setLanguage] = useState("pt");
  const [server, setFirstServer] = useState(null);

  function randomServer() {
    setFirstServer(Math.floor(Math.random() * 4));
  }

  function handleStart() {
    if (server === null) return;
    onStart({
      teamA: [nameA1.trim() || "A1", nameA2.trim() || "A2"],
      teamB: [nameB1.trim() || "B1", nameB2.trim() || "B2"],
      server: server,
      format,
      language,
    });
  }

  const players = [
    nameA1 || "A1",
    nameB1 || "B1",
    nameA2 || "A2",
    nameB2 || "B2",
  ];

  const pt = language === "pt";

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-5">
      <div className="w-full max-w-sm">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-yellow-400">
            🎾 Padel Score
          </h1>
          <div className="grid grid-cols-2 gap-2 items-center mb-4 mt-4">
            <button className="py-2 rounded-xl text-xs bg-gray-800 text-gray-300 border border-gray-700" onClick={onShowHistory}>📜 Histórico</button>
            <button className="py-2 rounded-xl text-xs bg-gray-800 text-gray-300 border border-gray-700" onClick={onShowRanking}>🏆 Ranking</button>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            {pt ? "Marcador de jogo" : "Game scoreboard"}
          </p>
        </div>
        <div className="space-y-5">
          {/* Language toggle */}
          <div className="flex rounded-xl overflow-hidden border border-gray-800">
            {["pt", "en"].map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`flex-1 py-2 text-sm font-medium transition ${
                  language === lang
                    ? "bg-yellow-400 text-gray-950"
                    : "bg-gray-900 text-gray-400"
                }`}
              >
                {lang === "pt" ? "🇵🇹 Português" : "🇬🇧 English"}
              </button>
            ))}
          </div>

          {/* Names */}
          <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">
              {pt ? "Nome — Equipa A (esquerda)" : "Name — Team A (left)"}
            </label>
            <input
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white text-base outline-none focus:border-blue-500"
              placeholder={pt ? "Ex: Diogo" : "E.g. John"}
              value={nameA1}
              onChange={(e) => setNameA1(e.target.value)}
            />
            <input
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white text-base outline-none focus:border-blue-500"
              placeholder={pt ? "Ex: Diogo" : "E.g. John"}
              value={nameA2}
              onChange={(e) => setNameA2(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">
              {pt ? "Nome — Equipa B (direita)" : "Name — Team B (right)"}
            </label>
            <input
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white text-base outline-none focus:border-red-500"
              placeholder={pt ? "Ex: Pedro" : "E.g. Mike"}
              value={nameB1}
              onChange={(e) => setNameB1(e.target.value)}
            />
            <input
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white text-base outline-none focus:border-red-500"
              placeholder={pt ? "Ex: Pedro" : "E.g. Mike"}
              value={nameB2}
              onChange={(e) => setNameB2(e.target.value)}
            />
          </div>

          {/* Format */}
          <div>
            <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">
              {pt ? "Formato" : "Format"}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {FORMATS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFormat(f.value)}
                  className={`py-2 px-1 rounded-xl text-xs font-semibold transition ${
                    format === f.value
                      ? "bg-yellow-400 text-gray-950"
                      : "bg-gray-900 border border-gray-800 text-gray-300"
                  }`}
                >
                  {pt ? f.label : f.labelEn}
                </button>
              ))}
            </div>
          </div>

          {/* First server */}
          <div>
            <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">
              {pt ? "Quem serve primeiro?" : "Who serves first?"}
            </label>
            <div className="grid grid-cols-3 gap-2 items-center">
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setFirstServer(0)}
                  className={`py-2 rounded-xl text-xs font-semibold transition truncate ${
                    server === 0
                      ? "bg-blue-500 text-white"
                      : "bg-gray-900 border border-gray-800 text-gray-300"
                  }`}
                >
                  {nameA1 || "A1"} 🎾
                </button>
                <button
                  onClick={() => setFirstServer(2)}
                  className={`py-2 rounded-xl text-xs font-semibold transition truncate ${
                    server === 2
                      ? "bg-blue-500 text-white"
                      : "bg-gray-900 border border-gray-800 text-gray-300"
                  }`}
                >
                  {nameA2 || "A2"} 🎾
                </button>
              </div>

              <button
                onClick={randomServer}
                className="py-2 rounded-xl text-xs bg-gray-800 text-gray-300 border border-gray-700"
              >
                🎲 {pt ? "Aleatório" : "Random"}
              </button>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setFirstServer(1)}
                  className={`py-2 rounded-xl text-xs font-semibold transition truncate ${
                    server === 1
                      ? "bg-red-500 text-white"
                      : "bg-gray-900 border border-gray-800 text-gray-300"
                  }`}
                >
                  🎾 {nameB1 || "B1"}
                </button>
                <button
                  onClick={() => setFirstServer(3)}
                  className={`py-2 rounded-xl text-xs font-semibold transition truncate ${
                    server === 3
                      ? "bg-red-500 text-white"
                      : "bg-gray-900 border border-gray-800 text-gray-300"
                  }`}
                >
                  🎾 {nameB2 || "B2"}
                </button>
              </div>
            </div>
            {server !== null && (
              <p className="text-xs text-center text-gray-500 mt-2">
                {pt
                  ? `${players[server]} serve primeiro`
                  : `${players[server]} serves first`}
              </p>
            )}
          </div>

          {/* Start */}
          <button
            onClick={handleStart}
            disabled={server === null}
            className={`w-full py-4 rounded-2xl text-lg font-black transition ${
              server !== null
                ? "bg-yellow-400 text-gray-950 active:bg-yellow-300"
                : "bg-gray-800 text-gray-600 cursor-not-allowed"
            }`}
          >
            {pt ? "Iniciar Jogo" : "Start Game"}
          </button>
        </div>
      </div>
    </div>
  );
}

function names(idx, a, b) {
  return idx === 0 ? a : b;
}

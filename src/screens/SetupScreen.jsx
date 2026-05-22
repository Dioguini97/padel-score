import { useState } from 'react';

const FORMATS = [
  { value: 'best_of_3', label: 'Melhor de 3 sets', labelEn: 'Best of 3 sets' },
  { value: 'one_set',   label: '1 Set',            labelEn: '1 Set' },
  { value: 'games_only',label: 'Só jogos',         labelEn: 'Games only' },
];

export default function SetupScreen({ onStart }) {
  const [nameA, setNameA] = useState('');
  const [nameB, setNameB] = useState('');
  const [format, setFormat] = useState('best_of_3');
  const [language, setLanguage] = useState('pt');
  const [firstServer, setFirstServer] = useState(null);

  function randomServer() {
    setFirstServer(Math.random() < 0.5 ? 0 : 1);
  }

  function handleStart() {
    if (firstServer === null) return;
    onStart({
      nameA: nameA.trim() || 'Equipa A',
      nameB: nameB.trim() || 'Equipa B',
      format,
      language,
      firstServer,
    });
  }

  const resolvedNameA = nameA.trim() || 'Equipa A';
  const resolvedNameB = nameB.trim() || 'Equipa B';
  const pt = language === 'pt';

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-5">
      <div className="w-full max-w-sm">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-yellow-400">🎾 Padel Score</h1>
          <p className="text-gray-500 text-sm mt-1">
            {pt ? 'Marcador de jogo' : 'Game scoreboard'}
          </p>
        </div>

        <div className="space-y-5">
          {/* Language toggle */}
          <div className="flex rounded-xl overflow-hidden border border-gray-800">
            {['pt', 'en'].map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`flex-1 py-2 text-sm font-medium transition ${
                  language === lang
                    ? 'bg-yellow-400 text-gray-950'
                    : 'bg-gray-900 text-gray-400'
                }`}
              >
                {lang === 'pt' ? '🇵🇹 Português' : '🇬🇧 English'}
              </button>
            ))}
          </div>

          {/* Names */}
          <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">
              {pt ? 'Nome — Equipa A (esquerda)' : 'Name — Team A (left)'}
            </label>
            <input
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white text-base outline-none focus:border-blue-500"
              placeholder={pt ? 'Ex: Diogo' : 'E.g. John'}
              value={nameA}
              onChange={(e) => setNameA(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">
              {pt ? 'Nome — Equipa B (direita)' : 'Name — Team B (right)'}
            </label>
            <input
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white text-base outline-none focus:border-red-500"
              placeholder={pt ? 'Ex: Pedro' : 'E.g. Mike'}
              value={nameB}
              onChange={(e) => setNameB(e.target.value)}
            />
          </div>

          {/* Format */}
          <div>
            <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">
              {pt ? 'Formato' : 'Format'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {FORMATS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFormat(f.value)}
                  className={`py-2 px-1 rounded-xl text-xs font-semibold transition ${
                    format === f.value
                      ? 'bg-yellow-400 text-gray-950'
                      : 'bg-gray-900 border border-gray-800 text-gray-300'
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
              {pt ? 'Quem serve primeiro?' : 'Who serves first?'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setFirstServer(0)}
                className={`py-2 rounded-xl text-xs font-semibold transition truncate ${
                  firstServer === 0
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-900 border border-gray-800 text-gray-300'
                }`}
              >
                {resolvedNameA} 🎾
              </button>
              <button
                onClick={randomServer}
                className="py-2 rounded-xl text-xs bg-gray-800 text-gray-300 border border-gray-700"
              >
                🎲 {pt ? 'Aleatório' : 'Random'}
              </button>
              <button
                onClick={() => setFirstServer(1)}
                className={`py-2 rounded-xl text-xs font-semibold transition truncate ${
                  firstServer === 1
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-900 border border-gray-800 text-gray-300'
                }`}
              >
                🎾 {resolvedNameB}
              </button>
            </div>
            {firstServer !== null && (
              <p className="text-xs text-center text-gray-500 mt-2">
                {pt
                  ? `${names(firstServer, resolvedNameA, resolvedNameB)} serve primeiro`
                  : `${names(firstServer, resolvedNameA, resolvedNameB)} serves first`}
              </p>
            )}
          </div>

          {/* Start */}
          <button
            onClick={handleStart}
            disabled={firstServer === null}
            className={`w-full py-4 rounded-2xl text-lg font-black transition ${
              firstServer !== null
                ? 'bg-yellow-400 text-gray-950 active:bg-yellow-300'
                : 'bg-gray-800 text-gray-600 cursor-not-allowed'
            }`}
          >
            {pt ? 'Iniciar Jogo' : 'Start Game'}
          </button>
        </div>
      </div>
    </div>
  );
}

function names(idx, a, b) {
  return idx === 0 ? a : b;
}

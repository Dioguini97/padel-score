import { useEffect, useState } from "react";
import { getAllMatches } from "../services/matchStorage";

export default function HistoryScreen({ onShowSetup }) {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const data = await getAllMatches();
    setMatches(data.sort((a, b) => b.startedAt - a.startedAt));
  }

  function formatDate(ts) {
    return new Date(ts).toLocaleString("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      <h1 className="text-2xl font-black text-yellow-400 mb-4">
        📜 Histórico de Jogos
      </h1>
      <div className="grid grid-cols-2 gap-2 items-center mb-4 mt-4">
        <button
          className="py-2 rounded-xl text-xs bg-gray-800 text-gray-300 border border-gray-700"
          onClick={onShowSetup}
        >
          Back
        </button>
      </div>
      {matches.length === 0 ? (
        <p className="text-gray-500">Sem jogos ainda.</p>
      ) : (
        <div className="space-y-3">
          {matches.map((m, idx) => {
            const teamA = m.teamA.join(" / ");
            const teamB = m.teamB.join(" / ");
            const winnerA = m.winner === 0;

            return (
              <div
                key={m.id}
                className="bg-gray-900 border border-gray-800 rounded-xl p-4"
              >
                <div
                  onClick={() => setExpanded(expanded === m.id ? null : m.id)}
                >
                  <h3>
                    {m.teamA.join(" & ")} vs {m.teamB.join(" & ")}
                  </h3>
                  <p>{new Date(m.date).toLocaleString()}</p>
                </div>
                <div className="text-xs text-gray-500 mb-2">
                  {formatDate(m.startedAt)}
                </div>

                <div className="flex justify-between items-center">
                  <div className={winnerA ? "text-white" : "text-gray-500"}>
                    {teamA}
                  </div>

                  <div className="text-sm text-gray-400">
                    {m.sets.map((s, i) => (
                      <span key={i} className="mx-1">
                        {s[0]}-{s[1]}
                      </span>
                    ))}
                  </div>

                  <div className={!winnerA ? "text-white" : "text-gray-500"}>
                    {teamB}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

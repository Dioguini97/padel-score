import { useEffect, useState } from "react";
import { buildRanking } from "../logic/ranking";

export default function RankingScreen({ onShowSetup }) {
  const [ranking, setRanking] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const data = await buildRanking();
    setRanking(data);
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      <h1 className="text-2xl font-black text-yellow-400 mb-4">🏆 Ranking</h1>
      <div className="grid grid-cols-2 gap-2 items-center mb-4 mt-4">
        <button
          className="py-2 rounded-xl text-xs bg-gray-800 text-gray-300 border border-gray-700"
          onClick={onShowSetup}
        >
          Back
        </button>
      </div>

      <div className="space-y-2">
        {ranking.map((p, i) => (
          <div
            key={p.name}
            className="flex justify-between bg-gray-900 border border-gray-800 rounded-xl p-3"
          >
            <div className="flex gap-3">
              <span className="text-gray-500 w-6">#{i + 1}</span>
              <span className="font-bold">{p.name}</span>
            </div>

            <div className="text-sm text-gray-400">
              {p.wins}W - {p.losses}L ({p.winRate.toFixed(1)}%)
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

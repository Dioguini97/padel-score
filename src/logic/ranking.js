import { getAllMatches } from "../services/matchStorage";

export async function buildRanking() {
  const matches = await getAllMatches();

  const players = {};

  function ensure(name) {
    if (!players[name]) {
      players[name] = {
        name,
        matches: 0,
        wins: 0,
        losses: 0,
      };
    }
  }

  for (const m of matches) {
    const teamA = m.teamA;
    const teamB = m.teamB;

    const winner = m.winner;

    const allPlayers = [...teamA, ...teamB];
    allPlayers.forEach(ensure);

    // increment matches
    teamA.forEach((p) => players[p].matches++);
    teamB.forEach((p) => players[p].matches++);

    if (winner === 0) {
      teamA.forEach((p) => players[p].wins++);
      teamB.forEach((p) => players[p].losses++);
    } else {
      teamB.forEach((p) => players[p].wins++);
      teamA.forEach((p) => players[p].losses++);
    }
  }

  const list = Object.values(players).map((p) => ({
    ...p,
    winRate: p.matches ? (p.wins / p.matches) * 100 : 0,
  }));

  return list.sort((a, b) => b.winRate - a.winRate);
}
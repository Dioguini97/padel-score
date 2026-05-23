// ─── Scoring logic for padel ─────────────────────────────────────────────────

const POINT_LABELS = ["0", "15", "30", "40"];

// ─── Display helpers ──────────────────────────────────────────────────────────

export function getPointsDisplay(pA, pB) {
  // Both below 40: show normal labels
  if (pA < 3 && pB < 3) return [POINT_LABELS[pA], POINT_LABELS[pB]];
  // One side at 40, other below
  if (pA >= 3 && pB < 3) return ["40", POINT_LABELS[pB]];
  if (pB >= 3 && pA < 3) return [POINT_LABELS[pA], "40"];
  // Both >= 3: deuce zone
  if (pA === pB) return ["40", "40"]; // deuce
  return pA > pB ? ["ADV", "40"] : ["40", "ADV"];
}

// ─── Win condition helpers ────────────────────────────────────────────────────

function gameWinner(pA, pB) {
  if (pA >= 4 && pB <= 2) return 0;
  if (pB >= 4 && pA <= 2) return 1;
  if (pA >= 3 && pB >= 3) {
    if (pA - pB >= 2) return 0;
    if (pB - pA >= 2) return 1;
  }
  return null;
}

function setGameWinner(gA, gB) {
  // First to 6 with 2+ lead; at 6-6 → tiebreak (checked separately)
  if (gA >= 6 && gA - gB >= 2) return 0;
  if (gB >= 6 && gB - gA >= 2) return 1;
  return null;
}

function tiebreakWinner(tbA, tbB) {
  if (tbA >= 7 && tbA - tbB >= 2) return 0;
  if (tbB >= 7 && tbB - tbA >= 2) return 1;
  return null;
}

// Tiebreak serve: first server serves 1 point, then alternate every 2
function tiebreakServer(firstServer, totalPoints) {

  if (totalPoints === 0) return firstServer;

  const blockIndex = Math.floor((totalPoints + 1) / 2);

  return (firstServer + blockIndex) % 4;
  //const sequence = [0, 1, 2, 3];
  //const startIndex = sequence.indexOf(server);
  //return sequence[(startIndex + totalPoints) % 4];
  //const block = Math.floor((totalPoints + 1) / 2);
  //return block % 2 === 0 ? firstServer : 1 - firstServer;
}

// ─── State factory ────────────────────────────────────────────────────────────

export function createInitialState({
  teamA,
  teamB,
  format,
  language,
  server,
}) {
  return {
    teamA,
    teamB,
    names: [
      teamA?.[0] || "A1",
      teamB?.[0] || "B1",
      teamA?.[1] || "A2",
      teamB?.[1] || "B2",
    ],
    format, // 'best_of_3' | 'one_set' | 'games_only'
    language, // 'pt' | 'en'
    phase: "playing",
    points: [0, 0],
    games: [0, 0],
    sets: [0, 0],
    completedSets: [], // [[gA, gB], ...]
    server, // 0 or 1
    firstServerOfSet: server,
    isTiebreak: false,
    tiebreakPoints: [0, 0],
    tbFirstServer: server,
    winner: null,
    lastEvent: null,
    history: [],
  };
}

// ─── Core actions ─────────────────────────────────────────────────────────────

export function addPoint(state, team) {
  if (state.phase !== "playing") return state;
  // Snapshot for undo (no nested history)
  const snap = { ...state, history: [] };
  const next = state.isTiebreak
    ? processTiebreakPoint(state, team)
    : processNormalPoint(state, team);
  return { ...next, history: [snap, ...state.history.slice(0, 29)] };
}

export function undoLastPoint(state) {
  if (!state.history.length) return state;
  const [prev, ...rest] = state.history;
  return { ...prev, history: rest };
}

export function endGamesOnly(state) {
  const [gA, gB] = state.games;
  const winner = gA > gB ? 0 : gA < gB ? 1 : 0; // ties go to A for simplicity
  return {
    ...state,
    phase: "finished",
    winner,
    lastEvent: {
      type: "match",
      winner,
      sets: state.games,
      completedSets: state.completedSets,
    },
  };
}

// ─── Internal processors ──────────────────────────────────────────────────────

function processNormalPoint(state, team) {
  const pts = [...state.points];
  pts[team]++;
  const winner = gameWinner(pts[0], pts[1]);
  if (winner === null) {
    return { ...state, points: pts, lastEvent: { type: "point", points: pts } };
  }
  return processGameWin({ ...state, points: [0, 0] }, winner);
}

function processGameWin(state, gWinner) {
  const games = [...state.games];
  games[gWinner]++;
  const newServer = nextServer(state.server);

  // Tiebreak trigger at 6-6
  if (games[0] === 6 && games[1] === 6 && state.format !== "games_only") {
    return {
      ...state,
      games,
      server: newServer,
      isTiebreak: true,
      tiebreakPoints: [0, 0],
      tbFirstServer: newServer,
      lastEvent: { type: "tiebreak_start", games, server: newServer },
    };
  }

  // Set winner?
  const sw =
    state.format !== "games_only" ? setGameWinner(games[0], games[1]) : null;
  if (sw !== null) {
    return processSetWin({ ...state, games }, sw, games, newServer);
  }

  return {
    ...state,
    points: [0, 0],
    games,
    server: newServer,
    lastEvent: { type: "game", winner: gWinner, games, server: newServer },
  };
}

function processSetWin(state, sw, games, newServer) {
  const sets = [...state.sets];
  sets[sw]++;
  const completedSets = [...state.completedSets, [...games]];
  const neededSets = state.format === "best_of_3" ? 2 : 1;

  if (sets[sw] >= neededSets) {
    return {
      ...state,
      points: [0, 0],
      games: [0, 0],
      sets,
      completedSets,
      phase: "finished",
      winner: sw,
      lastEvent: { type: "match", winner: sw, sets, completedSets },
    };
  }

  return {
    ...state,
    points: [0, 0],
    games: [0, 0],
    sets,
    completedSets,
    server: newServer,
    firstServerOfSet: newServer,
    isTiebreak: false,
    lastEvent: { type: "set", winner: sw, sets, games, server: newServer },
  };
}

function processTiebreakPoint(state, team) {
  const tb = [...state.tiebreakPoints];
  tb[team]++;
  const total = tb[0] + tb[1];
  const newServer = tiebreakServer(state.tbFirstServer, total);

  const winner = tiebreakWinner(tb[0], tb[1]);
  if (winner === null) {
    return {
      ...state,
      tiebreakPoints: tb,
      server: newServer,
      lastEvent: {
        type: "tiebreak_point",
        tiebreakPoints: tb,
        server: newServer,
      },
    };
  }

  // Tiebreak won → set won, show as 7-6
  const finalGames = winner === 0 ? [7, 6] : [6, 7];
  const afterServer = 1 - state.tbFirstServer;
  return processSetWin(
    { ...state, isTiebreak: false, tiebreakPoints: tb },
    winner,
    finalGames,
    afterServer,
  );
}

// ─── Announcements ────────────────────────────────────────────────────────────

export function getAnnouncement(event, names, language) {
  if (!event) return null;
  const pt = language === "pt";
  const [nA, nB, nAA, nBB] = names;
  const serverName = (s) => names[s];
  const teamA = `${names[0]} & ${names[2]}`;
  const teamB = `${names[1]} & ${names[3]}`;   

  switch (event.type) {
    case "point": {
      const [dA, dB] = getPointsDisplay(event.points[0], event.points[1]);
      if (dA === "40" && dB === "40") return pt ? "Iguais" : "Deuce";
      if (dA === "ADV") return pt ? `Vantagem ${nA} & ${nAA}` : `Advantage ${nA} & ${nAA}`;
      if (dB === "ADV") return pt ? `Vantagem ${nB} & ${nBB}` : `Advantage ${nB} & ${nBB}`;
      return pt ? `${dA} a ${dB}` : `${dA}, ${dB}`;
    }
    case "game": {
      const [gA, gB] = event.games;
      const srv = serverName(event.server);
      return pt
        ? `Jogo! ${gA} a ${gB}. Serviço de ${srv}`
        : `Game! ${gA} ${gB}. ${srv} to serve`;
    }
    case "tiebreak_start": {
      const srv = serverName(event.server);
      return pt ? `Tie-break! Serviço de ${srv}` : `Tiebreak! ${srv} to serve`;
    }
    case "tiebreak_point": {
      const [tbA, tbB] = event.tiebreakPoints;
      const srv = serverName(event.server);
      return pt ? `${tbA} a ${tbB}. Serviço de ${srv}` : `${tbA} ${tbB}. ${srv} to serve`;
    }
    case "set": {
      const [sA, sB] = event.sets;
      const [gA, gB] = event.games;
      const srv = serverName(event.server);  
      const winner = event.winner === 0 ? teamA : teamB; 
      return pt
        ? `Set para ${winner}! ${gA} a ${gB}. ${sA} sets a ${sB}. Serviço de ${srv}`
        : `Set to ${winner}! ${gA} ${gB}. ${sA} sets to ${sB}. ${srv} to serve`;
    }
    case "match": {
      const [sA, sB] = event.sets;
      const winner = event.winner === 0 ? teamA : teamB; 
      return pt
        ? `Jogo! ${winner} vence! ${sA} a ${sB}`
        : `Game! ${winner} wins! ${sA} to ${sB}`;
    }
    default:
      return null;
  }
}

export function getPlayers(state) {
  return [state.teamA[0], state.teamB[0], state.teamA[1], state.teamB[1]];
}

export function getCurrentServerName(state) {
  const players = getPlayers(state);
  return players[state.server];
}

export function isTeamAServing(state) {
  return state.server === 0 || state.server === 2;
}

export function isTeamBServing(state) {
  return state.server === 1 || state.server === 3;
}

export function nextServer(server) {
  return (server + 1) % 4;
}

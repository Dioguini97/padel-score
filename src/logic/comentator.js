function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateCommentary(state, event) {
  if (!event) return null;

  const [pA, pB] = state.points;
  const [gA, gB] = state.games;
  const [sA, sB] = state.sets;

  const diffGames = Math.abs(gA - gB);
  const diffPoints = Math.abs(pA - pB);

  switch (event.type) {
    // _______________POINTS_________________
    case "point": {
      if (pA === 3 && pB === 3) {
        return pick([
          "Deuce outra vez… isto não acaba hoje.",
          "Isto está mais empatado que um clássico.",
          "Ninguém quer ganhar isto facilmente.",
        ]);
      }

      if (pA >= 3 || pB >= 3) {
        return pick([
          "Pressão a subir neste jogo.",
          "Cheira a break point em breve.",
          "Aqui já não há espaço para erros.",
        ]);
      }

      if (pA === 0 && pB === 0) {
        return pick([
          "Começo tranquilo… por enquanto.",
          "Ainda ninguém quis sujar as mãos.",
          "Vamos ver quem acorda primeiro.",
        ]);
      }

      if (diffPoints >= 2) {
        return pick([
          "Um lado está a dominar claramente.",
          "Isto começa a parecer treino.",
          "Diferença já começa a notar-se.",
        ]);
      }

      return pick([
        "Boa troca de bolas.",
        "Isto está equilibrado.",
        "Cada ponto conta agora.",
      ]);
    }

    // ______________GAME WON________________
    case "game": {
      if (diffGames === 0) {
        return pick([
          "Continuamos empatados. Ninguém descola.",
          "Isto está taco a taco.",
          "Tudo igual no marcador.",
        ]);
      }

      if (diffGames >= 2) {
        return pick([
          "Já começa a cheirar a domínio.",
          "Uma equipa está a abrir o jogo.",
          "Isto pode começar a fugir.",
        ]);
      }

      return pick([
        "Game importante ganho.",
        "Mudança no marcador.",
        "Este jogo foi bem disputado.",
      ]);
    }
    // ─── SET ────────────────────────────────
    case "set": {
      return pick([
        "Set fechado com autoridade.",
        "Momento decisivo neste encontro.",
        "Um passo gigante no jogo.",
      ]);
    }

    // ─── TIEBREAK ───────────────────────────
    case "tiebreak_start": {
      return pick([
        "Agora é nervos de aço.",
        "Aqui não há margem para erro.",
        "Tiebreak… respira fundo.",
      ]);
    }

    case "tiebreak_point": {
      return pick([
        "Cada ponto aqui pesa toneladas.",
        "Isto já é pura pressão.",
        "Quem falhar agora paga caro.",
      ]);
    }

    // ─── MATCH ──────────────────────────────
    case "match": {
      return pick([
        "Fim de linha. Jogo fechado.",
        "Vitória confirmada com estilo.",
        "Isto acabou agora mesmo.",
      ]);
    }

    default:
      return null;
  }
}
export function doesComment(state, event) {
  if (Math.random() < 0.4) return generateCommentary(state, event);
  return null;
}

import { describe, it, expect } from "vitest";
import { nextServer, getPointsDisplay, addPoint, createInitialState } from "../logic/scoring";

describe("getPointsDisplay", () => {
  it("mostra score normal", () => {
    expect(getPointsDisplay(0, 0)).toEqual(["0", "0"]);
    expect(getPointsDisplay(1, 2)).toEqual(["15", "30"]);
  });

  it("mostra 40 corretamente", () => {
    expect(getPointsDisplay(3, 2)).toEqual(["40", "30"]);
    expect(getPointsDisplay(1, 3)).toEqual(["15", "40"]);
  });

  it("mostra deuce", () => {
    expect(getPointsDisplay(3, 3)).toEqual(["40", "40"]);
    expect(getPointsDisplay(4, 4)).toEqual(["40", "40"]);
  });

  it("mostra vantagem", () => {
    expect(getPointsDisplay(4, 3)).toEqual(["ADV", "40"]);
    expect(getPointsDisplay(3, 4)).toEqual(["40", "ADV"]);
  });
});

describe("nextServer", () => {
  it("roda corretamente", () => {
    expect(nextServer(0)).toBe(1);
    expect(nextServer(1)).toBe(2);
    expect(nextServer(2)).toBe(3);
    expect(nextServer(3)).toBe(0);
  });
});

it("server nunca deve ser undefined após set", () => {
  let state = createInitialState({
    teamA: ["A1", "A2"],
    teamB: ["B1", "B2"],
    format: "best_of_3",
    language: "pt",
    server: 0,
  });

  state.games = [6, 2];

  for (let i = 0; i < 4; i++) {
    state = addPoint(state, 0);
  }

  expect(state.server).not.toBeUndefined();
  expect([0, 1, 2, 3]).toContain(state.server);
});

it("estado nunca fica inválido", () => {
  let state = createInitialState({
    teamA: ["A1", "A2"],
    teamB: ["B1", "B2"],
    format: "best_of_3",
    language: "pt",
    server: 0,
  });

  for (let i = 0; i < 50; i++) {
    state = addPoint(state, Math.floor(Math.random() * 2));

    expect(state.server).toBeDefined();
    expect(state.games).toHaveLength(2);
    expect(state.points).toHaveLength(2);
  }
});

it("não perde server após set decidido em tiebreak", () => {
  let state = createInitialState({
    teamA: ["A1", "A2"],
    teamB: ["B1", "B2"],
    format: "best_of_3",
    language: "pt",
    server: 0,
  });

  // força tiebreak
  state.games = [6, 6];
  state.isTiebreak = true;

  for (let i = 0; i < 8; i++) {
    state = addPoint(state, 0);
  }

  expect(state.server).toBe(1);
  expect(typeof state.server).toBe("number");
});

it("não perde server após set decidido em tiebreak", () => {
  let state = createInitialState({
    teamA: ["A1", "A2"],
    teamB: ["B1", "B2"],
    format: "best_of_3",
    language: "pt",
    server: 0,
  });

  state.games = [5, 0];

  for (let i = 0; i < 8; i++) {
    state = addPoint(state, 0);
  }

  expect(state.server).toBe(2);
  expect(typeof state.server).toBe("number");
});
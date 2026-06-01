import { openDB } from "idb";

const DB_NAME = "padel-score-db";
const DB_VERSION = 1;
const STORE_NAME = "matches";

// ─── DB init ────────────────────────────────────────────────────────────────
const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      const store = db.createObjectStore(STORE_NAME, {
        keyPath: "id",
      });

      store.createIndex("date", "startedAt");
      store.createIndex("winner", "winner");
    }
  },
});

// ─── Save match ─────────────────────────────────────────────────────────────
export async function saveMatch(match) {
  const db = await dbPromise;

  const normalized = {
    id: match.matchId,
    startedAt: match.startedAt,
    finishedAt: match.finishedAt || Date.now(),

    teamA: match.teamA,
    teamB: match.teamB,

    sets: match.completedSets,
    finalScore: match.sets,
    winner: match.winner,

    format: match.format,
    language: match.language,

    events: match.events || [],
  };

  await db.put(STORE_NAME, normalized);
}

// ─── Get all matches ────────────────────────────────────────────────────────
export async function getAllMatches() {
  const db = await dbPromise;
  return await db.getAll(STORE_NAME);
}

// ─── Get match by id ─────────────────────────────────────────────────────────
export async function getMatchById(id) {
  const db = await dbPromise;
  return await db.get(STORE_NAME, id);
}

// ─── Delete match ────────────────────────────────────────────────────────────
export async function deleteMatch(id) {
  const db = await dbPromise;
  await db.delete(STORE_NAME, id);
}

// ─── Clear all (debug/reset) ────────────────────────────────────────────────
export async function clearMatches() {
  const db = await dbPromise;
  await db.clear(STORE_NAME);
}
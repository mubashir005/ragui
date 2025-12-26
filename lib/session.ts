// src/lib/session.ts
export const SESSION_KEY = "rag_session_id";

function randomId() {
  // browser-safe random id
  return crypto.randomUUID();
}

export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return ""; // SSR safety
  const existing = localStorage.getItem(SESSION_KEY);
  if (existing) return existing;

  const id = randomId();
  localStorage.setItem(SESSION_KEY, id);
  return id;
}

export function resetSessionId(): string {
  if (typeof window === "undefined") return "";
  const id = randomId();
  localStorage.setItem(SESSION_KEY, id);
  return id;
}


export function apiBaseUrl() {
  const base = process.env.NEXT_PUBLIC_RAG_API_BASE_URL;
  if (!base) throw new Error("Missing NEXT_PUBLIC_RAG_API_BASE_URL in .env.local");
  return base.replace(/\/+$/, "");
}

export async function uploadDocuments(files: File[], sessionId: string) {
  const form = new FormData();
  for (const f of files) form.append("files", f);

  const res = await fetch(`${apiBaseUrl()}/upload`, {
    method: "POST",
    headers: { "x-session-id": sessionId },
    body: form,
  });

  const text = await res.text();
  if (!res.ok) throw new Error(`Upload failed (${res.status}): ${text}`);
  return JSON.parse(text);
}

export async function buildIndex(sessionId: string) {
  const res = await fetch(`${apiBaseUrl()}/build`, {
    method: "POST",
    headers: { "x-session-id": sessionId },
  });

  const text = await res.text();
  if (!res.ok) throw new Error(`Build failed (${res.status}): ${text}`);
  return JSON.parse(text);
}

export type AskResponse = {
  query: string;
  answer: string;
  top_sources: { source: string; score: number }[];
  top_score: number;
};

export async function askQuestion(query: string, sessionId: string, k = 3): Promise<AskResponse> {
  const res = await fetch(`${apiBaseUrl()}/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-session-id": sessionId,
    },
    body: JSON.stringify({ query, k }),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(`Ask failed (${res.status}): ${text}`);
  return JSON.parse(text);
}

export type SessionStatus = {
  session_id: string;
  has_docs: boolean;
  has_index: boolean;
};

export async function getStatus(sessionId: string): Promise<SessionStatus> {
  const res = await fetch(`${apiBaseUrl()}/status`, {
    method: "GET",
    headers: { "x-session-id": sessionId },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Status failed (${res.status}): ${text}`);
  return JSON.parse(text);
}

export type SessionFiles = {
  session_id: string;
  files: { name: string; size: number }[];
};

export async function getFiles(sessionId: string): Promise<SessionFiles> {
  const res = await fetch(`${apiBaseUrl()}/files`, {
    method: "GET",
    headers: { "x-session-id": sessionId },
  });

  const text = await res.text();
  if (!res.ok) throw new Error(`Files failed (${res.status}): ${text}`);
  return JSON.parse(text);
}

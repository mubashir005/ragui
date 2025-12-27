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

// Upload files sequentially (one at a time) to avoid backend overload
export async function uploadDocumentsSequential(
  files: File[], 
  sessionId: string,
  onProgress?: (current: number, total: number, filename: string) => void
) {
  console.log(`📤 [UPLOAD] Starting sequential upload of ${files.length} files`);
  console.log(`📤 [UPLOAD] Session ID: ${sessionId}`);
  
  const results = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    console.log(`📤 [UPLOAD] Uploading file ${i + 1}/${files.length}: ${file.name} (${file.size} bytes)`);
    onProgress?.(i + 1, files.length, file.name);
    
    const form = new FormData();
    form.append("files", file);

    const res = await fetch(`${apiBaseUrl()}/upload`, {
      method: "POST",
      headers: { "x-session-id": sessionId },
      body: form,
    });

    const text = await res.text();
    console.log(`📤 [UPLOAD] Response for ${file.name}:`, text);
    
    if (!res.ok) {
      console.error(`📤 [UPLOAD] Failed for ${file.name}:`, text);
      throw new Error(`Upload failed for "${file.name}" (${res.status}): ${text}`);
    }
    
    const result = JSON.parse(text);
    results.push(result);
    console.log(`📤 [UPLOAD] Success for ${file.name}:`, result);
    
    // Small delay between uploads to avoid overwhelming the backend
    if (i < files.length - 1) {
      console.log(`📤 [UPLOAD] Waiting 500ms before next upload...`);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  console.log(`📤 [UPLOAD] All uploads complete! Total files: ${results.length}`);
  return results;
}

export async function buildIndex(sessionId: string) {
  console.log(`🔨 [BUILD] Starting build for session: ${sessionId}`);
  console.log(`🔨 [BUILD] API URL: ${apiBaseUrl()}/build`);
  
  // Use longer timeout for multiple files (3 minutes)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 180000);

  try {
    const res = await fetch(`${apiBaseUrl()}/build`, {
      method: "POST",
      headers: { "x-session-id": sessionId },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    
    console.log(`🔨 [BUILD] Response status: ${res.status}`);
    console.log(`🔨 [BUILD] Response ok: ${res.ok}`);

    const text = await res.text();
    console.log(`🔨 [BUILD] Response text:`, text);
    
    if (!res.ok) {
      // Try to parse error details
      let errorDetail = text;
      try {
        const errorJson = JSON.parse(text);
        errorDetail = errorJson.detail || errorJson.message || text;
      } catch {}
      console.error(`🔨 [BUILD] Error detail:`, errorDetail);
      throw new Error(`Build failed (${res.status}): ${errorDetail}`);
    }
    
    const result = text ? JSON.parse(text) : { status: "success" };
    console.log(`🔨 [BUILD] Success!`, result);
    return result;
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    console.error(`🔨 [BUILD] Error caught:`, error);
    console.error(`🔨 [BUILD] Error name:`, error.name);
    console.error(`🔨 [BUILD] Error message:`, error.message);
    
    // Handle timeout
    if (error.name === 'AbortError') {
      throw new Error('Build timeout: Processing is taking longer than expected.\n\nThis usually happens with:\n• Multiple large documents\n• Slow embedding generation\n• Backend server overload\n\nTry: Refresh the page and upload files one at a time.');
    }
    
    // If it's a network error, provide helpful message
    if (error.message === 'Failed to fetch') {
      throw new Error('Network error: Cannot reach backend server.\n\nPossible causes:\n• Session "' + sessionId + '" has no documents (try uploading again)\n• Backend crashed during previous build (refresh page)\n• Network connectivity issue\n\nTry: Click "START OVER" to reset the session.');
    }
    throw error;
  }
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

// Generate a unique session ID to avoid corrupted sessions
export function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

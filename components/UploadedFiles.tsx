"use client";

import { useEffect, useState } from "react";
import { getFiles, SessionFiles } from "../lib/api";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export default function UploadedFiles({ sessionId }: { sessionId: string }) {
  const [data, setData] = useState<SessionFiles | null>(null);
  const [err, setErr] = useState("");

  async function refresh() {
    try {
      setErr("");
      const r = await getFiles(sessionId);
      setData(r);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load files");
    }
  }

  useEffect(() => {
    if (!sessionId) return;
    refresh();
    const id = setInterval(refresh, 4000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  return (
    <div className="w-full rounded-2xl border border-cyan-500/30 bg-slate-900/70 backdrop-blur-xl p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">📚 Document Library</h2>
        <button
          className="rounded-xl border border-cyan-500/30 bg-slate-800/50 px-4 py-2 text-sm text-gray-300 hover:bg-cyan-500/10 transition-all"
          onClick={refresh}
        >
          🔄 Refresh
        </button>
      </div>

      {err && (
        <div className="rounded-xl bg-red-900/30 border border-red-500/30 px-4 py-3 text-sm text-red-300">
          ❌ {err}
        </div>
      )}

      {!data ? (
        <div className="text-sm text-gray-400 text-center py-8">
          <div className="text-3xl mb-2">⏳</div>
          Loading documents...
        </div>
      ) : data.files.length === 0 ? (
        <div className="text-center py-8 rounded-xl bg-slate-800/30 border border-slate-700">
          <div className="text-4xl mb-3">📭</div>
          <div className="text-sm text-gray-400">No documents uploaded yet</div>
          <div className="text-xs text-gray-500 mt-1">Upload files to get started</div>
        </div>
      ) : (
        <ul className="space-y-2">
          {data.files.map((f, idx) => (
            <li key={f.name} className="flex items-center justify-between rounded-xl bg-slate-800/50 border border-slate-700/50 px-4 py-3 hover:border-cyan-500/30 transition-all group">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="text-2xl">
                  {f.name.endsWith('.pdf') ? '📄' : f.name.endsWith('.txt') ? '📝' : '📃'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{f.name}</div>
                  <div className="text-xs text-gray-500">{formatBytes(f.size)}</div>
                </div>
              </div>
              <div className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 text-xs text-cyan-400 font-mono">
                #{idx + 1}
              </div>
            </li>
          ))}
        </ul>
      )}

      {data && data.files.length > 0 && (
        <div className="mt-4 flex items-center justify-between text-xs text-gray-500 px-2">
          <span>{data.files.length} document{data.files.length !== 1 ? 's' : ''} loaded</span>
          <span className="text-cyan-400">Ready for processing</span>
        </div>
      )}
    </div>
  );
}

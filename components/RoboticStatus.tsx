"use client";

import { useEffect, useState } from "react";
import { getStatus, SessionStatus } from "../lib/api";

type Props = {
  sessionId: string;
  onReadyChange?: (ready: boolean) => void;
};

function face(status: SessionStatus | null) {
  if (!status) return "";
  if (!status.has_docs) return "";
  if (status.has_docs && !status.has_index) return "";
  return "";
}

function label(status: SessionStatus | null) {
  if (!status) return "Checking session...";
  if (!status.has_docs) return "Awaiting documents...";
  if (!status.has_index) return "Documents received. Build index to proceed.";
  return "Ready! Ask questions with citations.";
}

export default function RoboticStatus({ sessionId, onReadyChange }: Props) {
  const [status, setStatus] = useState<SessionStatus | null>(null);
  const [err, setErr] = useState("");

  async function refresh() {
    try {
      setErr("");
      const s = await getStatus(sessionId);
      setStatus(s);
      onReadyChange?.(s.has_index);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to check status");
    }
  }

  useEffect(() => {
    if (!sessionId) return;
    refresh();
    const id = setInterval(refresh, 3000);
    return () => clearInterval(id);
  }, [sessionId]);

  const isReady = status?.has_index;

  return (
    <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/70 backdrop-blur-xl p-6 shadow-2xl">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="text-5xl">
            {face(status)}
          </div>
          <div className="flex-1">
            <div className="text-lg font-bold text-white mb-1">Robot Status</div>
            <div className="text-sm text-gray-300">{label(status)}</div>
            
            {status && (
              <div className="mt-3 flex gap-2 flex-wrap">
                <span className={`rounded-full border px-3 py-1 text-xs font-medium ${
                  status.has_docs 
                    ? "bg-green-500/20 border-green-400/50 text-green-300" 
                    : "bg-gray-700/50 border-gray-600 text-gray-400"
                }`}>
                  {status.has_docs ? "" : ""} Documents
                </span>
                <span className={`rounded-full border px-3 py-1 text-xs font-medium ${
                  status.has_index 
                    ? "bg-green-500/20 border-green-400/50 text-green-300" 
                    : "bg-gray-700/50 border-gray-600 text-gray-400"
                }`}>
                  {status.has_index ? "" : ""} Index
                </span>
                {isReady && (
                  <span className="rounded-full border border-cyan-400/50 bg-cyan-500/20 px-3 py-1 text-xs font-medium text-cyan-300">
                     Online
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <button
          className="rounded-xl border border-cyan-500/30 bg-slate-800/50 px-4 py-2 text-sm text-gray-300 hover:bg-cyan-500/10"
          onClick={refresh}
        >
           Refresh
        </button>
      </div>

      {err && (
        <div className="mt-4 rounded-xl bg-red-900/30 border border-red-500/30 px-4 py-3 text-sm text-red-300">
           {err}
        </div>
      )}
    </div>
  );
}

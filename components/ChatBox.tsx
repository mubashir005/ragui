"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { askQuestion, AskResponse } from "../lib/api";

type Props = {
  sessionId: string;
  ready: boolean;
};

type Msg =
  | { role: "user"; content: string; at: string }
  | {
      role: "assistant";
      content: string;
      at: string;
      top_score?: number;
      top_sources?: AskResponse["top_sources"];
    };

function nowISO() {
  return new Date().toISOString();
}

function prettyTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

export default function ChatBox({ sessionId, ready }: Props) {
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const hasMessages = useMemo(() => messages.length > 0, [messages.length]);
  const canAsk = ready && !busy && query.trim().length > 0;

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  async function onAsk() {
    const q = query.trim();
    if (!q || !ready || busy) return;

    setMessages((m) => [...m, { role: "user", content: q, at: nowISO() }]);
    setQuery("");

    try {
      setBusy(true);
      setErr("");

      const r = await askQuestion(q, sessionId, 3);

      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: r.answer ?? "ERROR: Empty model response.",
          top_score: r.top_score,
          top_sources: r.top_sources,
          at: nowISO(),
        },
      ]);
    } catch (e: any) {
      const msg = e?.message ?? "Ask failed";
      setErr(msg);
      setMessages((m) => [
        ...m,
        { role: "assistant", content: `ERROR: ${msg}`, at: nowISO() },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function exportSession() {
    const payload = { sessionId, exportedAt: nowISO(), messages };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rag-session-${sessionId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="w-full overflow-hidden rounded-2xl border border-cyan-500/30 bg-slate-900/70 backdrop-blur-xl shadow-2xl animate-fadeInUp">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-500/20 bg-slate-800 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`grid h-12 w-12 place-items-center rounded-2xl border text-2xl transition-smooth ${
            ready 
              ? 'border-green-400/50 bg-green-500/10 shadow-[0_0_20px_rgba(34,197,94,0.3)] status-pulse' 
              : 'border-cyan-400/50 bg-cyan-500/10 animate-pulse'
          }`}>
            {ready ? '✅' : '🤖'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">AI Recruitment Agent</h2>
            <p className={`text-xs font-medium ${ready ? 'text-green-400' : 'text-yellow-400'}`}>
              {ready ? '🟢 Online - Ready to assist' : '🟡 Initializing - Please wait...'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="rounded-xl border border-cyan-500/30 bg-slate-800/50 px-4 py-2 text-sm text-gray-300 hover:bg-cyan-500/10 disabled:opacity-50 transition-smooth btn-press"
            disabled={!hasMessages}
            onClick={exportSession}
          >
            💾 Export
          </button>
          <button
            className="rounded-xl border border-cyan-500/30 bg-slate-800/50 px-4 py-2 text-sm text-gray-300 hover:bg-cyan-500/10 disabled:opacity-50 transition-smooth btn-press"
            disabled={!hasMessages || busy}
            onClick={() => setMessages([])}
          >
            🗑️ Clear
          </button>
        </div>
      </div>

      {/* Status Banner */}
      {!ready && (
        <div className="border-b border-yellow-500/20 bg-yellow-900/20 px-6 py-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="text-2xl animate-spin-slow">⚙️</div>
            <div>
              <p className="text-sm font-medium text-yellow-300">System Initializing...</p>
              <p className="text-xs text-yellow-400/80 mt-1">
                Checking index status. This usually takes a few seconds.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="max-h-[60vh] min-h-[400px] overflow-y-auto bg-slate-900/50 px-6 py-5">
        {!hasMessages ? (
          <div className="rounded-2xl border border-cyan-500/20 bg-slate-800/50 p-8 text-center backdrop-blur-sm">
            {ready ? (
              <>
                <div className="text-5xl mb-4">🎯</div>
                <div className="text-xl font-bold text-white mb-2">Ready to Assist</div>
                <p className="text-sm text-gray-400 mb-6">Ask me anything about the uploaded documents</p>
                <div className="grid grid-cols-1 gap-2 max-w-lg mx-auto text-left">
                  {[
                    "What are the candidate's key technical skills?",
                    "Summarize the work experience",
                    "What certifications does the candidate have?",
                    "Tell me about the education background"
                  ].map((q, i) => (
                    <button
                      key={i}
                      className="flex items-start gap-3 text-sm text-cyan-400 hover:text-cyan-300 bg-slate-700/30 hover:bg-slate-700/50 border border-cyan-500/20 hover:border-cyan-500/40 rounded-lg px-4 py-3 transition-all text-left"
                      onClick={() => setQuery(q)}
                    >
                      <span className="text-cyan-500 text-lg">▸</span>
                      <span className="flex-1">{q}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="text-5xl mb-4 animate-pulse">⏳</div>
                <div className="text-xl font-bold text-white mb-2">Initializing Agent</div>
                <p className="text-sm text-gray-400">Connecting to document index...</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((m, idx) => {
              const isUser = m.role === "user";
              return (
                <div key={idx} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%]`}>
                    <div
                      className={`rounded-2xl border px-5 py-4 text-sm leading-relaxed shadow-lg ${
                        isUser
                          ? "bg-cyan-600 text-white border-cyan-400/50"
                          : "bg-slate-800/80 backdrop-blur-sm text-gray-100 border-slate-700/50"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{m.content}</div>
                    </div>

                    <div className={`mt-2 flex items-center gap-2 text-[11px] ${isUser ? "justify-end" : "justify-start"}`}>
                      <span className="text-gray-400">{prettyTime(m.at)}</span>

                      {"top_score" in m && typeof m.top_score === "number" ? (
                        <span className="rounded-full bg-cyan-500/20 border border-cyan-500/30 px-2 py-0.5 text-cyan-400">
                          ⚡ {m.top_score.toFixed(3)}
                        </span>
                      ) : null}
                    </div>

                    {"top_sources" in m && m.top_sources?.length ? (
                      <div className={`mt-3 flex flex-wrap gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
                        {m.top_sources.map((s) => (
                          <span
                            key={s.source}
                            className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-[11px] text-purple-300"
                            title={`confidence ${s.score.toFixed(3)}`}
                          >
                            <span className="font-medium">📄 {s.source}</span>{" "}
                            <span className="text-purple-400/70">({s.score.toFixed(3)})</span>
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
            <div ref={scrollRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-cyan-500/20 bg-slate-900/90 px-6 py-5">
        {err && (
          <div className="mb-4 rounded-xl bg-red-900/30 border border-red-500/30 px-4 py-3 text-sm text-red-300">
            <span className="font-semibold">❌ Error:</span> {err}
          </div>
        )}

        <div className="flex gap-3">
          <input
            className="flex-1 rounded-xl border border-cyan-500/30 bg-slate-800/50 px-5 py-4 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-cyan-400/50 disabled:bg-slate-800/30 disabled:cursor-not-allowed transition-all"
            placeholder={
              ready 
                ? "Type your question here..." 
                : "⏳ Initializing AI agent..."
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onAsk();
              }
            }}
            disabled={!ready || busy}
          />

          <button
            className={`rounded-xl border px-6 py-4 text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
              ready 
                ? 'border-cyan-500/50 bg-cyan-600 hover:bg-cyan-500 shadow-[0_0_15px_rgba(0,217,255,0.2)]' 
                : 'border-gray-600 bg-gray-700'
            }`}
            disabled={!canAsk}
            onClick={onAsk}
          >
            {busy ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⚙️</span> Processing
              </span>
            ) : ready ? (
              <span className="flex items-center gap-2">
                Send <span>→</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span>⏳</span> Wait
              </span>
            )}
          </button>
        </div>

        <div className="mt-3 text-[11px] text-gray-500">
          {ready ? (
            <>
              <span className="text-cyan-400">💡 Tip:</span> All answers include source citations and confidence scores
            </>
          ) : (
            <>
              <span className="text-yellow-400">⏳</span> Please wait while the system initializes...
            </>
          )}
        </div>
      </div>
    </section>
  );
}

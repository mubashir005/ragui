"use client";

import { useState } from "react";
import { buildIndex } from "../lib/api";

type Props = { sessionId: string };

export default function BuildIndexButton({ sessionId }: Props) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function handle() {
    try {
      setBusy(true);
      setMsg(" Building index...");
      await buildIndex(sessionId);
      setMsg(" Index ready!");
    } catch (e: any) {
      setMsg(` ${e?.message ?? "Build failed"}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-green-500/30 bg-slate-900/70 p-6">
      <h2 className="text-xl font-bold text-white mb-4"> Build Index</h2>
      
      <button
        className="w-full rounded-xl bg-green-600 px-6 py-3 text-sm font-medium text-white hover:bg-green-500 disabled:opacity-50"
        disabled={busy}
        onClick={handle}
      >
        {busy ? " Building..." : " Build Index"}
      </button>

      {msg && (
        <div className={`mt-4 rounded-xl px-4 py-3 text-sm ${
          msg.startsWith("")
            ? "bg-green-500/10 border border-green-500/30 text-green-300"
            : msg.startsWith("")
            ? "bg-red-500/10 border border-red-500/30 text-red-300"
            : "bg-blue-500/10 border border-blue-500/30 text-blue-300"
        }`}>
          {msg}
        </div>
      )}
    </div>
  );
}

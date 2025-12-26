"use client";

import { useRef, useState } from "react";
import { uploadDocuments } from "../lib/api";

type Props = { sessionId: string };

const ALLOWED = [".pdf", ".txt", ".md"];

export default function UploadBox({ sessionId }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  function isAllowed(name: string) {
    const lower = name.toLowerCase();
    return ALLOWED.some((ext) => lower.endsWith(ext));
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    const list = Array.from(files);
    const bad = list.filter((f) => !isAllowed(f.name));
    if (bad.length) {
      setMsg(` Unsupported files: ${bad.map((b) => b.name).join(", ")}`);
      return;
    }

    try {
      setBusy(true);
      setMsg(" Uploading...");
      await uploadDocuments(list, sessionId);
      setMsg(" Upload successful!");
    } catch (e: any) {
      setMsg(` ${e?.message ?? "Upload failed"}`);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/70 p-6">
      <h2 className="text-xl font-bold text-white mb-4"> Upload Documents</h2>
      
      <button
        className="rounded-xl border border-cyan-500/50 bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-cyan-500 disabled:opacity-50 mb-4"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        {busy ? " Uploading..." : "+ Choose Files"}
      </button>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".pdf,.txt,.md"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`min-h-[160px] flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center ${
          isDragging 
            ? "border-cyan-400 bg-cyan-500/10" 
            : "border-cyan-500/30 bg-slate-800/30"
        }`}
      >
        <div className="text-4xl mb-3">{isDragging ? "" : ""}</div>
        <div className="text-sm text-gray-300 mb-1">
          <span className="font-medium">Drag & drop</span> files here
        </div>
        <div className="text-xs text-gray-500">Supports: .pdf, .txt, .md</div>
      </div>

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

"use client";

import { useState, useEffect } from "react";
import { getStatus, getFiles } from "@/lib/api";
import UploadBox from "@/components/UploadBox";
import BuildIndexButton from "@/components/BuildIndexButton";
import ChatBox from "@/components/ChatBox";
import RoboticStatus from "@/components/RoboticStatus";
import UploadedFiles from "@/components/UploadedFiles";

export default function Home() {
  const [sessionId, setSessionId] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let sid = localStorage.getItem("rag-session-id");
    if (!sid) {
      sid = crypto.randomUUID();
      localStorage.setItem("rag-session-id", sid);
    }
    setSessionId(sid);
  }, []);

  if (!sessionId) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-white">Loading session...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <header className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
             NVIDIA RAG Pipeline
          </h1>
          <p className="text-gray-400">
            Upload  Build Index  Ask Questions
          </p>
        </header>

        {/* Status */}
        <RoboticStatus sessionId={sessionId} onReadyChange={setReady} />

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6">
            <UploadBox sessionId={sessionId} />
            <UploadedFiles sessionId={sessionId} />
            <BuildIndexButton sessionId={sessionId} />
          </div>

          {/* Right Column */}
          <div>
            <ChatBox sessionId={sessionId} ready={ready} />
          </div>
        </div>
      </div>
    </main>
  );
}

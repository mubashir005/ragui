"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import WelcomeScreenPro from "./WelcomeScreenPro";
import PipelineBoardV2 from "./PipelineBoardV2";
import FinalChatPanel from "./FinalChatPanel";
import RobotAgent from "./RobotAgent";
import RobotSystemBubble from "./RobotSystemBubble";
import { getStatus, getFiles, generateSessionId } from "../../lib/api";

type View = "welcome" | "pipeline" | "final";

export default function RagDemoPage() {
  const [view, setView] = useState<View>("welcome"); // Start with welcome screen
  const [showFinalBubble, setShowFinalBubble] = useState(false);
  const [sessionId, setSessionId] = useState(() => generateSessionId()); // Generate unique session on mount
  const [stats, setStats] = useState({
    documents: 0,
    hasIndex: false,
    hasDocs: false,
  });

  // Fetch real stats when entering final view
  useEffect(() => {
    if (view === "final") {
      fetchStats();
    }
  }, [view]);

  const fetchStats = async () => {
    try {
      const [statusData, filesData] = await Promise.all([
        getStatus(sessionId),
        getFiles(sessionId),
      ]);

      setStats({
        documents: filesData.files.length,
        hasIndex: statusData.has_index,
        hasDocs: statusData.has_docs,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const handleStart = () => {
    setView("pipeline");
  };

  const handlePipelineComplete = () => {
    setView("final");
    setTimeout(() => setShowFinalBubble(true), 500);
  };

  const handleSessionReset = (newSessionId: string) => {
    setSessionId(newSessionId);
    console.log(`📋 RagDemoPage: Session reset to ${newSessionId}`);
  };

  const finalBubbleLines = [
    "[SYSTEM] Congratulations. RAG Agent Environment ready.",
    "Upload documents and run semantic search.",
    "All systems operational."
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      {view === "welcome" && (
        <WelcomeScreenPro key="welcome" onStart={handleStart} />
      )}

      {view === "pipeline" && (
        <PipelineBoardV2 
          key="pipeline" 
          onComplete={handlePipelineComplete} 
          sessionId={sessionId}
          onSessionReset={handleSessionReset}
        />
      )}

      {view === "final" && (
          <motion.div
            key="final"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-screen bg-[#0a0f1e] relative overflow-hidden flex flex-col"
          >
            {/* Grid background */}
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(6, 182, 212, 0.2) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(6, 182, 212, 0.2) 1px, transparent 1px)
                  `,
                  backgroundSize: '40px 40px'
                }}
              />
            </div>

            {/* Compact Header */}
            <header className="relative z-10 border-b border-cyan-400/30 bg-slate-950/50 backdrop-blur-sm">
              <div className="max-w-7xl mx-auto px-8 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-cyan-400 font-mono tracking-tight">
                      ▸ RAG AGENT
                    </h1>
                    <p className="text-slate-400 text-xs font-mono">
                      Pipeline Complete • Ready for Queries
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs font-mono text-green-400 font-bold">ONLINE</span>
                  </div>
                </div>
              </div>
            </header>

            {/* Main content - Flex grow to fill remaining space */}
            <main className="relative z-10 flex-1 min-h-0 max-w-7xl w-full mx-auto px-8 py-6 flex gap-6">
              {/* Left: Robot with info */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="w-80 shrink-0 flex flex-col"
              >
                {/* Robot */}
                <div className="flex flex-col items-center mb-4">
                  <div className="relative">
                    <motion.div
                      animate={{
                        y: [0, -8, 0]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <RobotAgent mode="float" size={140} />
                    </motion.div>
                    
                    {/* Ready badge */}
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white px-2 py-0.5 rounded-full font-mono text-xs font-bold shadow-lg">
                      READY
                    </div>
                  </div>

                  <RobotSystemBubble
                    lines={finalBubbleLines}
                    visible={showFinalBubble}
                  />
                </div>

                {/* Stats Cards */}
                <div className="space-y-3 flex-1">
                  {[
                    { label: "Documents", value: stats.documents.toString(), icon: "📄" },
                    { label: "Index Status", value: stats.hasIndex ? "Built" : "Pending", icon: "🔧" },
                    { label: "System", value: stats.hasDocs && stats.hasIndex ? "Ready" : "Pending", icon: stats.hasDocs && stats.hasIndex ? "🟢" : "🟡" }
                  ].map((stat, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + idx * 0.1 }}
                      className="p-3 bg-slate-900/60 backdrop-blur-sm border border-cyan-400/20 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-slate-400">{stat.label}</span>
                        <span className="text-sm">{stat.icon}</span>
                      </div>
                      <div className="text-lg font-bold text-cyan-400 font-mono mt-1">{stat.value}</div>
                    </motion.div>
                  ))}
                  
                  {/* Tech info */}
                  <div className="mt-4 pt-4 border-t border-slate-800 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <div className="text-xs font-mono text-slate-500">NVIDIA NIM Active</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <div className="text-xs font-mono text-slate-500">Vector DB Online</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <div className="text-xs font-mono text-slate-500">Semantic Search Ready</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right: Chat panel - Takes remaining space */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex-1 min-w-0 min-h-0 flex"
              >
                <FinalChatPanel sessionId={sessionId} />
              </motion.div>
            </main>
          </motion.div>
        )}
    </div>
  );
}

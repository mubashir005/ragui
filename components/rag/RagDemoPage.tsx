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
            <header className="relative z-10 border-b border-cyan-400/30 bg-slate-950/50 backdrop-blur-sm shrink-0">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-3 sm:py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-cyan-400 font-mono tracking-tight">
                      ▸ RAG AGENT
                    </h1>
                    <p className="text-slate-400 text-xs font-mono">
                      Pipeline Complete • Ready for Queries
                    </p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs font-mono text-green-400 font-bold">ONLINE</span>
                  </div>
                </div>
              </div>
            </header>

            {/* Main content - Flex grow to fill remaining space */}
            <main className="relative z-10 flex-1 min-h-0 max-w-7xl w-full mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 flex flex-col lg:flex-row gap-4 sm:gap-6">
              {/* Left: Robot with info */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="w-full lg:w-80 shrink-0 flex flex-col"
              >
                {/* Robot */}
                <div className="flex flex-col items-center mb-3 sm:mb-4">
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
                      <RobotAgent mode="float" size={120} />
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
                <div className="grid grid-cols-3 lg:grid-cols-1 gap-2 sm:gap-3 flex-1">
                  {[
                    { 
                      label: "Documents", 
                      value: stats.documents.toString(), 
                      icon: (
                        <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )
                    },
                    { 
                      label: "Index Status", 
                      value: stats.hasIndex ? "Built" : "Pending", 
                      icon: (
                        <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      )
                    },
                    { 
                      label: "System", 
                      value: stats.hasDocs && stats.hasIndex ? "Ready" : "Pending", 
                      icon: stats.hasDocs && stats.hasIndex ? (
                        <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                      )
                    }
                  ].map((stat, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + idx * 0.1 }}
                      className="px-3 py-2 bg-slate-900/60 backdrop-blur-sm border border-cyan-400/20 rounded-lg flex items-center gap-3 min-w-0"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-mono text-slate-400 truncate">{stat.label}</div>
                        <div className="text-sm font-bold text-cyan-400 font-mono truncate">{stat.value}</div>
                      </div>
                      <div className="shrink-0 flex items-center">
                        {stat.icon}
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* Tech info */}
                  <div className="hidden lg:block mt-4 pt-4 border-t border-slate-800 space-y-1.5 col-span-3">
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

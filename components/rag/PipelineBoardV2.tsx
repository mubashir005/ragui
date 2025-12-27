"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RobotAgent from "./RobotAgent";
import RobotSystemBubble from "./RobotSystemBubble";
import FileUploadDialog from "./FileUploadDialog";

type StageStatus = "pending" | "active" | "processing" | "done";

interface PipelineBoardProps {
  onComplete: () => void;
  sessionId: string;
  onSessionReset: (newSessionId: string) => void;
}

// Professional SVG Icons
const StageIcon = ({ type, className = "" }: { type: string; className?: string }) => {
  const icons = {
    document: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    brain: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
    rocket: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
      </svg>
    ),
    checkmark: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
  };
  
  return icons[type as keyof typeof icons] || null;
};

const STAGES = [
  {
    id: 0,
    title: "Document Ingestion",
    description: "Upload and parse documents into the RAG system",
    icon: "document",
    techChips: ["PDF Parser", "Text Extraction", "Multi-format"],
    actionLabel: "UPLOAD DOCUMENTS",
    narration: ["Initializing document ingestion pipeline...", "Ready to accept file uploads."],
  },
  {
    id: 1,
    title: "Vector Embedding",
    description: "Process documents and build semantic index",
    icon: "brain",
    techChips: ["NVIDIA NIM", "Embedding Model", "Vector DB"],
    actionLabel: "BUILD INDEX",
    narration: ["Chunking documents into segments...", "Generating embeddings...", "Building vector index..."],
  },
  {
    id: 2,
    title: "RAG Agent Ready",
    description: "Semantic search and AI-powered Q&A enabled",
    icon: "rocket",
    techChips: ["Semantic Search", "LLM Integration", "Real-time"],
    actionLabel: "ENTER RAG ENVIRONMENT",
    narration: ["RAG pipeline complete!", "Agent is ready for queries."],
  },
];

export default function PipelineBoardV2({ onComplete, sessionId, onSessionReset }: PipelineBoardProps) {
  const [activeStage, setActiveStage] = useState(0);
  const [stageStatuses, setStageStatuses] = useState<StageStatus[]>(["active", "pending", "pending"]);
  const [robotPosition, setRobotPosition] = useState(0);
  const [robotMode, setRobotMode] = useState<"idle" | "walk" | "wave" | "float">("wave");
  const [showNarration, setShowNarration] = useState(true); // Show immediately on load
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [stagePositions, setStagePositions] = useState<number[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const containerRef = useRef<HTMLDivElement>(null);
  const stageRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Calculate stage positions for robot movement
  useEffect(() => {
    if (!containerRef.current) return;

    const positions = stageRefs.current.map((ref) => {
      if (!ref) return 0;
      const rect = ref.getBoundingClientRect();
      const containerRect = containerRef.current!.getBoundingClientRect();
      return rect.left - containerRect.left + rect.width / 2;
    });

    setStagePositions(positions);
  }, []);

  // Show narration when stage becomes active
  useEffect(() => {
    if (stageStatuses[activeStage] === "active") {
      setShowNarration(true);
      setTimeout(() => setShowNarration(false), 6000); // Show for 6 seconds
    }
  }, [activeStage, stageStatuses]);

  /**
   * Upload handler for Stage 0
   */
  const handleUpload = useCallback(async (files: File[]) => {
    setShowUploadModal(false);
    setStageStatuses((prev) => {
      const next = [...prev];
      next[0] = "processing";
      return next;
    });

    try {
      // Simple single file upload (UI now restricts to 1 file)
      const { uploadDocuments } = await import("../../lib/api");
      await uploadDocuments(files, sessionId);

      setStageStatuses((prev) => {
        const next = [...prev];
        next[0] = "done";
        return next;
      });

      advanceToNextStage();
    } catch (error) {
      console.error("Upload error:", error);
      setErrorMessage((error as Error)?.message || "Upload failed");
      setStageStatuses((prev) => {
        const next = [...prev];
        next[0] = "active";
        return next;
      });
    }
  }, [sessionId]);

  /**
   * Advance to next stage
   */
  const advanceToNextStage = useCallback(() => {
    const nextStage = activeStage + 1;
    if (nextStage >= STAGES.length) return;

    // Animate robot walking
    setRobotMode("walk");

    setTimeout(() => {
      setRobotPosition(nextStage);
      setActiveStage(nextStage);

      setStageStatuses((prev) => {
        const next = [...prev];
        next[nextStage] = "active";
        return next;
      });

      // Robot arrives at destination
      setTimeout(() => {
        setRobotMode("wave");
        setTimeout(() => setRobotMode("idle"), 1000);
      }, 800);
    }, 300);
  }, [activeStage]);

  /**
   * Stage action handler
   */
  const handleStageAction = useCallback(
    async (stageIndex: number) => {
      if (stageIndex === 0) {
        setShowUploadModal(true);
        return;
      }

      setErrorMessage(""); // Clear previous errors
      setStageStatuses((prev) => {
        const next = [...prev];
        next[stageIndex] = "processing";
        return next;
      });

      try {
        if (stageIndex === 1) {
          const { buildIndex, getStatus } = await import("../../lib/api");
          
          console.log(`📊 [STAGE 1] Checking status for session: ${sessionId}`);
          
          // Check if documents exist before building
          try {
            const status = await getStatus(sessionId);
            console.log(`📊 [STAGE 1] Status response:`, status);
            console.log(`📊 [STAGE 1] Has docs: ${status.has_docs}`);
            console.log(`📊 [STAGE 1] Has index: ${status.has_index}`);
            
            if (!status.has_docs) {
              throw new Error('No documents uploaded yet. Please upload documents first (Stage 1).');
            }
          } catch (statusErr: any) {
            console.error(`📊 [STAGE 1] Status check error:`, statusErr);
            // If status check fails, it might be a new session
            if (statusErr.message.includes('No documents')) {
              throw statusErr;
            }
            // Otherwise continue - the session might exist but status endpoint failed
            console.warn('📊 [STAGE 1] Status check failed, proceeding with build:', statusErr);
          }
          
          console.log(`📊 [STAGE 1] Starting build index...`);
          await buildIndex(sessionId);
          console.log(`📊 [STAGE 1] Build completed successfully!`);
        } else {
          await new Promise((r) => setTimeout(r, 2000));
        }

        setStageStatuses((prev) => {
          const next = [...prev];
          next[stageIndex] = "done";
          return next;
        });

        if (stageIndex + 1 < STAGES.length) {
          advanceToNextStage();
        } else {
          setTimeout(() => onComplete(), 1000);
        }
      } catch (error: any) {
        console.error(`Stage ${stageIndex} error:`, error);
        const errorMsg = error?.message || "An error occurred during processing";
        setErrorMessage(errorMsg);
        
        setStageStatuses((prev) => {
          const next = [...prev];
          next[stageIndex] = "active";
          return next;
        });
      }
    },
    [onComplete, advanceToNextStage]
  );

  return (
    <div className="min-h-screen bg-[#0a0f1e] relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(#00d9ff 1px, transparent 1px), linear-gradient(90deg, #00d9ff 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 border-b border-cyan-400/20 bg-slate-900/50 backdrop-blur-xl px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-cyan-400 font-mono">▸ RAG PIPELINE</h1>
            <p className="text-xs sm:text-sm text-slate-400 font-mono mt-1">
              Interactive Demo • Stage {activeStage + 1} of {STAGES.length}
            </p>
          </div>
          <div className="flex gap-2">
            {STAGES.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 w-12 rounded-full transition-all ${
                  stageStatuses[idx] === "done"
                    ? "bg-green-400"
                    : stageStatuses[idx] === "active"
                    ? "bg-cyan-400 animate-pulse"
                    : stageStatuses[idx] === "processing"
                    ? "bg-yellow-400 animate-pulse"
                    : "bg-slate-700"
                }`}
              />
            ))}
          </div>
        </div>
      </motion.header>

      {/* Error Message Banner */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative z-10 bg-red-500/10 border-b border-red-500/30 px-8 py-4"
          >
            <div className="max-w-7xl mx-auto">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-300 mb-1">Build Error</p>
                    <p className="text-xs text-red-200/80 whitespace-pre-line">{errorMessage}</p>
                    <div className="mt-3 p-3 bg-slate-900/50 border border-yellow-500/20 rounded text-xs text-slate-300">
                      <p className="font-semibold text-yellow-300 mb-2">� Troubleshooting Tips:</p>
                      <ul className="space-y-1 list-disc list-inside text-slate-400">
                        <li>Try uploading <strong>one file at a time</strong></li>
                        <li>If session is corrupted, <strong>refresh the page</strong> and start fresh</li>
                        <li>Large files may take longer - wait 30-60 seconds before retrying</li>
                        <li>Check browser console (F12) for detailed errors</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      // Generate fresh session ID
                      const { generateSessionId } = await import("../../lib/api");
                      const newSessionId = generateSessionId();
                      onSessionReset(newSessionId);
                      
                      // Reset to stage 0 to allow re-upload
                      setActiveStage(0);
                      setRobotPosition(0);
                      setStageStatuses(["active", "pending", "pending"]);
                      setErrorMessage("");
                      
                      console.log(`🔄 Session reset. New session ID: ${newSessionId}`);
                    }}
                    className="px-4 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/40 rounded text-xs font-semibold text-yellow-200 transition-colors whitespace-nowrap"
                  >
                    START OVER
                  </button>
                  <button
                    onClick={() => handleStageAction(1)}
                    className="px-4 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 rounded text-xs font-semibold text-red-200 transition-colors whitespace-nowrap"
                  >
                    RETRY BUILD
                  </button>
                  <button
                    onClick={() => setErrorMessage("")}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Pipeline Container */}
      <main ref={containerRef} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16">
        {/* Connector Line (SVG Path) - Hidden on mobile */}
        <svg
          className="hidden md:block absolute top-24 sm:top-28 md:top-32 left-0 w-full h-32 pointer-events-none"
          style={{ zIndex: 5 }}
        >
          <motion.path
            d={`M ${stagePositions[0] || 0} 64 L ${stagePositions[1] || 300} 64 L ${stagePositions[2] || 600} 64`}
            stroke="url(#gradient)"
            strokeWidth="3"
            fill="none"
            strokeDasharray="10 5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: (activeStage + 1) / STAGES.length }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="1" />
            </linearGradient>
          </defs>
        </svg>

        {/* Hero Robot Agent - Hidden on mobile to avoid overlap */}
        <motion.div
          className="hidden md:block absolute top-16 sm:top-18 md:top-20 z-20 pointer-events-none"
          initial={{ x: 0 }}
          animate={{
            x: stagePositions[robotPosition] || 0,
            transition: { type: "spring", stiffness: 60, damping: 15, mass: 0.8 },
          }}
          style={{ transformOrigin: "center bottom" }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: showNarration ? 1.1 : 1, 
              opacity: 1 
            }}
            className="relative"
          >
            {/* Make robot 3x bigger */}
            <div className="scale-[2.5] transform-gpu">
              <RobotAgent mode={robotMode} />
            </div>
            
            {/* Robot glow effect */}
            <motion.div
              className="absolute inset-0 rounded-full blur-3xl"
              style={{
                background: "radial-gradient(circle, rgba(6,182,212,0.6) 0%, transparent 70%)",
              }}
              animate={{
                scale: showNarration ? [1, 1.3, 1] : [1, 1.2, 1],
                opacity: showNarration ? [0.7, 1, 0.7] : [0.5, 0.8, 0.5],
              }}
              transition={{ duration: showNarration ? 0.5 : 2, repeat: Infinity }}
            />

            {/* Speech indicator when talking */}
            <AnimatePresence>
              {showNarration && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0.8, 1.2, 1], opacity: [0, 1, 1] }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute -top-4 -right-4 w-8 h-8"
                >
                  <div className="relative w-full h-full">
                    {/* Sound waves */}
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="absolute top-1/2 left-1/2 w-2 h-2 bg-cyan-400 rounded-full"
                        animate={{
                          x: [0, 15 * (i + 1)],
                          y: [0, -10 + i * 5],
                          opacity: [1, 0],
                          scale: [1, 0.5],
                        }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Narration Bubble - Position based on robot stage */}
            <AnimatePresence>
              {showNarration && (
                <motion.div
                  initial={{ opacity: 0, x: robotPosition === 2 ? 20 : -20, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: robotPosition === 2 ? -20 : 20, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className={`absolute top-0 w-80 z-50 ${
                    robotPosition === 2 
                      ? 'right-full mr-8' 
                      : 'left-full ml-8'
                  }`}
                  style={{ 
                    transformOrigin: robotPosition === 2 ? "right center" : "left center"
                  }}
                >
                  <RobotSystemBubble
                    lines={STAGES[activeStage].narration}
                    visible={showNarration}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* Stage Nodes */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mt-8 md:mt-32 lg:mt-40 xl:mt-48">
          <AnimatePresence mode="wait">
            {STAGES.map((stage, idx) => {
              const isActive = activeStage === idx;
              const status = stageStatuses[idx];
              const isCollapsed = !isActive;

              return (
                <motion.div
                  key={stage.id}
                  ref={(el) => { stageRefs.current[idx] = el; }}
                  layout
                  layoutId={`stage-${stage.id}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: 1,
                    scale: isActive ? 1 : 0.85,
                  }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{
                    layout: { type: "spring", stiffness: 200, damping: 25 },
                  }}
                  className={`relative ${isCollapsed ? "cursor-default" : ""}`}
                >
                  {/* Collapsed Node (Icon Only) */}
                  {isCollapsed && (
                    <motion.div
                      layoutId={`node-${stage.id}`}
                      className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center border-2 ${
                        status === "done"
                          ? "bg-green-500/20 border-green-400 text-green-400"
                          : status === "pending"
                          ? "bg-slate-800/50 border-slate-600 text-slate-500"
                          : "bg-yellow-500/20 border-yellow-400 text-yellow-400"
                      }`}
                    >
                      {status === "done" ? (
                        <StageIcon type="checkmark" className="w-12 h-12" />
                      ) : (
                        <StageIcon type={stage.icon} className="w-12 h-12" />
                      )}
                    </motion.div>
                  )}

                  {/* Expanded Stage Card (Active Only) */}
                  {isActive && (
                    <motion.div
                      layoutId={`card-${stage.id}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-slate-900/80 backdrop-blur-xl border-2 border-cyan-400/50 rounded-2xl p-6 shadow-[0_0_40px_rgba(6,182,212,0.3)]"
                    >
                      {/* Stage Icon */}
                      <div className="flex justify-center mb-4">
                        <div className="w-24 h-24 rounded-full bg-cyan-500/10 border-2 border-cyan-400/50 flex items-center justify-center text-cyan-400">
                          <StageIcon type={stage.icon} className="w-12 h-12" />
                        </div>
                      </div>

                      {/* Stage Title */}
                      <h3 className="text-2xl font-bold text-white text-center mb-2">
                        {stage.title}
                      </h3>

                      {/* Stage Description */}
                      <p className="text-sm text-slate-400 text-center mb-4">
                        {stage.description}
                      </p>

                      {/* Tech Chips */}
                      <div className="flex flex-wrap gap-2 justify-center mb-6">
                        {stage.techChips.map((chip, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-cyan-500/10 border border-cyan-400/30 rounded-full text-xs text-cyan-400 font-mono"
                          >
                            {chip}
                          </span>
                        ))}
                      </div>

                      {/* Status Indicator */}
                      <div className="text-center mb-4">
                        {status === "processing" ? (
                          <div className="flex items-center justify-center gap-2 text-yellow-400">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full"
                            />
                            <span className="font-mono text-sm">PROCESSING...</span>
                          </div>
                        ) : status === "done" ? (
                          <div className="text-green-400 font-mono text-sm">
                            ✓ COMPLETE
                          </div>
                        ) : (
                          <div className="text-cyan-400 font-mono text-sm">
                            ⚡ READY
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      {status === "active" && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleStageAction(idx)}
                          className="w-full py-3 bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold font-mono rounded-xl shadow-lg transition-all"
                        >
                          {stage.actionLabel}
                        </motion.button>
                      )}
                    </motion.div>
                  )}

                  {/* Stage Label (Below Node) */}
                  {isCollapsed && (
                    <motion.div
                      className="mt-4 text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="text-xs font-mono text-slate-500">{stage.title}</div>
                      {status === "done" && (
                        <div className="text-xs font-mono text-green-400 mt-1">✓ Complete</div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </main>

      {/* Upload Modal */}
      <FileUploadDialog
        show={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUpload}
      />
    </div>
  );
}

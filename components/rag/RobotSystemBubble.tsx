"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RobotSystemBubbleProps {
  lines: string[];
  visible: boolean;
  onComplete?: () => void;
}

/**
 * System-style speech bubble for the robot guide
 * - Pixelated terminal aesthetic
 * - Typewriter effect
 * - System narration tone
 */
export default function RobotSystemBubble({
  lines,
  visible,
  onComplete,
}: RobotSystemBubbleProps) {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  /* ================= RESET WHEN SHOWN ================= */
  useEffect(() => {
    if (visible) {
      setDisplayedLines([]);
      setCurrentLineIndex(0);
      setCurrentCharIndex(0);
    }
  }, [visible, lines]);

  /* ================= TYPEWRITER ================= */
  useEffect(() => {
    if (!visible) return;

    if (currentLineIndex >= lines.length) {
      onComplete?.();
      return;
    }

    const currentLine = lines[currentLineIndex];

    if (currentCharIndex < currentLine.length) {
      const timer = setTimeout(() => {
        setDisplayedLines((prev) => {
          const next = [...prev];
          next[currentLineIndex] = currentLine.slice(0, currentCharIndex + 1);
          return next;
        });
        setCurrentCharIndex((i) => i + 1);
      }, 28);

      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setCurrentLineIndex((i) => i + 1);
        setCurrentCharIndex(0);
      }, 420);

      return () => clearTimeout(timer);
    }
  }, [visible, lines, currentLineIndex, currentCharIndex, onComplete]);

  /* ================= CURSOR BLINK ================= */
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor((c) => !c);
    }, 480);
    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.96 }}
        transition={{ duration: 0.18 }}
        className="relative pointer-events-none"
        style={{ imageRendering: "pixelated" }}
      >
        {/* ================= BUBBLE ================= */}
        <div className="relative bg-[#0b1224] border-4 border-cyan-400 rounded-sm shadow-[0_0_22px_rgba(6,182,212,0.45)] min-w-[300px] max-w-[440px]">
          
          {/* Header */}
          <div className="flex items-center gap-2 px-3 py-2 bg-cyan-400/10 border-b-2 border-cyan-400/30">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-cyan-400 tracking-widest uppercase">
              SYSTEM GUIDE
            </span>
          </div>

          {/* Content */}
          <div className="px-4 py-3 space-y-1">
            {displayedLines.map((line, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 font-mono text-xs text-green-400"
              >
                <span className="text-cyan-400 shrink-0">›</span>
                <span className="leading-relaxed">
                  {line}
                  {idx === currentLineIndex && showCursor && (
                    <span className="inline-block w-2 h-3 ml-1 bg-green-400 align-middle" />
                  )}
                </span>
              </div>
            ))}
          </div>

          {/* Speech notch */}
          <div
            className="absolute -bottom-2 left-8 w-4 h-2 bg-cyan-400"
            style={{ clipPath: "polygon(0 0, 50% 100%, 100% 0)" }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { askQuestion, AskResponse } from "../../lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  at: string;
  top_score?: number;
  top_sources?: AskResponse["top_sources"];
}

interface FinalChatPanelProps {
  sessionId: string;
}

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

export default function FinalChatPanel({ sessionId }: FinalChatPanelProps) {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [topK, setTopK] = useState(5);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  const handleSend = async () => {
    const q = query.trim();
    if (!q || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: q,
      at: nowISO(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setQuery("");
    setIsLoading(true);
    setError("");

    try {
      // Call your Python FastAPI backend
      const response = await askQuestion(q, sessionId, topK);
      
      console.log("API Response:", response);
      console.log("Answer:", response.answer);
      console.log("Top Score:", response.top_score);
      console.log("Top Sources:", response.top_sources);

      const assistantMessage: Message = {
        role: "assistant",
        content: response.answer || response.query || "No answer received from the API.",
        at: nowISO(),
        top_score: response.top_score,
        top_sources: response.top_sources,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMsg = err?.message || "Query failed";
      setError(errorMsg);
      
      const errorMessage: Message = {
        role: "assistant",
        content: `ERROR: ${errorMsg}. Please make sure documents are uploaded and the index is built.`,
        at: nowISO(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/90 backdrop-blur-xl border border-cyan-400/30 rounded-2xl shadow-xl overflow-hidden flex flex-col w-full h-full"
    >
      {/* Compact Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <h2 className="text-lg font-semibold text-white">Ask Your Documents</h2>
        </div>
        
        {/* Top-K selector moved to header */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Results:</span>
          <select
            value={topK}
            onChange={(e) => setTopK(Number(e.target.value))}
            className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-sm text-cyan-400 focus:outline-none focus:border-cyan-400 transition-colors"
          >
            <option value={3}>Top 3</option>
            <option value={5}>Top 5</option>
            <option value={10}>Top 10</option>
          </select>
        </div>
      </div>

      {/* Messages Container - Fixed with internal scroll */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 mb-4 rounded-full bg-cyan-500/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <p className="text-slate-400 text-sm">Ask a question about your documents</p>
            <p className="text-slate-600 text-xs mt-1">Get instant answers with source citations</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  msg.role === "user"
                    ? "bg-cyan-500/20 border border-cyan-500/30"
                    : "bg-slate-800/70 border border-slate-700"
                }`}
              >
                {/* Message content */}
                <div className="text-sm text-slate-100 leading-relaxed">
                  {msg.content}
                </div>
                
                {/* Metadata footer */}
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                  <span>{prettyTime(msg.at)}</span>
                  {msg.top_score !== undefined && (
                    <span className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded text-cyan-400 text-xs">
                      {(msg.top_score * 100).toFixed(0)}% match
                    </span>
                  )}
                </div>

                {/* Source citations */}
                {msg.role === "assistant" && msg.top_sources && msg.top_sources.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    <div className="text-xs text-slate-400 font-medium">Sources:</div>
                    {msg.top_sources.map((source, i) => (
                      <div
                        key={i}
                        className="text-xs px-2 py-1.5 bg-slate-900/50 border border-slate-700 rounded flex items-center justify-between"
                      >
                        <span className="text-slate-300">📄 {source.source}</span>
                        <span className="text-slate-500 ml-2">{(source.score * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}

        <div ref={scrollRef} />

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="max-w-[80%] rounded-2xl p-4 bg-slate-800/70 border border-slate-700 flex items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full"
              />
              <span className="text-sm text-slate-400">Thinking...</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Section - Fixed at bottom */}
      <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/50">
        {/* Error message */}
        {error && (
          <div className="mb-3 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-300 flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !isLoading && handleSend()}
            placeholder="Type your question..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 disabled:opacity-50 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!query.trim() || isLoading}
            className={`px-6 py-3 rounded-xl font-medium text-sm transition-all ${
              query.trim() && !isLoading
                ? "bg-cyan-500 hover:bg-cyan-400 text-slate-900 shadow-lg hover:shadow-cyan-400/30"
                : "bg-slate-800 text-slate-600 cursor-not-allowed"
            }`}
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-slate-600 border-t-transparent rounded-full"
              />
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

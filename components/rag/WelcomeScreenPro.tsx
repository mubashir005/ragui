"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface WelcomeScreenProProps {
  onStart: () => void;
}

/**
 * TeacherBot Component - Pixel Art Robot with Animations
 */
const TeacherBot = ({ className = "w-64 h-64" }: { className?: string }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 220 220"
      role="img"
      aria-label="Pixel Teacher Bot"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
    >
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.2" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="
           0 0 0 0 0
           0 0 0 0 0.9
           0 0 0 0 1
           0 0 0 .9 0"
            result="cyan"
          />
          <feMerge>
            <feMergeNode in="cyan" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feOffset dx="0" dy="2" />
          <feGaussianBlur stdDeviation="1.2" result="s" />
          <feColorMatrix
            in="s"
            type="matrix"
            values="0 0 0 0 0
                 0 0 0 0 0
                 0 0 0 0 0
                 0 0 0 .35 0"
          />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <style>
          {`
       .bot { transform-origin: 110px 130px; animation: bob 2.4s ease-in-out infinite; }
       .screenGlow { filter: url(#glow); }
       .blink { transform-origin: 110px 88px; animation: blink 5.5s infinite; }
       .waveArm { transform-origin: 62px 124px; animation: wave 2.8s ease-in-out infinite; }
       .antenna { transform-origin: 110px 44px; animation: antenna 1.8s ease-in-out infinite; }
       @keyframes bob { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-4px); } }
       @keyframes blink { 0%, 92%, 100% { transform: scaleY(1); } 94% { transform: scaleY(0.12); } 96% { transform: scaleY(1); } }
       @keyframes wave { 0%, 55%, 100% { transform: rotate(0deg); } 65% { transform: rotate(-18deg); } 75% { transform: rotate(12deg); } 85% { transform: rotate(-10deg); } }
       @keyframes antenna { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(6deg); } }
     `}
        </style>
      </defs>

      {/* Shadow */}
      <g opacity="0.35">
        <rect x="70" y="196" width="80" height="8" rx="2" fill="#7aa7b2" />
        <rect x="78" y="192" width="64" height="4" rx="2" fill="#7aa7b2" />
      </g>

      {/* Main Bot */}
      <g className="bot" filter="url(#shadow)">
        {/* Antenna */}
        <g className="antenna">
          <rect x="106" y="18" width="8" height="18" fill="#cfd7e6" />
          <rect x="104" y="16" width="12" height="4" fill="#9aa7bf" />
          <rect x="102" y="8" width="16" height="8" fill="#cfd7e6" />
          <rect x="106" y="10" width="8" height="4" fill="#00e5ff" />
        </g>

        {/* Head */}
        <rect x="58" y="40" width="104" height="70" rx="10" fill="#e9eef7" />
        <rect x="56" y="44" width="2" height="58" fill="#a6b3c8" />
        <rect x="162" y="44" width="2" height="58" fill="#a6b3c8" />
        <rect x="62" y="38" width="96" height="2" fill="#a6b3c8" />
        <rect x="62" y="110" width="96" height="2" fill="#a6b3c8" />

        {/* Screen */}
        <rect x="72" y="56" width="76" height="44" rx="8" fill="#0b1020" className="screenGlow" />
        <rect x="76" y="60" width="68" height="36" rx="7" fill="#0f1a33" />

        {/* Eyes */}
        <g className="blink">
          <rect x="90" y="74" width="10" height="8" fill="#00e5ff" />
          <rect x="120" y="74" width="10" height="8" fill="#00e5ff" />
          <rect x="92" y="76" width="2" height="2" fill="#eaffff" />
          <rect x="122" y="76" width="2" height="2" fill="#eaffff" />
        </g>

        {/* Mouth */}
        <rect x="104" y="86" width="12" height="2" fill="#00e5ff" />
        <rect x="102" y="84" width="2" height="2" fill="#00e5ff" />
        <rect x="116" y="84" width="2" height="2" fill="#00e5ff" />

        {/* Badge */}
        <rect x="140" y="46" width="16" height="10" rx="2" fill="#ffd166" />
        <rect x="142" y="48" width="12" height="2" fill="#1a2238" />
        <rect x="142" y="52" width="8" height="2" fill="#1a2238" />

        {/* Neck */}
        <rect x="98" y="110" width="24" height="10" fill="#cfd7e6" />

        {/* Body */}
        <rect x="66" y="120" width="88" height="62" rx="12" fill="#e9eef7" />
        <rect x="66" y="120" width="88" height="4" fill="#cfd7e6" />

        {/* Chest Screen */}
        <rect x="88" y="136" width="44" height="28" rx="6" fill="#d7deec" />
        <rect x="92" y="140" width="36" height="20" rx="5" fill="#0f1a33" className="screenGlow" />
        <rect x="98" y="146" width="8" height="10" fill="#00e5ff" />
        <rect x="112" y="146" width="8" height="10" fill="#00e5ff" />
        <rect x="98" y="144" width="22" height="2" fill="#00e5ff" />

        {/* Left Arm (Waving) */}
        <g className="waveArm">
          <rect x="46" y="132" width="24" height="14" rx="6" fill="#cfd7e6" />
          <rect x="38" y="138" width="12" height="12" rx="4" fill="#e9eef7" />
          <rect x="34" y="142" width="6" height="6" fill="#00e5ff" />
        </g>

        {/* Right Arm */}
        <g>
          <rect x="150" y="132" width="24" height="14" rx="6" fill="#cfd7e6" />
          <rect x="170" y="138" width="12" height="12" rx="4" fill="#e9eef7" />
          <rect x="176" y="142" width="6" height="6" fill="#00e5ff" />
        </g>

        {/* Legs */}
        <rect x="82" y="182" width="22" height="18" rx="6" fill="#cfd7e6" />
        <rect x="116" y="182" width="22" height="18" rx="6" fill="#cfd7e6" />

        {/* Feet */}
        <rect x="78" y="198" width="30" height="10" rx="4" fill="#1a2238" />
        <rect x="112" y="198" width="30" height="10" rx="4" fill="#1a2238" />

        {/* Belt Light */}
        <rect x="78" y="174" width="64" height="4" fill="#00e5ff" opacity="0.75" className="screenGlow" />
      </g>
    </svg>
  );
};

/**
 * Professional Welcome Screen with Pixel Art Robot
 * Features: Grid background, spotlight effect, spring physics, staggered reveal
 */
const WelcomeScreenPro: React.FC<WelcomeScreenProProps> = ({ onStart }) => {
  const [isHovering, setIsHovering] = useState(false);

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: [0.6, 0.01, 0.05, 0.95] as any } }
  };

  const botVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1, 
      transition: { 
        type: "spring" as const,
        stiffness: 260,
        damping: 20,
        delay: 0.2
      } 
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative h-screen w-full bg-slate-950 flex flex-col items-center justify-center overflow-hidden font-sans text-white"
    >
      
      {/* 1. Animated Background Grid */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(to right, #80808012 1px, transparent 1px), linear-gradient(to bottom, #80808012 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto w-80 h-80 rounded-full bg-cyan-500 opacity-20" style={{ filter: 'blur(100px)' }}></div>
      </div>

      <motion.div 
        className="z-10 flex flex-col items-center max-w-2xl px-4 sm:px-6 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        
        {/* 2. Badge / Tagline */}
        <motion.div variants={itemVariants} className="mb-4 sm:mb-6">
          <span className="px-3 py-1 rounded-full bg-cyan-900/30 border border-cyan-500/30 text-cyan-400 text-xs font-mono tracking-widest uppercase">
            System Online • v2.4.0
          </span>
        </motion.div>

        {/* 3. The Hero Bot - Large Size with Spotlight */}
        <motion.div 
          variants={botVariants}
          className="relative mb-6 sm:mb-8"
        >
          {/* Spotlight Glow behind bot */}
          <div className="absolute inset-0 bg-cyan-400/20 blur-3xl rounded-full scale-110" />
          
          {/* The SVG Component */}
          <TeacherBot className="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 drop-shadow-2xl relative z-10" />
        </motion.div>

        {/* 4. Main Titles */}
        <motion.div variants={itemVariants} className="space-y-3 sm:space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight text-white">
            RAG Agent <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-indigo-500">Lab</span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg md:text-xl max-w-lg mx-auto leading-relaxed px-4">
            Your personal AI architect. Initialize the pipeline to begin ingestion, processing, and semantic retrieval.
          </p>
        </motion.div>

        {/* 5. Call to Action Button */}
        <motion.div 
          variants={itemVariants}
          className="mt-6 sm:mt-8"
        >
          <button 
            onClick={onStart}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-transparent overflow-hidden rounded-xl transition-all duration-300"
          >
            {/* Button Background & Border Gradient */}
            <div className="absolute inset-0 w-full h-full bg-linear-to-r from-cyan-500/10 to-indigo-500/10 border border-cyan-500/30 group-hover:border-cyan-400 rounded-xl transition-all duration-300"></div>
            
            {/* Hover Fill Effect */}
            <div className={`absolute inset-0 w-full h-full bg-cyan-500/10 transition-transform duration-300 origin-left ${isHovering ? 'scale-x-100' : 'scale-x-0'}`}></div>

            <div className="relative flex items-center space-x-2 sm:space-x-3">
              <span className="text-cyan-100 text-sm sm:text-base font-semibold tracking-wide group-hover:text-white transition-colors">
                INITIALIZE PIPELINE
              </span>
              <svg 
                className={`w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 transform transition-transform duration-300 ${isHovering ? 'translate-x-1' : ''}`} 
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </button>
        </motion.div>

        {/* 6. Developer Attribution */}
        <motion.div 
          variants={itemVariants}
          className="mt-6 sm:mt-8 flex flex-col items-center gap-2"
        >
          <div className="flex items-center gap-2 text-xs sm:text-sm text-cyan-400/70">
            <span className="tracking-wide">Developed by</span>
            <span className="font-semibold text-cyan-300">Mubashir-Ul-Hassan</span>
          </div>
          <a 
            href="https://github.com/mubashir005/production-rag-agent" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-cyan-400 transition-colors duration-200 group"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            <span className="tracking-wider group-hover:translate-x-1 transition-transform duration-200">github.com/mubashir005/production-rag-agent</span>
          </a>
        </motion.div>

      </motion.div>

      {/* 7. Footer Tech Stack */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-6 text-slate-600 text-xs uppercase tracking-widest"
      >
        Powered by Next.js • Vector Store • LLM
      </motion.div>
    </motion.div>
  );
};

export default WelcomeScreenPro;

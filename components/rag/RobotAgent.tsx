"use client";

import React from "react";

type RobotMode = "idle" | "walk" | "wave" | "float";

interface RobotAgentProps {
  mode?: RobotMode;
  size?: number;
  className?: string;
}

/**
 * Pixel-style robotic guide agent
 * Modes:
 * - idle  → subtle breathing
 * - walk  → stage-to-stage movement
 * - wave  → welcome / instruction
 * - float → completion / ready state
 */
export default function RobotAgent({
  mode = "idle",
  size = 80,
  className = "",
}: RobotAgentProps) {
  const modeClass = `robot-${mode}`;

  return (
    <div
      className={`${className} ${modeClass}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="crispEdges"
        style={{ imageRendering: "pixelated" }}
      >
        <style>{`
          /* ================= CORE STATES ================= */

          .robot-idle .body { animation: idleBob 2.2s ease-in-out infinite; }
          .robot-walk .body { animation: walkBob 0.5s linear infinite; }
          .robot-wave .arm-right { animation: wave 0.8s ease-in-out infinite; }
          .robot-float .body { animation: float 3s ease-in-out infinite; }

          .robot-walk .leg-left  { animation: legLeft 0.5s linear infinite; }
          .robot-walk .leg-right { animation: legRight 0.5s linear infinite; }
          .robot-walk .arm-left  { animation: armLeft 0.5s linear infinite; }
          .robot-walk .arm-right { animation: armRight 0.5s linear infinite; }

          .eye { animation: blink 4.5s infinite; }

          /* ================= ANIMATIONS ================= */

          @keyframes idleBob {
            0%,100% { transform: translateY(0); }
            50% { transform: translateY(-2px); }
          }

          @keyframes walkBob {
            0%,100% { transform: translateY(0); }
            50% { transform: translateY(-1px); }
          }

          @keyframes legLeft {
            0%,100% { transform: translateX(0); }
            50% { transform: translateX(-1px); }
          }

          @keyframes legRight {
            0%,100% { transform: translateX(0); }
            50% { transform: translateX(1px); }
          }

          @keyframes armLeft {
            0%,100% { transform: rotate(0deg); }
            50% { transform: rotate(12deg); }
          }

          @keyframes armRight {
            0%,100% { transform: rotate(0deg); }
            50% { transform: rotate(-12deg); }
          }

          @keyframes wave {
            0%,100% { transform: rotate(0deg); }
            25% { transform: rotate(-30deg); }
            75% { transform: rotate(20deg); }
          }

          @keyframes float {
            0%,100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }

          @keyframes blink {
            0%,92%,100% { transform: scaleY(1); }
            94%,96% { transform: scaleY(0.15); }
          }
        `}</style>

        {/* Ground shadow */}
        <ellipse cx="50" cy="92" rx="15" ry="3" fill="#000" opacity="0.25" />

        {/* ================= ROBOT BODY ================= */}
        <g className="body" style={{ transformOrigin: "50px 50px" }}>
          {/* Antenna */}
          <rect x="48" y="20" width="4" height="8" fill="#22d3ee" />
          <circle cx="50" cy="18" r="3" fill="#22d3ee">
            <animate
              attributeName="opacity"
              values="0.6;1;0.6"
              dur="1.2s"
              repeatCount="indefinite"
            />
          </circle>

          {/* Head */}
          <rect x="38" y="28" width="24" height="20" rx="2" fill="#e5e7eb" />
          <rect x="40" y="30" width="20" height="16" rx="1" fill="#020617" />

          {/* Eyes */}
          <g className="eye" style={{ transformOrigin: "45px 38px" }}>
            <rect x="43" y="36" width="4" height="4" fill="#22d3ee" />
          </g>
          <g className="eye" style={{ transformOrigin: "55px 38px" }}>
            <rect x="53" y="36" width="4" height="4" fill="#22d3ee" />
          </g>

          {/* Mouth */}
          <rect x="46" y="42" width="8" height="2" fill="#22d3ee" />

          {/* Torso */}
          <rect x="40" y="48" width="20" height="20" rx="2" fill="#d1d5db" />
          <rect x="44" y="52" width="12" height="12" rx="1" fill="#020617" />
          <circle cx="50" cy="58" r="3" fill="#22d3ee" opacity="0.7" />

          {/* Arms */}
          <g className="arm-left" style={{ transformOrigin: "38px 54px" }}>
            <rect x="32" y="50" width="8" height="4" rx="1" fill="#c7c7c7" />
            <rect x="28" y="52" width="6" height="6" rx="1" fill="#a1a1aa" />
          </g>
          <g className="arm-right" style={{ transformOrigin: "62px 54px" }}>
            <rect x="60" y="50" width="8" height="4" rx="1" fill="#c7c7c7" />
            <rect x="66" y="52" width="6" height="6" rx="1" fill="#a1a1aa" />
          </g>

          {/* Legs */}
          <g className="leg-left">
            <rect x="42" y="68" width="6" height="12" fill="#9ca3af" />
            <rect x="40" y="78" width="8" height="4" rx="1" fill="#020617" />
          </g>
          <g className="leg-right">
            <rect x="52" y="68" width="6" height="12" fill="#9ca3af" />
            <rect x="50" y="78" width="8" height="4" rx="1" fill="#020617" />
          </g>

          {/* Active / Guide Glow */}
          {(mode === "walk" || mode === "float") && (
            <circle
              cx="50"
              cy="50"
              r="36"
              fill="none"
              stroke="#22d3ee"
              strokeWidth="1"
              opacity="0.35"
            >
              <animate
                attributeName="r"
                values="36;40;36"
                dur="1.2s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.35;0.15;0.35"
                dur="1.2s"
                repeatCount="indefinite"
              />
            </circle>
          )}
        </g>
      </svg>
    </div>
  );
}

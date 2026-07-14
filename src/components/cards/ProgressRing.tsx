"use client";

import React from "react";
import { motion } from "framer-motion";

interface ProgressRingProps {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  centerText?: string;
  subText?: string;
}

export default function ProgressRing({
  progress,
  size = 200,
  strokeWidth = 16,
  centerText,
  subText,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const strokeDashoffset = circumference - clampedProgress * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#FDF3E5" // saffron-light
          strokeWidth={strokeWidth}
        />
        {/* Active Ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#E89B2D" // saffron
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      {/* Central Label */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        {centerText && (
          <span className={`${size < 120 ? "text-base" : "text-3xl"} font-extrabold text-neutral-800 tracking-tight leading-none`}>
            {centerText}
          </span>
        )}
        {subText && (
          <span className={`${size < 120 ? "text-[8px] mt-0.5 tracking-wider font-bold" : "text-[10px] mt-1.5 tracking-widest font-semibold"} text-neutral-400 uppercase leading-none`}>
            {subText}
          </span>
        )}
      </div>
    </div>
  );
}

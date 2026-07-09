"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, RotateCcw, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { updateChantCountAction } from "@/lib/actions";

interface CounterContentProps {
  initialCount: number;
  initialGoal: number;
  preferredMantra: string | null;
  preferredDeity: string | null;
}

export default function CounterContent({
  initialCount,
  initialGoal,
  preferredMantra,
  preferredDeity,
}: CounterContentProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [count, setCount] = useState(initialCount);
  const goal = initialGoal;
  const [animateKey, setAnimateKey] = useState(0);

  // Auto-save debounce ref
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const latestCountRef = useRef(initialCount);

  // Maintain reference to count for debounced function
  useEffect(() => {
    latestCountRef.current = count;
  }, [count]);

  // Clean up timer on unmount and force save
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        const finalCount = latestCountRef.current;
        if (finalCount !== initialCount) {
          // Fire a fire-and-forget save on unmount if count changed
          const todayStr = new Date().toISOString().split("T")[0];
          updateChantCountAction(todayStr, finalCount, "set");
        }
      }
    };
  }, [initialCount]);

  // Debounced auto-save handler
  const triggerDebouncedSave = (newCount: number) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      const todayStr = new Date().toISOString().split("T")[0];
      try {
        const res = await updateChantCountAction(todayStr, newCount, "set");
        if (res?.error) {
          toast({
            title: "Sync Error",
            description: "Could not save current count to database.",
            variant: "error",
          });
        } else {
          router.refresh();
        }
      } catch (err) {
        console.error("Save error:", err);
      }
    }, 1200); // Wait 1.2s of inactivity before saving
  };

  const handleIncrement = () => {
    const nextCount = count + 1;
    setCount(nextCount);
    setAnimateKey((prev) => prev + 1);
    triggerDebouncedSave(nextCount);

    // Audio click or haptic feedback simulation
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(12); // Short vibration
    }
  };

  const handleDecrement = () => {
    if (count <= 0) return;
    const nextCount = count - 1;
    setCount(nextCount);
    setAnimateKey((prev) => prev + 1);
    triggerDebouncedSave(nextCount);

    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([8, 5, 8]);
    }
  };

  const handleReset = () => {
    if (count === 0) return;
    if (confirm("Are you sure you want to reset today's chants? This will set your count to 0.")) {
      setCount(0);
      triggerDebouncedSave(0);
      toast({
        title: "Counter Reset",
        description: "Your chanting counter has been reset to 0.",
        variant: "info",
      });
    }
  };

  const rounds = Math.floor(count / 108);
  const currentBead = count % 108;
  const progressPercent = goal > 0 ? (count / goal) * 100 : 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] max-w-lg mx-auto py-4 px-4 font-sans select-none">
      
      {/* Deity / Mantra Info */}
      <div className="text-center mb-6">
        {preferredDeity && (
          <span className="text-[10px] font-bold text-saffron uppercase tracking-widest bg-saffron-light px-3 py-1 rounded-full">
            {preferredDeity}
          </span>
        )}
        <h1 className="text-xl font-bold text-neutral-800 tracking-tight mt-2.5">
          {preferredMantra || "Naam Japa Meditation"}
        </h1>
        <p className="text-xs text-neutral-400 font-semibold mt-1">
          Each round is 108 chants. Goal is {goal} ({Math.round(goal / 108)} rounds)
        </p>
      </div>

      {/* Main Large Counter Screen */}
      <div className="relative w-full aspect-square max-w-[340px] rounded-full bg-white border border-neutral-100/70 shadow-xl shadow-neutral-200/40 flex flex-col items-center justify-center mb-8">
        
        {/* Progress Halo Ring */}
        <svg className="absolute inset-0 w-full h-full transform -rotate-95 pointer-events-none p-1">
          <circle
            cx="50%"
            cy="50%"
            r="48%"
            fill="transparent"
            stroke="#FAF8F2"
            strokeWidth="6"
          />
          <motion.circle
            cx="50%"
            cy="50%"
            r="48%"
            fill="transparent"
            stroke="#E89B2D"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 155}`}
            initial={{ strokeDashoffset: `${2 * Math.PI * 155}` }}
            animate={{
              strokeDashoffset: `${2 * Math.PI * 155 * (1 - Math.min(progressPercent, 100) / 100)}`
            }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          />
        </svg>

        {/* Counter Number Display */}
        <div className="flex flex-col items-center z-10">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={animateKey}
              initial={{ opacity: 0.7, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0.7, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              className="text-6xl font-black text-neutral-850 tracking-tighter"
            >
              {count}
            </motion.span>
          </AnimatePresence>

          <span className="text-xs text-neutral-400 font-bold uppercase tracking-widest mt-2">
            Total Chants
          </span>
        </div>

        {/* Sub-metrics overlay */}
        <div className="absolute bottom-10 flex gap-4 text-center z-10">
          <div>
            <p className="text-sm font-bold text-neutral-700 leading-none">{rounds}</p>
            <p className="text-[9px] text-neutral-400 font-semibold uppercase tracking-wider mt-1">Rounds</p>
          </div>
          <div className="border-l border-neutral-100 h-6"></div>
          <div>
            <p className="text-sm font-bold text-neutral-700 leading-none">{currentBead} / 108</p>
            <p className="text-[9px] text-neutral-400 font-semibold uppercase tracking-wider mt-1">Beads</p>
          </div>
        </div>
      </div>

      {/* Primary Tapping Action Area */}
      <div className="flex flex-col items-center gap-6 w-full">
        {/* Large Increment Button */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleIncrement}
          className="h-28 w-28 rounded-full bg-saffron text-white shadow-lg shadow-saffron/25 flex items-center justify-center cursor-pointer select-none focus:outline-none"
        >
          <Plus className="h-10 w-10 stroke-[2.5]" />
        </motion.button>

        {/* Auxiliary Controls */}
        <div className="flex items-center justify-center gap-8 w-full max-w-xs mt-2">
          {/* Decrement */}
          <button
            onClick={handleDecrement}
            disabled={count === 0}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-neutral-200 bg-white text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50 shadow-sm shadow-neutral-100/50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            title="Decrement"
          >
            <Minus className="h-5 w-5" />
          </button>

          {/* Reset */}
          <button
            onClick={handleReset}
            disabled={count === 0}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-neutral-200 bg-white text-neutral-500 hover:text-red-500 hover:bg-red-50/50 shadow-sm shadow-neutral-100/50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            title="Reset Counter"
          >
            <RotateCcw className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* Completion Indicator */}
      {count >= goal && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 flex items-center gap-1.5 text-xs font-bold text-success bg-emerald-50 px-4 py-2 rounded-full"
        >
          <Sparkles className="h-4 w-4 animate-spin-slow" />
          <span>Daily Chanting Goal Completed!</span>
        </motion.div>
      )}

      {/* Auto-save helper notice */}
      <span className="text-[10px] text-neutral-400 font-medium tracking-wide mt-8">
        Your progress is automatically saved to the database.
      </span>
    </div>
  );
}

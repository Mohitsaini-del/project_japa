"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Hourglass, 
  Clock, 
  Check
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { saveFocusSessionAction } from "@/lib/actions";

interface TimerContentProps {
  preferredMantra: string | null;
  preferredDeity: string | null;
}

export default function TimerContent({
  preferredMantra,
  preferredDeity,
}: TimerContentProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [mode, setMode] = useState<"countdown" | "stopwatch">("countdown");
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Countdown State
  const [selectedDuration, setSelectedDuration] = useState(15); // in minutes
  const [timeRemaining, setTimeRemaining] = useState(15 * 60);

  // Stopwatch State
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Session Data
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [sessionChants, setSessionChants] = useState("");
  const [saving, setSaving] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Formatting helper
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    const pad = (n: number) => n.toString().padStart(2, "0");
    
    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  const triggerSaveDialog = () => {
    setIsSaveDialogOpen(true);
    setIsRunning(false);
    setIsPaused(false);
  };

  // Timer Tick Core Logic
  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        if (mode === "countdown") {
          setTimeRemaining((prev) => {
            if (prev <= 1) {
              // Countdown finished!
              setIsRunning(false);
              triggerSaveDialog();
              return 0;
            }
            return prev - 1;
          });
        } else {
          // Stopwatch
          setTimeElapsed((prev) => prev + 1);
        }
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isPaused, mode]);

  // Sync countdown time if duration option clicked
  const handleDurationSelect = (mins: number) => {
    if (isRunning) return;
    setSelectedDuration(mins);
    setTimeRemaining(mins * 60);
  };

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
    setSessionStartTime(new Date());
    if (mode === "stopwatch") {
      setTimeElapsed(0);
    }
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
  };



  const handleFinish = () => {
    triggerSaveDialog();
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setSessionStartTime(null);
    if (mode === "countdown") {
      setTimeRemaining(selectedDuration * 60);
    } else {
      setTimeElapsed(0);
    }
  };

  const handleSaveSession = async () => {
    if (!sessionStartTime) return;
    const chants = parseInt(sessionChants, 10);
    if (isNaN(chants) || chants < 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid number of chants completed.",
        variant: "error",
      });
      return;
    }

    setSaving(true);
    
    // Compute total duration in seconds
    const duration = mode === "countdown"
      ? (selectedDuration * 60) - timeRemaining
      : timeElapsed;

    try {
      const res = await saveFocusSessionAction({
        startTime: sessionStartTime,
        endTime: new Date(),
        duration: Math.max(duration, 1), // ensure at least 1 second
        chantCount: chants,
      });

      if (res?.error) {
        toast({
          title: "Error Saving Session",
          description: res.error,
          variant: "error",
        });
      } else {
        toast({
          title: "Session Saved",
          description: `Logged ${Math.round(duration / 60)} minutes and ${chants} chants.`,
          variant: "success",
        });
        setIsSaveDialogOpen(false);
        setSessionChants("");
        handleReset();
        router.refresh();
      }
    } catch {
      toast({
        title: "Database Error",
        description: "Could not log your chanting session.",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDiscardSession = () => {
    if (confirm("Are you sure you want to discard this focus session? It will not be logged.")) {
      setIsSaveDialogOpen(false);
      setSessionChants("");
      handleReset();
    }
  };

  const activeDuration = mode === "countdown" ? timeRemaining : timeElapsed;

  return (
    <div className="max-w-md mx-auto py-6 px-4 font-sans select-none flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
      
      {/* Mantra header context */}
      <div className="text-center mb-6">
        {preferredDeity && (
          <span className="text-[10px] font-bold text-saffron bg-saffron-light px-3 py-1 rounded-full uppercase tracking-wider">
            {preferredDeity}
          </span>
        )}
        <h1 className="text-xl font-bold text-neutral-800 tracking-tight mt-2.5">
          {preferredMantra || "Mindful Chanting"}
        </h1>
        <p className="text-xs text-neutral-400 font-semibold mt-1">
          Lock in your chanting focus session
        </p>
      </div>

      {/* Mode Selector */}
      {!isRunning && (
        <div className="flex gap-2 bg-neutral-100/60 p-1 rounded-2xl mb-8 w-full">
          <button
            onClick={() => { setMode("countdown"); handleReset(); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === "countdown" ? "bg-white text-saffron shadow-xs" : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            <Hourglass className="h-4 w-4" />
            <span>Countdown</span>
          </button>
          <button
            onClick={() => { setMode("stopwatch"); handleReset(); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === "stopwatch" ? "bg-white text-deepblue shadow-xs" : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>Stopwatch</span>
          </button>
        </div>
      )}

      {/* Timer Screen Circle */}
      <div className="relative w-full aspect-square max-w-[280px] rounded-full bg-white border border-neutral-100 flex flex-col items-center justify-center shadow-lg shadow-neutral-200/30 mb-8">
        
        {/* Glow halo */}
        {isRunning && !isPaused && (
          <motion.div
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className={`absolute inset-0 rounded-full border opacity-30 pointer-events-none ${
              mode === "countdown" ? "border-saffron bg-saffron-light/20" : "border-deepblue bg-deepblue-light/20"
            }`}
          />
        )}

        <div className="text-center z-10">
          <span className="text-5xl font-black text-neutral-850 tracking-tight tabular-nums">
            {formatTime(activeDuration)}
          </span>
          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-2">
            {mode === "countdown" ? "Time Remaining" : "Elapsed Time"}
          </p>
        </div>
      </div>

      {/* Countdown Presets Selection */}
      {mode === "countdown" && !isRunning && (
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {[5, 10, 15, 20, 30, 45, 60].map((mins) => (
            <button
              key={mins}
              onClick={() => handleDurationSelect(mins)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                selectedDuration === mins
                  ? "bg-saffron-light text-saffron border-saffron/20"
                  : "bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50"
              }`}
            >
              {mins}m
            </button>
          ))}
        </div>
      )}

      {/* Timer Action Buttons */}
      <div className="flex items-center justify-center gap-4 w-full max-w-xs">
        {!isRunning ? (
          <Button onClick={handleStart} className="w-full rounded-2xl py-3.5 flex items-center justify-center gap-2">
            <Play className="h-4.5 w-4.5 fill-current" /> Start Session
          </Button>
        ) : (
          <>
            {isPaused ? (
              <Button onClick={handleResume} variant="primary" className="flex-1 rounded-2xl py-3.5 flex items-center justify-center gap-2">
                <Play className="h-4.5 w-4.5 fill-current" /> Resume
              </Button>
            ) : (
              <Button onClick={handlePause} variant="outline" className="flex-1 rounded-2xl py-3.5 flex items-center justify-center gap-2 text-neutral-600 border-neutral-200">
                <Pause className="h-4.5 w-4.5" /> Pause
              </Button>
            )}

            <Button
              onClick={handleFinish}
              variant="secondary"
              className="flex-1 rounded-2xl py-3.5 flex items-center justify-center gap-2"
            >
              <Square className="h-4 w-4 fill-current" /> Finish
            </Button>
            
            <button
              onClick={handleReset}
              className="p-3 text-neutral-400 hover:text-neutral-600 rounded-xl hover:bg-neutral-50 cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="h-4.5 w-4.5" />
            </button>
          </>
        )}
      </div>

      {/* Session Save Dialog Box */}
      <Dialog
        isOpen={isSaveDialogOpen}
        onClose={handleDiscardSession}
        title="Save Chanting Session"
      >
        <div className="space-y-4">
          <div className="bg-bg-zen p-4 rounded-2xl text-center border border-neutral-100">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">
              Focus Session Completed
            </span>
            <p className="text-xl font-extrabold text-neutral-800">
              {formatTime(
                mode === "countdown"
                  ? (selectedDuration * 60) - timeRemaining
                  : timeElapsed
              )}
            </p>
          </div>

          <div className="space-y-1">
            <Input
              label="Chants Completed"
              type="number"
              min="0"
              placeholder="e.g. 108"
              value={sessionChants}
              onChange={(e) => setSessionChants(e.target.value)}
              helperText="How many chants did you recite during this session?"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleDiscardSession}
              variant="outline"
              className="flex-1 rounded-xl py-2.5 text-xs border-neutral-200"
              disabled={saving}
            >
              Discard
            </Button>
            <Button
              onClick={handleSaveSession}
              variant="primary"
              className="flex-1 rounded-xl py-2.5 text-xs"
              isLoading={saving}
            >
              <Check className="h-4 w-4 mr-1" /> Save Session
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

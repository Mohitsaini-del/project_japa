"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Flame, 
  Clock, 
  Sparkles, 
  Plus, 
  Compass, 
  ChevronRight, 
  Calendar 
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import ProgressRing from "@/components/cards/ProgressRing";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { updateChantCountAction } from "@/lib/actions";
import DashboardCalendar from "@/components/cards/DashboardCalendar";

// Custom SVG Saffron Lotus Icon matching mockup
const LotusIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 6c-2 2-3 4-3 6 0 2.5 1.5 4 3 4s3-1.5 3-4c0-2-1-4-3-6z" className="text-saffron fill-current" />
    <path d="M12 8c-3.5 1-5 3.5-5 5.5 0 1.5 1 2.5 2.5 2.5 2 0 2.5-1 2.5-2" />
    <path d="M12 8c3.5 1 5 3.5 5 5.5 0 1.5-1 2.5-2.5 2.5-2 0-2.5-1-2.5-2" />
    <path d="M7 16c-1.5-1-2.5-2.5-2.5-4 0-2 2.5-4 5-4.5" />
    <path d="M17 16c1.5-1 2.5-2.5 2.5-4 0-2-2.5-4-5-4.5" />
  </svg>
);

// Custom SVG Beads/Mala Icon matching mockup
const BeadsIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="7.5" strokeDasharray="2 2" />
    <circle cx="12" cy="4.5" r="1.2" className="fill-current" />
    <circle cx="12" cy="19.5" r="1.2" className="fill-current" />
    <circle cx="4.5" cy="12" r="1.2" className="fill-current" />
    <circle cx="19.5" cy="12" r="1.2" className="fill-current" />
    <circle cx="6.7" cy="6.7" r="1.2" className="fill-current" />
    <circle cx="17.3" cy="6.7" r="1.2" className="fill-current" />
    <circle cx="6.7" cy="17.3" r="1.2" className="fill-current" />
    <circle cx="17.3" cy="17.3" r="1.2" className="fill-current" />
    <path d="M12 19.5v2.5M10.5 22h3" />
  </svg>
);

// Custom SVG Temple Icon matching mockup
const TempleIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v3M9 5h6M10 8h4M7 11h10M4 14h16M2 20h20" />
    <path d="M5 20v-6l7-6 7 6v6" />
    <path d="M9 20v-4a3 3 0 0 1 6 0v4" />
  </svg>
);

// Custom SVG Diya Icon matching mockup
const DiyaIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {/* flame */}
    <path d="M12 3c0 0-2.5 3-2.5 4.5s1.12 3 2.5 3 2.5-1.5 2.5-3S12 3 12 3z" className="text-saffron fill-current" />
    {/* stand */}
    <path d="M8 17.5v2.5M16 17.5v2.5" />
    {/* diya bowl */}
    <path d="M3 11c0 3.5 4 6.5 9 6.5s9-3 9-6.5H3z" className="text-amber-600 fill-current" />
    <path d="M12 17.5c-2.5 0-4.5-1-5.5-2.5h11c-1 1.5-3 2.5-5 2.5z" className="text-amber-700 fill-current" />
  </svg>
);

interface DashboardContentProps {
  initialUser: {
    name: string | null;
    dailyGoal: number;
    currentStreak: number;
    bestStreak: number;
    preferredDeity: string | null;
    preferredMantra: string | null;
    trackingMode: string;
  };
  initialProgress: {
    chantCount: number;
    goal: number;
    focusMinutes: number;
    completed: boolean;
  } | null;
  initialSessions: Array<{
    id: string;
    startTime: Date;
    duration: number;
    chantCount: number;
  }>;
}

export default function DashboardContent({
  initialUser,
  initialProgress,
  initialSessions,
}: DashboardContentProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  // Progress states
  const [chantCount, setChantCount] = useState(initialProgress?.chantCount ?? 0);
  const [goal, setGoal] = useState(initialProgress?.goal ?? initialUser.dailyGoal);
  const [focusMinutes, setFocusMinutes] = useState(initialProgress?.focusMinutes ?? 0);
  const [completed, setCompleted] = useState(initialProgress?.completed ?? false);
  const [manualInputValue, setManualInputValue] = useState("");

  // Stats loaded callback from calendar
  const [calendarStats, setCalendarStats] = useState<{
    totalChants: number;
    yearlyTotal: number;
    monthlyTotal: number;
  }>({
    totalChants: 0,
    yearlyTotal: 0,
    monthlyTotal: 0,
  });

  // Sync state if props change
  useEffect(() => {
    const timer = setTimeout(() => {
      setChantCount(initialProgress?.chantCount ?? 0);
      setGoal(initialProgress?.goal ?? initialUser.dailyGoal);
      setFocusMinutes(initialProgress?.focusMinutes ?? 0);
      setCompleted(initialProgress?.completed ?? false);
    }, 0);
    return () => clearTimeout(timer);
  }, [initialProgress, initialUser.dailyGoal]);

  const todayStr = new Date().toISOString().split("T")[0];

  // Optimistic chant updates
  const handleUpdateChants = async (value: number, mode: "increment" | "set") => {
    let nextCount = chantCount;
    if (mode === "increment") {
      nextCount = Math.max(0, chantCount + value);
    } else {
      nextCount = Math.max(0, value);
    }

    const previousCount = chantCount;
    const previousCompleted = completed;

    setChantCount(nextCount);
    setCompleted(nextCount >= goal);

    try {
      const res = await updateChantCountAction(todayStr, value, mode);
      if (res?.error) {
        setChantCount(previousCount);
        setCompleted(previousCompleted);
        toast({
          title: "Update Failed",
          description: res.error,
          variant: "error",
        });
      } else {
        toast({
          title: mode === "increment" ? "Progress Saved" : "Chants Updated",
          description: `Logged ${nextCount} chants for today.`,
          variant: "success",
        });
        router.refresh();
      }
    } catch {
      setChantCount(previousCount);
      setCompleted(previousCompleted);
      toast({
        title: "Error",
        description: "Could not sync chanting progress. Please try again.",
        variant: "error",
      });
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(manualInputValue, 10);
    if (isNaN(val) || val < 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid positive number.",
        variant: "error",
      });
      return;
    }
    handleUpdateChants(val, "set");
    setManualInputValue("");
  };

  const progressPercent = goal > 0 ? chantCount / goal : 0;
  const formatNumber = (num: number) => new Intl.NumberFormat().format(num);

  return (
    <div className="space-y-6 select-none pb-12">
      {/* Top Header Row with Greetings & Quote Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 border-b border-[#F0EAE1] pb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-neutral-800 tracking-tight flex items-center gap-2">
            Hare Krishna, {initialUser.name || "Mohit"} <span className="animate-bounce">🙏</span>
          </h2>
          <p className="text-xs text-neutral-500 font-semibold mt-1 flex items-center gap-1.5">
            May your chanting bring peace and happiness today. 🪷
          </p>
        </div>
        
        {/* Quote Card (Top Right) */}
        <div className="bg-white border border-[#F0EAE1] rounded-2xl px-5 py-3 shadow-sm flex items-center gap-3.5 max-w-sm">
          <div>
            <p className="text-[10px] text-neutral-500 italic font-semibold leading-relaxed">
              &ldquo;Be steady in your practice.
              <br />
              Every chant brings you closer.&rdquo;
            </p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-saffron-light flex-shrink-0">
            <LotusIcon className="h-4.5 w-4.5 text-saffron" />
          </div>
        </div>
      </div>

      {/* Main 2-Column Dashboard Grid */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 items-start max-w-7xl w-full">
        {/* Left Column (Daily Progress + Stats Row + Diya Banner) */}
        <div className="lg:col-span-2 space-y-6 w-full">
          
          {/* 4 Stats Cards Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Card 1: Total Names */}
            <div className="bg-white border border-[#F0EAE1] rounded-2xl p-4 flex items-center gap-3 shadow-sm shadow-neutral-100/30">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FAF8F5] text-saffron flex-shrink-0">
                <BeadsIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block leading-none">Total Names</span>
                <span className="text-sm font-extrabold text-neutral-800 tracking-tight leading-none mt-1.5 block truncate">
                  {formatNumber(calendarStats.totalChants)}
                </span>
                <span className="text-[9px] font-semibold text-neutral-400 block mt-1 leading-none">All time</span>
              </div>
            </div>

            {/* Card 2: This Month */}
            <div className="bg-white border border-[#F0EAE1] rounded-2xl p-4 flex items-center gap-3 shadow-sm shadow-neutral-100/30">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FAF8F5] text-orange-500 flex-shrink-0">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block leading-none">This Month</span>
                <span className="text-sm font-extrabold text-neutral-800 tracking-tight leading-none mt-1.5 block truncate">
                  {formatNumber(calendarStats.monthlyTotal)}
                </span>
                <span className="text-[9px] font-semibold text-neutral-400 block mt-1 leading-none">Names</span>
              </div>
            </div>

            {/* Card 3: This Year */}
            <div className="bg-white border border-[#F0EAE1] rounded-2xl p-4 flex items-center gap-3 shadow-sm shadow-neutral-100/30">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FAF8F5] text-[#8A7A6B] flex-shrink-0">
                <TempleIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block leading-none">This Year</span>
                <span className="text-sm font-extrabold text-neutral-800 tracking-tight leading-none mt-1.5 block truncate">
                  {formatNumber(calendarStats.yearlyTotal)}
                </span>
                <span className="text-[9px] font-semibold text-neutral-400 block mt-1 leading-none">Names</span>
              </div>
            </div>

            {/* Card 4: Longest Streak */}
            <div className="bg-white border border-[#F0EAE1] rounded-2xl p-4 flex items-center gap-3 shadow-sm shadow-neutral-100/30">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FAF8F5] text-orange-600 flex-shrink-0">
                <Flame className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block leading-none">Longest Streak</span>
                <span className="text-sm font-extrabold text-neutral-800 tracking-tight leading-none mt-1.5 block truncate">
                  {initialUser.bestStreak} Days
                </span>
                <span className="text-[9px] font-semibold text-neutral-400 block mt-1 leading-none">Keep it going!</span>
              </div>
            </div>
          </div>

          {/* Calendar Grid Card */}
          <DashboardCalendar onStatsLoaded={setCalendarStats} />

          {/* Diya Devotional Banner Card */}
          <div className="bg-white border border-[#F0EAE1] rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-center gap-4">
            <div className="flex-shrink-0">
              <DiyaIcon className="h-8 w-8" />
            </div>
            <p className="text-xs font-semibold text-neutral-600 tracking-wide text-center">
              Let each name you chant fill your heart with devotion and peace.
            </p>
            <div className="text-saffron/40 select-none text-[8px] font-bold tracking-widest hidden md:block">✦ ✦ ✦</div>
          </div>
        </div>

        {/* Right Column (Sidebar Cards) */}
        <div className="flex flex-col gap-4 w-full">
          
          {/* Today's Progress Card */}
          <div className="bg-white border border-[#F0EAE1] rounded-2xl p-4 shadow-sm shadow-neutral-100/50 flex flex-col gap-4">
            <div className="flex items-center gap-1.5">
              <LotusIcon className="h-3.5 w-3.5 text-saffron" />
              <h3 className="text-xs font-extrabold text-neutral-800 leading-none">Today's Progress</h3>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 flex flex-col justify-center min-w-0">
                <div className="flex items-baseline gap-0.5">
                  <span className="text-xl font-extrabold text-neutral-800 leading-none">{formatNumber(chantCount)}</span>
                  <span className="text-[10px] font-bold text-neutral-400">/ {formatNumber(goal)}</span>
                </div>
                <p className="text-[9px] text-neutral-400 font-bold leading-none mt-1">Names Chanted</p>
                
                {/* Linear progress bar */}
                <div className="w-full bg-[#FAF8F5] border border-neutral-100 rounded-full h-2 mt-2 overflow-hidden">
                  <div 
                    className="bg-saffron h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, progressPercent * 100)}%` }}
                  />
                </div>
              </div>

              {/* Circular progress ring */}
              <div className="flex-shrink-0">
                <ProgressRing
                  progress={progressPercent}
                  size={75}
                  strokeWidth={7}
                  centerText={`${Math.min(Math.round(progressPercent * 100), 100)}%`}
                  subText="Completed"
                />
              </div>
            </div>

            {/* 3 mini stats */}
            <div className="grid grid-cols-3 gap-1 border-t border-neutral-100 pt-3 text-center">
              <div>
                <span className="text-[7px] font-bold text-neutral-400 uppercase tracking-wider block">Current Streak</span>
                <span className="text-[10px] font-extrabold text-saffron mt-0.5 block">{initialUser.currentStreak} Days</span>
              </div>
              <div className="border-x border-neutral-100 px-0.5">
                <span className="text-[7px] font-bold text-neutral-400 uppercase tracking-wider block">Best Streak</span>
                <span className="text-[10px] font-extrabold text-[#8A7A6B] mt-0.5 block">{initialUser.bestStreak} Days</span>
              </div>
              <div>
                <span className="text-[7px] font-bold text-neutral-400 uppercase tracking-wider block">Focus Time</span>
                <span className="text-[10px] font-extrabold text-neutral-800 mt-0.5 block">
                  {Math.round(focusMinutes)} min
                </span>
                <span className="text-[7px] text-neutral-400 font-semibold block mt-0.5 leading-none">
                  {initialSessions.length} Session{initialSessions.length === 1 ? "" : "s"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Update Card */}
          <div className="bg-white border border-[#F0EAE1] rounded-2xl p-4 shadow-sm shadow-neutral-100/50 flex flex-col gap-3.5">
            <h3 className="text-xs font-extrabold text-neutral-800 border-b border-neutral-50 pb-1.5 leading-none">Quick Update</h3>
            
            {/* Quick Add Buttons */}
            {initialUser.trackingMode !== "manual" && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdateChants(108, "increment")}
                  className="rounded-lg flex-1 text-[11px] font-bold py-1.5 bg-[#FDF3E5] hover:bg-[#FBE8CD] text-saffron transition-all duration-200 cursor-pointer active:scale-95 border border-[#FCE6C9]/40"
                >
                  +108
                </button>
                <button
                  onClick={() => handleUpdateChants(216, "increment")}
                  className="rounded-lg flex-1 text-[11px] font-bold py-1.5 bg-[#FDF3E5] hover:bg-[#FBE8CD] text-saffron transition-all duration-200 cursor-pointer active:scale-95 border border-[#FCE6C9]/40"
                >
                  +216
                </button>
                <button
                  onClick={() => handleUpdateChants(500, "increment")}
                  className="rounded-lg flex-1 text-[11px] font-bold py-1.5 bg-[#FDF3E5] hover:bg-[#FBE8CD] text-saffron transition-all duration-200 cursor-pointer active:scale-95 border border-[#FCE6C9]/40"
                >
                  +500
                </button>
              </div>
            )}

            {/* Custom Entry Form */}
            {initialUser.trackingMode !== "live" && (
              <form onSubmit={handleManualSubmit} className="flex flex-col gap-2.5">
                <div>
                  <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                    Custom Entry
                  </label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Enter total names..."
                    value={manualInputValue}
                    onChange={(e) => setManualInputValue(e.target.value)}
                    className="py-2 rounded-xl text-[11px] border border-neutral-200 focus:border-saffron focus:ring-1 focus:ring-saffron"
                  />
                </div>
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-full rounded-xl py-2 text-[11px] font-bold bg-saffron hover:bg-saffron-dark text-white cursor-pointer transition-colors shadow-sm active:scale-95"
                >
                  Save Progress
                </Button>
              </form>
            )}
          </div>

          {/* Quick Links List */}
          <div className="flex flex-col gap-2.5">
            <Link href="/counter">
              <div className="bg-white hover:bg-saffron-light/40 border border-[#F0EAE1] hover:border-saffron/20 rounded-xl p-3 flex items-center justify-between transition-all duration-200 cursor-pointer shadow-sm group active:scale-98">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-saffron-light text-saffron border border-saffron/10 flex-shrink-0 transition-colors group-hover:bg-saffron group-hover:text-white">
                    <BeadsIcon className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-extrabold text-neutral-800 group-hover:text-saffron transition-colors leading-none">Continue Chanting</h4>
                    <p className="text-[9px] text-neutral-400 font-bold mt-0.5 leading-none">Live Counter</p>
                  </div>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-neutral-400 group-hover:text-saffron group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>

            <Link href="/timer">
              <div className="bg-white hover:bg-deepblue-light/40 border border-[#F0EAE1] hover:border-deepblue/20 rounded-xl p-3 flex items-center justify-between transition-all duration-200 cursor-pointer shadow-sm group active:scale-98">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-deepblue-light text-deepblue border border-deepblue/10 flex-shrink-0 transition-colors group-hover:bg-deepblue group-hover:text-white">
                    <Clock className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-extrabold text-neutral-800 group-hover:text-deepblue transition-colors leading-none">Start Focus Session</h4>
                    <p className="text-[9px] text-neutral-400 font-bold mt-0.5 leading-none">Focus Timer</p>
                  </div>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-neutral-400 group-hover:text-deepblue group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

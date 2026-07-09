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
  Play, 
  Keyboard 
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import ProgressRing from "@/components/cards/ProgressRing";
import StatCard from "@/components/cards/StatCard";
import RecentActivity, { ActivityItem } from "@/components/cards/RecentActivity";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { updateChantCountAction } from "@/lib/actions";

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
    // Determine the next count optimistically
    let nextCount = chantCount;
    if (mode === "increment") {
      nextCount = Math.max(0, chantCount + value);
    } else {
      if (initialUser.trackingMode === "hybrid") {
        nextCount = Math.max(chantCount, value);
      } else {
        nextCount = value;
      }
    }

    const previousCount = chantCount;
    const previousCompleted = completed;

    // Optimistic state set
    setChantCount(nextCount);
    setCompleted(nextCount >= goal);

    try {
      const res = await updateChantCountAction(todayStr, value, mode);
      if (res?.error) {
        // Revert on failure
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

  // Convert sessions database records into activity log format
  const activities: ActivityItem[] = initialSessions.map((session) => {
    const time = new Date(session.startTime).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const mins = Math.round(session.duration / 60);
    return {
      id: session.id,
      type: "session",
      title: "Chanting Session Completed",
      detail: `${session.chantCount} chants completed in ${mins} min${mins === 1 ? "" : "s"}.`,
      time,
    };
  });

  const progressPercent = goal > 0 ? chantCount / goal : 0;

  return (
    <div className="space-y-6 relative">
      {/* Serene Watermark Background - Lord Hanuman chanting Ram Naam */}
      <div 
        className="fixed bottom-0 right-0 w-[450px] h-[450px] pointer-events-none opacity-[0.06] bg-no-repeat bg-contain bg-right-bottom z-0 hidden lg:block"
        style={{ backgroundImage: "url('/hanuman_meditation.png')" }}
      />
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.035] bg-no-repeat bg-center bg-contain z-0 lg:hidden"
        style={{ backgroundImage: "url('/hanuman_meditation.png')" }}
      />
      {/* Overview Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Daily Goal"
          value={`${chantCount} / ${goal}`}
          icon={Sparkles}
          description={
            initialUser.preferredMantra
              ? `Chanting: ${initialUser.preferredMantra}`
              : "Set your preferred mantra in Profile"
          }
          bgColorClass="bg-saffron-light/50"
          iconColorClass="text-saffron"
        />

        <StatCard
          title="Current Streak"
          value={`${initialUser.currentStreak} day${initialUser.currentStreak === 1 ? "" : "s"}`}
          icon={Flame}
          description="Keep up your daily chanting"
          bgColorClass="bg-orange-50"
          iconColorClass="text-orange-500"
        />

        <StatCard
          title="Best Streak"
          value={`${initialUser.bestStreak} day${initialUser.bestStreak === 1 ? "" : "s"}`}
          icon={Flame}
          description="Your longest historical streak"
          bgColorClass="bg-emerald-50"
          iconColorClass="text-success"
        />

        <StatCard
          title="Focus Time"
          value={`${Math.round(focusMinutes * 10) / 10}m`}
          icon={Clock}
          description={`Across ${initialSessions.length} session${initialSessions.length === 1 ? "" : "s"}`}
          bgColorClass="bg-deepblue-light/50"
          iconColorClass="text-deepblue"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Progress Ring Card */}
        <div className="lg:col-span-2 rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm shadow-neutral-100/50 flex flex-col md:flex-row items-center justify-around gap-8">
          <div className="flex flex-col items-center gap-3">
            <ProgressRing
              progress={progressPercent}
              size={220}
              strokeWidth={14}
              centerText={`${Math.min(Math.round(progressPercent * 100), 100)}%`}
              subText="Completed"
            />
            <div className="text-center mt-2">
              <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
                Chanting Mode
              </h4>
              <p className="text-sm font-bold text-neutral-700 capitalize mt-1 flex items-center gap-1.5 justify-center">
                <Compass className="h-4 w-4 text-saffron" />
                {initialUser.trackingMode} Entry
              </p>
            </div>
          </div>

          <div className="flex-1 w-full max-w-sm flex flex-col gap-6">
            <div>
              <h3 className="text-lg font-bold text-neutral-850 tracking-tight">
                Update Today&apos;s Progress
              </h3>
              <p className="text-xs text-neutral-400 font-medium mt-1">
                Quickly add increments or set your total count for today.
              </p>
            </div>

            {/* Quick Add Buttons */}
            {initialUser.trackingMode !== "manual" && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateChants(108, "increment")}
                  className="rounded-xl"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" /> 108 Chants
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateChants(500, "increment")}
                  className="rounded-xl"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" /> 500
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateChants(1000, "increment")}
                  className="rounded-xl"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" /> 1000
                </Button>
              </div>
            )}

            {/* Manual Set Form */}
            {initialUser.trackingMode !== "live" && (
              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="number"
                    min="0"
                    placeholder="Enter total chants today..."
                    value={manualInputValue}
                    onChange={(e) => setManualInputValue(e.target.value)}
                    className="py-2.5 rounded-xl text-xs"
                  />
                </div>
                <Button type="submit" variant="secondary" size="sm" className="rounded-xl px-4 py-2.5">
                  <Keyboard className="h-4 w-4" />
                </Button>
              </form>
            )}

            {/* Continue Chanting Call to Action */}
            <div className="border-t border-neutral-50 pt-4 flex gap-2">
              <Link href="/counter" className="flex-1">
                <Button variant="primary" className="w-full rounded-xl py-2.5 text-xs flex items-center justify-center gap-1.5">
                  <Plus className="h-4 w-4" /> Live Counter
                </Button>
              </Link>
              <Link href="/timer" className="flex-1">
                <Button variant="outline" className="w-full rounded-xl py-2.5 text-xs flex items-center justify-center gap-1.5 text-deepblue border-deepblue/20 hover:bg-deepblue-light/20">
                  <Play className="h-3.5 w-3.5" /> Focus Timer
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Activity & Side Column */}
        <div className="flex flex-col gap-6">
          <RecentActivity activities={activities} />
        </div>
      </div>
    </div>
  );
}

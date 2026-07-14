"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar
} from "lucide-react";
import { getDashboardCalendarDataAction } from "@/lib/actions";
import { useToast } from "@/components/ui/Toast";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Custom Lotus Icon SVG matching mockup
const LotusIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 6c-2 2-3 4-3 6 0 2.5 1.5 4 3 4s3-1.5 3-4c0-2-1-4-3-6z" className="fill-current" />
    <path d="M12 8c-3.5 1-5 3.5-5 5.5 0 1.5 1 2.5 2.5 2.5 2 0 2.5-1 2.5-2" />
    <path d="M12 8c3.5 1 5 3.5 5 5.5 0 1.5-1 2.5-2.5 2.5-2 0-2.5-1-2.5-2" />
    <path d="M7 16c-1.5-1-2.5-2.5-2.5-4 0-2 2.5-4 5-4.5" />
    <path d="M17 16c1.5-1 2.5-2.5 2.5-4 0-2-2.5-4-5-4.5" />
  </svg>
);

interface DashboardCalendarProps {
  onStatsLoaded?: (stats: {
    totalChants: number;
    yearlyTotal: number;
    monthlyTotal: number;
  }) => void;
}

export default function DashboardCalendar({ onStatsLoaded }: DashboardCalendarProps) {
  const { toast } = useToast();
  const today = new Date();
  
  // Selected Year & Month state (month is 1-indexed, 1=Jan, 12=Dec)
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  
  // Loaded stats and calendar progress map
  const [stats, setStats] = useState<{
    totalChants: number;
    yearlyTotal: number;
    monthlyTotal: number;
    progressMap: Record<number, { count: number; goal: number; completed: boolean }>;
  } | null>(null);
  
  const [loading, setLoading] = useState(true);

  // Fetch data for selected month/year
  const fetchCalendarData = useCallback(async (targetYear: number, targetMonth: number) => {
    setLoading(true);
    try {
      const res = await getDashboardCalendarDataAction(targetYear, targetMonth);
      if (res.error) {
        toast({
          title: "Error Loading Calendar",
          description: res.error,
          variant: "error",
        });
      } else if (res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Connection Error",
        description: "Could not retrieve calendar stats.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCalendarData(year, month);
  }, [year, month, fetchCalendarData]);

  // Push loaded stats to parent when stats are successfully fetched
  useEffect(() => {
    if (stats && onStatsLoaded) {
      onStatsLoaded({
        totalChants: stats.totalChants,
        yearlyTotal: stats.yearlyTotal,
        monthlyTotal: stats.monthlyTotal,
      });
    }
  }, [stats, onStatsLoaded]);

  // Navigate Month
  const handleMonthChange = (direction: "prev" | "next") => {
    if (direction === "prev") {
      if (month === 1) {
        setMonth(12);
        setYear(year - 1);
      } else {
        setMonth(month - 1);
      }
    } else {
      if (month === 12) {
        setMonth(1);
        setYear(year + 1);
      } else {
        setMonth(month + 1);
      }
    }
  };

  // Grid calculation helpers (using normal local calendar math)
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysInPrevMonth = new Date(year, month - 1, 0).getDate();
  const firstDayIndex = new Date(year, month - 1, 1).getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat

  // Format numbers nicely
  const formatNumber = (num: number) => new Intl.NumberFormat().format(num);

  return (
    <div className="w-full bg-white border border-[#F0EAE1] rounded-3xl p-5 shadow-sm shadow-neutral-100/50 flex flex-col gap-5 relative select-none">
      
      {/* Header and Month Selector Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-saffron-light text-saffron">
            <Calendar className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-neutral-800 tracking-tight">Daily Progress</h3>
            <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider leading-none mt-0.5">Your daily chanting journey</p>
          </div>
        </div>

        {/* Navigation Month Controls */}
        <div className="flex items-center bg-[#FAF8F5] rounded-xl px-2.5 py-1 border border-[#F0EAE1]">
          <button 
            onClick={() => handleMonthChange("prev")}
            className="text-neutral-400 hover:text-saffron transition-colors cursor-pointer p-0.5"
            title="Previous Month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-[12px] font-extrabold text-neutral-700 min-w-[90px] text-center tracking-tight px-1">
            {MONTHS[month - 1]} {year}
          </span>
          <button 
            onClick={() => handleMonthChange("next")}
            className="text-neutral-400 hover:text-saffron transition-colors cursor-pointer p-0.5"
            title="Next Month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Standard Calendar Grid */}
      <div className={`transition-opacity duration-200 ${loading ? "opacity-40" : "opacity-100"}`}>
        <div className="grid grid-cols-7 gap-1.5">
          {/* Header Row */}
          {DAYS_OF_WEEK.map(dayLabel => (
            <div key={dayLabel} className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider text-center pb-1">
              {dayLabel}
            </div>
          ))}

          {/* Grid Cells */}
          {Array.from({ length: 42 }).map((_, i) => {
            const dateIndex = i - firstDayIndex + 1;
            const isValid = dateIndex >= 1 && dateIndex <= daysInMonth;

            if (!isValid) {
              // Muted day from previous or next month
              let dateNum = 0;
              if (i < firstDayIndex) {
                dateNum = daysInPrevMonth - firstDayIndex + i + 1;
              } else {
                dateNum = i - (firstDayIndex + daysInMonth) + 1;
              }
              return (
                <div 
                  key={i} 
                  className="aspect-square rounded-xl border border-dashed border-[#F0EAE1]/30 bg-[#FAF8F5]/20 flex flex-col justify-between p-1 opacity-25 select-none"
                >
                  <span className="text-[8px] font-bold text-neutral-400">
                    {dateNum}
                  </span>
                </div>
              );
            }

            // Valid day in the current month
            const dayProgress = stats?.progressMap[dateIndex];
            const count = dayProgress?.count ?? 0;
            const metGoal = dayProgress?.completed ?? false;

            const isTodayCell = 
              today.getFullYear() === year && 
              today.getMonth() === month - 1 && 
              today.getDate() === dateIndex;

            // Render cell style matching mock-up
            return (
              <div 
                key={i}
                className={`aspect-square rounded-xl border p-1 flex flex-col justify-between transition-all duration-200 cursor-default relative group ${
                  isTodayCell 
                    ? "bg-saffron text-white border-saffron shadow-sm shadow-saffron/10" 
                    : "bg-white border-[#F0EAE1] hover:bg-[#FAF8F5]/50"
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className={`text-[9px] font-bold ${
                    isTodayCell ? "text-white" : "text-neutral-500"
                  }`}>
                    {dateIndex}
                  </span>
                  
                  {isTodayCell && (
                    <span className="h-1 w-1 rounded-full bg-white animate-pulse" />
                  )}
                </div>

                {/* Saffron Lotus icon under date for Goal Met */}
                <div className="flex-1 flex flex-col items-center justify-center min-h-[14px] my-0.5">
                  {!isTodayCell && metGoal ? (
                    <LotusIcon className="h-3.5 w-3.5 text-saffron fill-current" />
                  ) : !isTodayCell && count > 0 ? (
                    // Small saffron dot for Chanted (< Goal)
                    <span className="h-1 w-1 rounded-full bg-saffron" />
                  ) : null}
                </div>

                <div className="text-center w-full truncate leading-none">
                  <span className={`text-[8px] font-extrabold ${
                    isTodayCell 
                      ? "text-white/95" 
                      : metGoal 
                        ? "text-saffron" 
                        : count > 0 
                          ? "text-neutral-600" 
                          : "text-neutral-300"
                  }`}>
                    {count > 0 ? formatNumber(count) : "—"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid Legend */}
      <div className="flex items-center justify-start gap-4 text-[9px] font-bold text-neutral-400 border-t border-neutral-100 pt-3 mt-1">
        <div className="flex items-center gap-1.5">
          <LotusIcon className="h-4 w-4 text-saffron fill-current" />
          <span>Goal Met (≥ Goal)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-saffron" />
          <span>Chanted (&lt; Goal)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
          <span>No Chanting</span>
        </div>
      </div>
    </div>
  );
}

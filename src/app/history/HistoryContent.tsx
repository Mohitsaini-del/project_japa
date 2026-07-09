"use client";

import React, { useState, useMemo } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  CheckCircle, 
  Clock, 
  Fingerprint, 
  Info 
} from "lucide-react";


interface ProgressItem {
  id: string;
  date: string; // YYYY-MM-DD
  chantCount: number;
  goal: number;
  focusMinutes: number;
  completed: boolean;
}

interface SessionItem {
  date: string; // YYYY-MM-DD
  duration: number;
  chantCount: number;
}

interface HistoryContentProps {
  progressData: ProgressItem[];
  sessionData: SessionItem[];
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function HistoryContent({
  progressData,
  sessionData,
}: HistoryContentProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  
  // Local state for selected day in YYYY-MM-DD format
  const [selectedDateStr, setSelectedDateStr] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Memoized records lookup maps for fast access
  const progressMap = useMemo(() => {
    const map = new Map<string, ProgressItem>();
    progressData.forEach((p) => map.set(p.date, p));
    return map;
  }, [progressData]);

  const sessionsMap = useMemo(() => {
    const map = new Map<string, SessionItem[]>();
    sessionData.forEach((s) => {
      const list = map.get(s.date) || [];
      list.push(s);
      map.set(s.date, list);
    });
    return map;
  }, [sessionData]);

  // Calendar generation logic
  const calendarCells = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const cells = [];
    
    // Add prefix empty cells from previous month
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push({ day: null, dateStr: "" });
    }

    // Add days of current month
    for (let day = 1; day <= totalDays; day++) {
      const monthStr = (month + 1).toString().padStart(2, "0");
      const dayStr = day.toString().padStart(2, "0");
      const dateStr = `${year}-${monthStr}-${dayStr}`;
      cells.push({ day, dateStr });
    }

    return cells;
  }, [year, month]);

  // Retrieve details for currently selected day
  const selectedDetails = useMemo(() => {
    const progress = progressMap.get(selectedDateStr);
    const daySessions = sessionsMap.get(selectedDateStr) || [];
    
    const displayDate = new Date(selectedDateStr + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    return {
      dateStr: selectedDateStr,
      displayDate,
      chantCount: progress?.chantCount ?? 0,
      goal: progress?.goal ?? 108,
      focusMinutes: progress?.focusMinutes ?? 0,
      completed: progress?.completed ?? false,
      sessionsCount: daySessions.length,
      hasRecord: !!progress,
    };
  }, [selectedDateStr, progressMap, sessionsMap]);

  return (
    <div className="grid gap-6 lg:grid-cols-3 font-sans">
      
      {/* Left Column: Calendar UI */}
      <div className="lg:col-span-2 rounded-3xl border border-neutral-100 bg-white p-5 md:p-6 shadow-sm shadow-neutral-100/50 flex flex-col">
        {/* Month selector header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-bold text-neutral-800 tracking-tight">
            {MONTHS[month]} {year}
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-xl border border-neutral-100 hover:bg-neutral-50 text-neutral-500 hover:text-neutral-700 transition-all cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-xl border border-neutral-100 hover:bg-neutral-50 text-neutral-500 hover:text-neutral-700 transition-all cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 text-center mb-2">
          {DAYS_OF_WEEK.map((d) => (
            <span key={d} className="text-xs font-semibold text-neutral-400 py-1">
              {d}
            </span>
          ))}
        </div>

        {/* Calendar Grid cells */}
        <div className="grid grid-cols-7 gap-1 flex-1">
          {calendarCells.map((cell, index) => {
            if (!cell.day) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const record = progressMap.get(cell.dateStr);
            const isSelected = selectedDateStr === cell.dateStr;
            const isToday = new Date().toISOString().split("T")[0] === cell.dateStr;

            // Determine status styles
            let cellStyle = "text-neutral-600 hover:bg-neutral-50";
            if (record) {
              if (record.completed) {
                cellStyle = "bg-success-light/70 text-success hover:bg-success-light";
              } else if (record.chantCount > 0) {
                cellStyle = "bg-saffron-light/60 text-saffron hover:bg-saffron-light";
              }
            }

            if (isSelected) {
              cellStyle = "bg-deepblue text-white ring-2 ring-deepblue/20 hover:bg-deepblue/95";
            }

            return (
              <button
                key={cell.dateStr}
                onClick={() => setSelectedDateStr(cell.dateStr)}
                className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center text-sm font-semibold transition-all duration-150 cursor-pointer ${cellStyle} ${
                  isToday && !isSelected ? "ring-1.5 ring-saffron/40" : ""
                }`}
              >
                <span>{cell.day}</span>
                {/* Tiny indicator if there's a record but not active */}
                {record && !isSelected && (
                  <div className={`absolute bottom-1 w-1 h-1 rounded-full ${
                    record.completed ? "bg-success" : "bg-saffron"
                  }`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-6 border-t border-neutral-50 pt-4 text-xs font-medium text-neutral-400">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-success-light border border-success/20" />
            <span>Goal Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-saffron-light border border-saffron/20" />
            <span>Chants Logged</span>
          </div>
        </div>
      </div>

      {/* Right Column: Daily Details Drawer */}
      <div className="rounded-3xl border border-neutral-100 bg-white p-5 md:p-6 shadow-sm shadow-neutral-100/50 flex flex-col gap-6">
        <div>
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1">
            <CalendarIcon className="h-3.5 w-3.5" /> Selected Date
          </span>
          <h3 className="text-base font-bold text-neutral-800 tracking-tight mt-1.5 leading-tight">
            {selectedDetails.displayDate}
          </h3>
        </div>

        {/* Completion status tag */}
        <div className="pb-4 border-b border-neutral-50">
          {selectedDetails.hasRecord ? (
            selectedDetails.completed ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-success bg-success-light">
                <CheckCircle className="h-3.5 w-3.5" /> Goal Achieved
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-saffron bg-saffron-light">
                <Info className="h-3.5 w-3.5" /> Progress Logged
              </span>
            )
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-neutral-400 bg-neutral-100">
              No Chanting Logged
            </span>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-bg-zen p-4 rounded-2xl border border-neutral-100/30">
            <Fingerprint className="h-4.5 w-4.5 text-saffron mb-1" />
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">
              Chants
            </span>
            <p className="text-lg font-black text-neutral-850 mt-0.5 leading-none">
              {selectedDetails.chantCount}
            </p>
            <span className="text-[9px] font-medium text-neutral-400 block mt-1">
              Goal: {selectedDetails.goal}
            </span>
          </div>

          <div className="bg-bg-zen p-4 rounded-2xl border border-neutral-100/30">
            <Clock className="h-4.5 w-4.5 text-deepblue mb-1" />
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">
              Focus Time
            </span>
            <p className="text-lg font-black text-neutral-850 mt-0.5 leading-none">
              {Math.round(selectedDetails.focusMinutes * 10) / 10}m
            </p>
            <span className="text-[9px] font-medium text-neutral-400 block mt-1">
              {selectedDetails.sessionsCount} session{selectedDetails.sessionsCount === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        {/* Empty status check */}
        {!selectedDetails.hasRecord && (
          <div className="bg-bg-zen p-4 rounded-2xl border border-neutral-100/30 text-center mt-2">
            <p className="text-xs text-neutral-400 font-medium leading-relaxed">
              No chants or focus sessions recorded on this day. Select today&apos;s date in dashboard or counter to add your practice.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}

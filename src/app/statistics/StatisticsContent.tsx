"use client";

import React, { useState, useEffect } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { 
  Fingerprint, 
  Clock, 
  CheckCircle2 
} from "lucide-react";
import StatCard from "@/components/cards/StatCard";

interface MetricData {
  totalChants: number;
  totalSessions: number;
  avgSessionLength: number;
  currentStreak: number;
  bestStreak: number;
  completionRate: number;
}

interface ChartItem {
  label: string;
  chants: number;
  focusTime: number;
}

interface StatisticsContentProps {
  metrics: MetricData;
  charts: {
    daily: ChartItem[];
    weekly: ChartItem[];
    monthly: ChartItem[];
  };
}

export default function StatisticsContent({
  metrics,
  charts,
}: StatisticsContentProps) {
  const [timeRange, setTimeRange] = useState<"daily" | "weekly" | "monthly">("daily");
  const [isMounted, setIsMounted] = useState(false);

  // Avoid SSR hydration issues with Recharts
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const activeChartData = charts[timeRange];

  return (
    <div className="space-y-6 font-sans">
      
      {/* Time Range Toggle */}
      <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-neutral-100 shadow-sm shadow-neutral-100/50">
        <div>
          <h3 className="text-sm font-bold text-neutral-800 tracking-tight">Practice History</h3>
          <p className="text-xs text-neutral-400 font-medium">Observe your chanting trend over time</p>
        </div>
        <div className="flex gap-1.5 bg-neutral-100/60 p-1 rounded-2xl">
          {(["daily", "weekly", "monthly"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all capitalize cursor-pointer ${
                timeRange === range
                  ? "bg-white text-saffron shadow-xs"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Main Charts Row */}
      {isMounted ? (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Chants Chart */}
          <div className="rounded-3xl border border-neutral-100 bg-white p-5 shadow-sm shadow-neutral-100/50 flex flex-col gap-4">
            <div>
              <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                Chants Completed
              </h4>
              <p className="text-sm text-neutral-500 font-semibold mt-0.5">Total count per interval</p>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="chantsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E89B2D" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#E89B2D" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#FAF8F2" vertical={false} />
                  <XAxis dataKey="label" stroke="#777" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#777" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #FAF8F2",
                      borderRadius: "16px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                      fontSize: "12px",
                      color: "#222"
                    }}
                  />
                  <Area type="monotone" dataKey="chants" stroke="#E89B2D" strokeWidth={2.5} fillOpacity={1} fill="url(#chantsGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Focus Minutes Chart */}
          <div className="rounded-3xl border border-neutral-100 bg-white p-5 shadow-sm shadow-neutral-100/50 flex flex-col gap-4">
            <div>
              <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                Focus Time (Minutes)
              </h4>
              <p className="text-sm text-neutral-500 font-semibold mt-0.5">Total duration per interval</p>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#FAF8F2" vertical={false} />
                  <XAxis dataKey="label" stroke="#777" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#777" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #FAF8F2",
                      borderRadius: "16px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                      fontSize: "12px",
                      color: "#222"
                    }}
                  />
                  <Bar dataKey="focusTime" fill="#2F4F6F" radius={[6, 6, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-80 w-full bg-white rounded-3xl border border-neutral-100 flex items-center justify-center">
          <span className="text-xs text-neutral-400 font-semibold uppercase tracking-widest animate-pulse">
            Loading analytics...
          </span>
        </div>
      )}

      {/* Metrics Summary Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Chants Recited"
          value={metrics.totalChants.toLocaleString()}
          icon={Fingerprint}
          description="Accumulated lifetime chanting"
          bgColorClass="bg-saffron-light/50"
          iconColorClass="text-saffron"
        />

        <StatCard
          title="Sessions Completed"
          value={metrics.totalSessions}
          icon={Clock}
          description={`Average session: ${metrics.avgSessionLength}m`}
          bgColorClass="bg-deepblue-light/50"
          iconColorClass="text-deepblue"
        />

        <StatCard
          title="Daily Completion Rate"
          value={`${metrics.completionRate}%`}
          icon={CheckCircle2}
          description="Percentage of goals achieved"
          bgColorClass="bg-emerald-50"
          iconColorClass="text-success"
        />
      </div>
    </div>
  );
}

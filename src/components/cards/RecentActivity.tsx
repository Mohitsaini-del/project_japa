"use client";

import React from "react";
import { Clock, Disc, Sparkles } from "lucide-react";

export interface ActivityItem {
  id: string;
  type: "session" | "progress";
  title: string;
  time: string;
  detail: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  if (activities.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-100 bg-white p-8 text-center shadow-sm shadow-neutral-100/50">
        <Sparkles className="h-8 w-8 text-saffron/30 mx-auto mb-3 animate-pulse" />
        <h4 className="text-sm font-semibold text-neutral-700">No activity logged yet today</h4>
        <p className="text-xs text-neutral-400 font-medium mt-1 max-w-xs mx-auto">
          Take a deep breath and start your first chanting session or tap the counter to begin.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm shadow-neutral-100/50 flex flex-col gap-4">
      <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-50 pb-3">
        Recent Activity
      </h3>
      <div className="flex flex-col gap-3">
        {activities.map((act) => (
          <div key={act.id} className="flex items-center justify-between py-1 border-b border-neutral-50 last:border-0 last:pb-0">
            <div className="flex items-center gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                act.type === "session" ? "bg-deepblue-light text-deepblue" : "bg-saffron-light text-saffron"
              }`}>
                {act.type === "session" ? <Clock className="h-4 w-4" /> : <Disc className="h-4 w-4" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-700 leading-tight">{act.title}</p>
                <p className="text-xs text-neutral-400 font-medium mt-1 leading-none">{act.detail}</p>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider shrink-0 ml-3">
              {act.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

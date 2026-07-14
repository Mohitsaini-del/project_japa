"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  iconColorClass?: string;
  bgColorClass?: string;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  description,
  iconColorClass = "text-saffron",
  bgColorClass = "bg-saffron-light/50",
}: StatCardProps) {
  return (
    <div className="rounded-3xl border border-white/60 bg-white/70 backdrop-blur-md p-5 shadow-lg shadow-neutral-100/30 hover:shadow-xl hover:shadow-neutral-200/30 hover:-translate-y-1 hover:border-white/80 transition-all duration-300 flex flex-col justify-between gap-4 select-none group">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest leading-none">
          {title}
        </span>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300 shadow-sm shadow-black/5 ${bgColorClass} group-hover:scale-110`}>
          <Icon className={`h-4.5 w-4.5 ${iconColorClass}`} />
        </div>
      </div>
      <div>
        <h3 className="text-2xl font-extrabold text-neutral-800 tracking-tight leading-none group-hover:text-neutral-900 transition-colors">
          {value}
        </h3>
        {description && (
          <p className="text-xs font-semibold text-neutral-400 mt-2 transition-colors group-hover:text-neutral-500">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

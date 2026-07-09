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
    <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm shadow-neutral-100/50 flex flex-col justify-between gap-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">
          {title}
        </span>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${bgColorClass}`}>
          <Icon className={`h-4.5 w-4.5 ${iconColorClass}`} />
        </div>
      </div>
      <div>
        <h3 className="text-2xl font-extrabold text-neutral-800 tracking-tight leading-none">
          {value}
        </h3>
        {description && (
          <p className="text-xs font-medium text-neutral-400 mt-1.5">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

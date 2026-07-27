"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Plus, Edit3, Sparkles } from "lucide-react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { updateChantCountAction } from "@/lib/actions";

// Custom SVG Lotus Icon matching theme
const LotusIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 6c-2 2-3 4-3 6 0 2.5 1.5 4 3 4s3-1.5 3-4c0-2-1-4-3-6z" className="text-saffron fill-current" />
    <path d="M12 8c-3.5 1-5 3.5-5 5.5 0 1.5 1 2.5 2.5 2.5 2 0 2.5-1 2.5-2" />
    <path d="M12 8c3.5 1 5 3.5 5 5.5 0 1.5-1 2.5-2.5 2.5-2 0-2.5-1-2.5-2" />
    <path d="M7 16c-1.5-1-2.5-2.5-2.5-4 0-2 2.5-4 5-4.5" />
    <path d="M17 16c1.5-1 2.5-2.5 2.5-4 0-2-2.5-4-5-4.5" />
  </svg>
);

interface UpdateChantModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string;
  displayDate: string;
  currentCount: number;
  goal: number;
  onSuccess: () => void;
}

export default function UpdateChantModal({
  isOpen,
  onClose,
  dateStr,
  displayDate,
  currentCount,
  goal,
  onSuccess,
}: UpdateChantModalProps) {
  const { toast } = useToast();
  const [mode, setMode] = useState<"increment" | "set">("increment");
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset inputs when modal opens/closes or date changes
  useEffect(() => {
    if (isOpen) {
      setInputValue("");
      setMode("increment");
      setIsSubmitting(false);
    }
  }, [isOpen, dateStr]);

  const formatNumber = (num: number) => new Intl.NumberFormat().format(num);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(inputValue, 10);
    
    if (isNaN(val) || val < 0) {
      toast({
        title: "Invalid Count",
        description: "Please enter a valid positive number.",
        variant: "error",
      });
      return;
    }

    if (mode === "increment" && val === 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a number greater than 0 to add.",
        variant: "error",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await updateChantCountAction(dateStr, val, mode);
      if (res?.error) {
        toast({
          title: "Update Failed",
          description: res.error,
          variant: "error",
        });
      } else if (res?.count !== undefined) {
        toast({
          title: "Chant Count Updated",
          description: `Updated record for ${displayDate} to ${formatNumber(res.count)} chants.`,
          variant: "success",
        });
        onSuccess();
        onClose();
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to update chant count. Please try again.",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickAdd = (amount: number) => {
    setMode("increment");
    setInputValue(amount.toString());
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Update Chant Record">
      <div className="flex flex-col gap-5 pt-1 select-none">
        {/* Date Header Card */}
        <div className="bg-[#FAF8F5] border border-[#F0EAE1] rounded-2xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-saffron-light text-saffron flex-shrink-0">
              <Calendar className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider leading-none">
                Selected Date
              </p>
              <h4 className="text-sm font-extrabold text-neutral-800 tracking-tight leading-tight mt-0.5">
                {displayDate}
              </h4>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block leading-none">Logged</span>
            <span className="text-xs font-extrabold text-saffron leading-tight mt-0.5 block">
              {formatNumber(currentCount)} {goal > 0 ? `/ ${formatNumber(goal)}` : ""}
            </span>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 p-1 bg-[#FAF8F5] border border-[#F0EAE1] rounded-2xl gap-1">
          <button
            type="button"
            onClick={() => {
              setMode("increment");
              setInputValue("");
            }}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === "increment"
                ? "bg-white text-saffron shadow-xs border border-neutral-100"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Chants (+)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("set");
              setInputValue(currentCount.toString());
            }}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === "set"
                ? "bg-white text-saffron shadow-xs border border-neutral-100"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Set Total Count</span>
          </button>
        </div>

        {/* Quick Add Presets (only in increment mode) */}
        {mode === "increment" && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
              Quick Add Presets
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[108, 216, 500].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleQuickAdd(amt)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer active:scale-95 ${
                    inputValue === amt.toString()
                      ? "bg-saffron text-white border-saffron shadow-sm"
                      : "bg-[#FDF3E5] hover:bg-[#FBE8CD] text-saffron border-[#FCE6C9]/50"
                  }`}
                >
                  +{amt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form Entry */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
              {mode === "increment" ? "Amount to Add" : "Exact Total Count"}
            </label>
            <div className="relative">
              <Input
                type="number"
                min="0"
                placeholder={mode === "increment" ? "e.g. 108" : "e.g. 1080"}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="py-2.5 px-3.5 rounded-xl text-sm font-semibold border border-neutral-200 focus:border-saffron focus:ring-1 focus:ring-saffron"
                autoFocus
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                <LotusIcon className="h-4 w-4 text-saffron/60" />
              </div>
            </div>
            {mode === "increment" && inputValue && !isNaN(parseInt(inputValue, 10)) && (
              <p className="text-[11px] font-medium text-neutral-500 mt-1.5 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-saffron" />
                New total will be:{" "}
                <span className="font-extrabold text-neutral-800">
                  {formatNumber(currentCount + (parseInt(inputValue, 10) || 0))} chants
                </span>
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold text-neutral-600 border-neutral-200 hover:bg-neutral-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-saffron hover:bg-saffron-dark text-white cursor-pointer transition-all shadow-sm active:scale-95"
            >
              {isSubmitting ? "Saving..." : mode === "increment" ? "Add Chants" : "Save Total"}
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}

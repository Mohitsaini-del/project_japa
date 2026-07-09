"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Dialog({ isOpen, onClose, title, children }: DialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-neutral-900/20 backdrop-blur-xs"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 shadow-xl shadow-neutral-200/50 border border-neutral-100"
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-50 mb-4">
              <h3 className="text-lg font-semibold text-neutral-800">{title}</h3>
              <button
                onClick={onClose}
                className="text-neutral-400 hover:text-neutral-600 transition-colors p-1 rounded-xl hover:bg-neutral-50 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="text-neutral-600">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

"use client";

import React, { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, helperText, type = "text", ...props }, ref) => {
    return (
      <div className="flex flex-col w-full gap-1.5">
        {label && (
          <label className="text-xs font-semibold text-neutral-600 tracking-wide select-none">
            {label}
          </label>
        )}
        <input
          type={type}
          ref={ref}
          className={`w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-800 placeholder-neutral-400 focus:border-saffron focus:ring-1 focus:ring-saffron/30 outline-none transition-all duration-200 ${
            error ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : ""
          } ${className}`}
          {...props}
        />
        {error && (
          <span className="text-xs font-medium text-red-500 mt-0.5 leading-none">
            {error}
          </span>
        )}
        {!error && helperText && (
          <span className="text-[10px] font-medium text-neutral-400 mt-0.5 leading-none">
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

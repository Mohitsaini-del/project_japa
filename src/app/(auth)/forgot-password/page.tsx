"use client";

import Link from "next/link";

export default function ForgotPassword() {
  return (
    <div className="min-h-screen bg-bg-zen flex items-center justify-center p-4 select-none font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl border border-neutral-100 p-6 md:p-8 text-center shadow-xl shadow-neutral-200/40">
        <Link href="/" className="flex h-11 w-11 items-center justify-center rounded-2xl bg-saffron-light text-saffron font-bold text-xl mb-4 mx-auto">
          ॐ
        </Link>
        <h2 className="text-lg font-bold text-neutral-800 tracking-tight">Forgot Password</h2>
        <p className="text-xs text-neutral-500 font-medium mt-3 leading-relaxed">
          For this local showcase, password recovery is simulated. Please create a new account via the register screen or use standard credentials.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Link
            href="/login"
            className="w-full inline-flex items-center justify-center font-semibold rounded-2xl bg-saffron text-white py-3 text-sm hover:bg-saffron/90 transition-all cursor-pointer"
          >
            Back to Sign In
          </Link>
          <Link
            href="/register"
            className="w-full inline-flex items-center justify-center font-semibold rounded-2xl border border-neutral-200 text-neutral-600 py-3 text-sm hover:bg-neutral-50 transition-all cursor-pointer"
          >
            Create New Account
          </Link>
        </div>
      </div>
    </div>
  );
}

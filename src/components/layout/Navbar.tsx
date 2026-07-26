"use client";

import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { LogOut, Sparkles } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const getTitle = (path: string) => {
    switch (path) {
      case "/dashboard":
        return "Dashboard";
      case "/counter":
        return "Chant Counter";
      case "/timer":
        return "Focus Timer";
      case "/statistics":
        return "Statistics & Insights";
      case "/profile":
        return "Profile Settings";
      default:
        return "JapaTrack";
    }
  };

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return "Good morning";
    if (hr < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-neutral-100 bg-white/70 backdrop-blur-md px-6">
      {/* Title & Greeting */}
      <div>
        <h2 className="text-base font-bold text-neutral-800 tracking-tight md:text-lg">
          {getTitle(pathname)}
        </h2>
        {session?.user && pathname === "/dashboard" && (
          <p className="hidden text-xs text-neutral-400 font-medium sm:block leading-tight mt-0.5">
            {getGreeting()}, <span className="font-semibold text-neutral-600">{session.user.name}</span>. May your practice be peaceful today.
          </p>
        )}
      </div>

      {/* Right Side Stats & Actions */}
      <div className="flex items-center gap-4">
        {session?.user && (
          <>
            <div className="hidden items-center gap-1.5 rounded-full bg-saffron-light/60 px-3 py-1 text-xs font-semibold text-saffron md:flex">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Daily Goal: {(session.user as { dailyGoal?: number }).dailyGoal || 108}</span>
            </div>
            {/* Mobile Sign Out Trigger */}
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="lg:hidden p-2 text-neutral-400 hover:text-red-500 rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </>
        )}
      </div>
    </header>
  );
}

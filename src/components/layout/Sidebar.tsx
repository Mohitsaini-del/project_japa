"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { 
  Home, 
  Timer, 
  BarChart3, 
  User, 
  LogOut 
} from "lucide-react";
import { motion } from "framer-motion";

// Custom SVG Beads/Mala Icon
const BeadsIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="7.5" strokeDasharray="2 2" />
    <circle cx="12" cy="4.5" r="1.2" className="fill-current" />
    <circle cx="12" cy="19.5" r="1.2" className="fill-current" />
    <circle cx="4.5" cy="12" r="1.2" className="fill-current" />
    <circle cx="19.5" cy="12" r="1.2" className="fill-current" />
    <circle cx="6.7" cy="6.7" r="1.2" className="fill-current" />
    <circle cx="17.3" cy="6.7" r="1.2" className="fill-current" />
    <circle cx="6.7" cy="17.3" r="1.2" className="fill-current" />
    <circle cx="17.3" cy="17.3" r="1.2" className="fill-current" />
    <path d="M12 19.5v2.5M10.5 22h3" />
  </svg>
);

// Custom SVG Saffron Lotus Icon
const LotusIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 6c-2 2-3 4-3 6 0 2.5 1.5 4 3 4s3-1.5 3-4c0-2-1-4-3-6z" className="text-saffron fill-current" />
    <path d="M12 8c-3.5 1-5 3.5-5 5.5 0 1.5 1 2.5 2.5 2.5 2 0 2.5-1 2.5-2" />
    <path d="M12 8c3.5 1 5 3.5 5 5.5 0 1.5-1 2.5-2.5 2.5-2 0-2.5-1-2.5-2" />
    <path d="M7 16c-1.5-1-2.5-2.5-2.5-4 0-2 2.5-4 5-4.5" />
    <path d="M17 16c1.5-1 2.5-2.5 2.5-4 0-2 2.5-4 5-4.5" />
  </svg>
);

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/counter", label: "Counter", icon: BeadsIcon },
  { href: "/timer", label: "Focus Timer", icon: Timer },
  { href: "/statistics", label: "Statistics", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-[#F0EAE1] bg-white p-6 lg:flex lg:flex-col lg:justify-between z-30">
      <div className="flex flex-col gap-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-saffron-light">
            <LotusIcon className="h-5.5 w-5.5 text-saffron" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-neutral-800 tracking-tight leading-tight">JapaTrack</h1>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider leading-none mt-0.5">Your Sadhana Companion</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.label} href={item.href} className="relative group">
                <div className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? "text-saffron bg-saffron-light/50" 
                    : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50"
                }`}>
                  <item.icon className={`h-5 w-5 ${isActive ? "text-saffron" : "text-neutral-400 group-hover:text-neutral-600"}`} />
                  <span>{item.label}</span>

                  {/* Active background pill */}
                  {isActive && (
                    <motion.div
                      layoutId="activeSidebarIndicator"
                      className="absolute left-0 w-1 h-6 rounded-r-full bg-saffron"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer Settings and Illustration */}
      <div className="flex flex-col gap-4 border-t border-neutral-100 pt-4">
        {/* Sidebar Image Illustration */}
        <div className="relative w-full overflow-hidden rounded-2xl border border-neutral-100/50 bg-[#FAF8F5]">
          <img 
            src="/temple_sidebar_illustration.png" 
            alt="Stay consistent, see the transformation" 
            className="w-full h-24 object-cover object-center opacity-90"
          />
          <div className="p-3 text-center bg-white border-t border-neutral-50">
            <p className="text-[10px] text-neutral-500 font-semibold leading-relaxed">
              Stay consistent,<br />
              see the transformation. <span className="text-red-400">❤️</span>
            </p>
          </div>
        </div>

        {session?.user && (
          <div className="flex items-center justify-between px-2 pt-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-deepblue-light text-deepblue font-bold text-xs">
                {session.user.name ? session.user.name[0].toUpperCase() : "J"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-neutral-800 truncate leading-none">
                  {session.user.name}
                </p>
                <p className="text-[9px] text-neutral-400 truncate mt-0.5">
                  {session.user.email}
                </p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

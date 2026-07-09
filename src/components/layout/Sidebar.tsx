"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { 
  Home, 
  Fingerprint, 
  Timer, 
  Calendar, 
  BarChart3, 
  User, 
  LogOut 
} from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/counter", label: "Chant Counter", icon: Fingerprint },
  { href: "/timer", label: "Focus Timer", icon: Timer },
  { href: "/history", label: "History", icon: Calendar },
  { href: "/statistics", label: "Statistics", icon: BarChart3 },
  { href: "/profile", label: "Profile Settings", icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-neutral-100 bg-white p-6 lg:flex lg:flex-col lg:justify-between z-30">
      <div className="flex flex-col gap-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-2 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-saffron-light">
            <span className="text-xl text-saffron font-semibold">ॐ</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-neutral-800 tracking-tight">JapaTrack</h1>
            <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest leading-none">Mindful Practice</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className="relative group">
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

      {/* User Footer Settings */}
      {session?.user && (
        <div className="flex flex-col gap-4 border-t border-neutral-50 pt-4">
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-deepblue-light text-deepblue font-bold text-sm">
              {session.user.name ? session.user.name[0].toUpperCase() : "J"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-neutral-800 truncate leading-tight">
                {session.user.name}
              </p>
              <p className="text-xs text-neutral-400 truncate font-medium">
                {session.user.email}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-neutral-400 hover:text-red-500 hover:bg-red-50/50 transition-all duration-200 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </aside>
  );
}

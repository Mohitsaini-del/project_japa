"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Fingerprint, 
  Timer, 
  Calendar, 
  BarChart3, 
  User 
} from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/counter", icon: Fingerprint, label: "Counter" },
  { href: "/timer", icon: Timer, label: "Timer" },
  { href: "/history", icon: Calendar, label: "History" },
  { href: "/statistics", icon: BarChart3, label: "Stats" },
  { href: "/profile", icon: User, label: "Profile" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 border-t border-neutral-100 bg-white/90 backdrop-blur-md flex items-center justify-around z-30 lg:hidden px-4 pb-safe">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link key={item.href} href={item.href} className="relative flex flex-col items-center justify-center py-2 flex-1 group">
            <div className={`p-1.5 rounded-xl transition-all duration-200 ${
              isActive ? "text-saffron bg-saffron-light/50" : "text-neutral-400 hover:text-neutral-700"
            }`}>
              <item.icon className="h-5.5 w-5.5" />
            </div>

            {/* Tiny Indicator Dot */}
            {isActive && (
              <motion.div
                layoutId="activeBottomIndicator"
                className="absolute bottom-1 w-1 h-1 rounded-full bg-saffron"
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import Navbar from "./Navbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Public/Auth routes that do not require navigation sidebar or bottom nav
  const isPublicRoute = ["/", "/login", "/register", "/forgot-password"].includes(pathname);

  if (isPublicRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-bg-zen text-neutral-800">
      {/* Sidebar Navigation - Desktop */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-col lg:pl-64 min-h-screen">
        {/* Top Navbar */}
        {pathname !== "/dashboard" && <Navbar />}

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 md:p-6 pb-24 lg:pb-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Bottom Navigation - Mobile */}
      <BottomNav />
    </div>
  );
}

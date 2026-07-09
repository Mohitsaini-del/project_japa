import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/provider/AuthProvider";
import { ToastProvider } from "@/components/ui/Toast";
import AppLayout from "@/components/layout/AppLayout";

export const metadata: Metadata = {
  title: "JapaTrack - Daily Chanting Companion",
  description: "Maintain a peaceful, distraction-free daily Japa chanting practice with timer, streaks, and calendar history logging.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col bg-bg-zen text-neutral-800">
        <AuthProvider>
          <ToastProvider>
            <AppLayout>{children}</AppLayout>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

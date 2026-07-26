"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { 
  Fingerprint, 
  Timer, 
  Sparkles, 
  Calendar, 
  ChevronRight, 
  Heart, 
  Compass
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  if (status === "authenticated") {
    return null;
  }
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 20 } as const,
    },
  };

  return (
    <div className="min-h-screen bg-bg-zen text-neutral-800 flex flex-col font-sans antialiased">
      {/* Header / Nav */}
      <header className="sticky top-0 z-40 bg-bg-zen/80 backdrop-blur-md border-b border-neutral-100/55 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-saffron-light text-saffron font-bold text-lg">
              ॐ
            </div>
            <div>
              <span className="text-md font-bold tracking-tight text-neutral-800">JapaTrack</span>
              <p className="text-[9px] font-semibold text-neutral-400 uppercase tracking-widest leading-none">Mindful Practice</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-neutral-500">
            <a href="#features" className="hover:text-neutral-800 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-neutral-800 transition-colors">How It Works</a>
            <a href="#faq" className="hover:text-neutral-800 transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-semibold text-neutral-650 hover:text-neutral-900 px-3 py-2 transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="bg-saffron text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-saffron/90 transition-all shadow-sm shadow-saffron/15">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-16 md:py-24 max-w-5xl mx-auto text-center flex-1 flex flex-col justify-center items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-saffron-light text-saffron font-semibold text-2xl mb-6 shadow-sm shadow-saffron/10"
        >
          ॐ
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-neutral-800 tracking-tight leading-tight max-w-3xl"
        >
          A peaceful space for your <span className="text-saffron">daily Japa</span> practice
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-base md:text-lg text-neutral-500 font-medium max-w-xl mt-6 leading-relaxed"
        >
          Track your chanting, maintain a calm focus timer, and build a consistent mantra meditation habit. Designed to be silent, beautiful, and distraction-free.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-8 flex flex-col sm:flex-row gap-4"
        >
          <Link href="/register" className="bg-saffron text-white text-base font-bold px-8 py-3.5 rounded-2xl hover:bg-saffron/90 transition-all shadow-md shadow-saffron/20 flex items-center justify-center gap-2">
            <span>Begin Your Practice</span>
            <ChevronRight className="h-5 w-5" />
          </Link>
          <Link href="/login" className="bg-white border border-neutral-200 text-neutral-650 text-base font-bold px-8 py-3.5 rounded-2xl hover:bg-neutral-50 hover:text-neutral-800 transition-all flex items-center justify-center">
            Log In
          </Link>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="px-6 py-20 bg-white border-y border-neutral-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-xs font-bold text-saffron uppercase tracking-widest">Mindful Features</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-neutral-850 mt-2 tracking-tight">
              Quiet tools to support your focus
            </h2>
            <p className="text-sm font-medium text-neutral-400 mt-2">
              Every detail is crafted to help you focus on your mantra rather than your screen.
            </p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {/* Live Counter */}
            <motion.div variants={itemVariants} className="bg-bg-zen p-6 rounded-3xl border border-neutral-100/50 flex flex-col gap-4">
              <div className="h-10 w-10 bg-saffron-light text-saffron rounded-2xl flex items-center justify-center">
                <Fingerprint className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-850">Interactive Counter</h3>
              <p className="text-sm text-neutral-500 leading-relaxed font-medium">
                Tap to count your chants live with smooth haptic feedback and beautiful haptic animations. Backwards correction available.
              </p>
            </motion.div>

            {/* Focus Timer */}
            <motion.div variants={itemVariants} className="bg-bg-zen p-6 rounded-3xl border border-neutral-100/50 flex flex-col gap-4">
              <div className="h-10 w-10 bg-deepblue-light text-deepblue rounded-2xl flex items-center justify-center">
                <Timer className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-850">Focus Timer & Stopwatch</h3>
              <p className="text-sm text-neutral-500 leading-relaxed font-medium">
                Set countdown sessions or use the stopwatch. Track duration and chant rate seamlessly, auto-saving when finished.
              </p>
            </motion.div>

            {/* Streaks & Progress */}
            <motion.div variants={itemVariants} className="bg-bg-zen p-6 rounded-3xl border border-neutral-100/50 flex flex-col gap-4">
              <div className="h-10 w-10 bg-emerald-50 text-success rounded-2xl flex items-center justify-center">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-850">Habit Streaks</h3>
              <p className="text-sm text-neutral-500 leading-relaxed font-medium">
                Maintain consistency with daily goal indicators, current streaks, and best streak trackers to protect your daily practice.
              </p>
            </motion.div>

            {/* Calendar History */}
            <motion.div variants={itemVariants} className="bg-bg-zen p-6 rounded-3xl border border-neutral-100/50 flex flex-col gap-4">
              <div className="h-10 w-10 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center">
                <Calendar className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-850">Chanting Calendar</h3>
              <p className="text-sm text-neutral-500 leading-relaxed font-medium">
                Review your chanting days on a beautiful calendar grid. Inspect specific dates for detailed sessions and total progress.
              </p>
            </motion.div>

            {/* Tracking Modes */}
            <motion.div variants={itemVariants} className="bg-bg-zen p-6 rounded-3xl border border-neutral-100/50 flex flex-col gap-4">
              <div className="h-10 w-10 bg-sky-50 text-sky-500 rounded-2xl flex items-center justify-center">
                <Compass className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-850">Flexible Tracking</h3>
              <p className="text-sm text-neutral-500 leading-relaxed font-medium">
                Support for Live, Manual, and Hybrid modes. Update your chants in real-time or log the day&apos;s total in one serene entry.
              </p>
            </motion.div>

            {/* Calm UX */}
            <motion.div variants={itemVariants} className="bg-bg-zen p-6 rounded-3xl border border-neutral-100/50 flex flex-col gap-4">
              <div className="h-10 w-10 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center">
                <Heart className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-850">Calm & Minimal UX</h3>
              <p className="text-sm text-neutral-500 leading-relaxed font-medium">
                No loud colors, social distractions, or pushy gamification. Just you, your mantra, and a peaceful atmosphere.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="px-6 py-20 max-w-5xl mx-auto w-full">
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-xs font-bold text-saffron uppercase tracking-widest">The Path</span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-neutral-850 mt-2 tracking-tight">
            How JapaTrack Works
          </h2>
          <p className="text-sm font-medium text-neutral-400 mt-2">
            Three simple steps to establish a consistent, peaceful chanting rhythm.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="relative p-6 rounded-2xl bg-white border border-neutral-100 text-center flex flex-col items-center">
            <div className="h-8 w-8 rounded-full bg-saffron text-white flex items-center justify-center font-bold text-sm mb-4">1</div>
            <h3 className="font-bold text-neutral-800 text-base">Set Your Intentions</h3>
            <p className="text-xs text-neutral-500 mt-2 font-medium leading-relaxed">
              Register securely and customize your preferred mantra, deity, and daily chanting goal (such as 108 chants or 16 rounds).
            </p>
          </div>

          <div className="relative p-6 rounded-2xl bg-white border border-neutral-100 text-center flex flex-col items-center">
            <div className="h-8 w-8 rounded-full bg-saffron text-white flex items-center justify-center font-bold text-sm mb-4">2</div>
            <h3 className="font-bold text-neutral-800 text-base">Chant & Breathe</h3>
            <p className="text-xs text-neutral-500 mt-2 font-medium leading-relaxed">
              Use the interactive live counter with haptics, or start the focus timer to lock in dedicated sessions.
            </p>
          </div>

          <div className="relative p-6 rounded-2xl bg-white border border-neutral-100 text-center flex flex-col items-center">
            <div className="h-8 w-8 rounded-full bg-saffron text-white flex items-center justify-center font-bold text-sm mb-4">3</div>
            <h3 className="font-bold text-neutral-800 text-base">Cultivate Consistency</h3>
            <p className="text-xs text-neutral-500 mt-2 font-medium leading-relaxed">
              Observe your streaks grow and track historical progress trends, fostering devotion and inner stillness.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="px-6 py-20 bg-white border-t border-neutral-100">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-saffron uppercase tracking-widest">Seek Answers</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-neutral-850 mt-2 tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="flex flex-col gap-6">
            <div className="p-5 bg-bg-zen rounded-2xl border border-neutral-100/50">
              <h4 className="font-bold text-neutral-800 text-sm">Is this app free to use?</h4>
              <p className="text-xs text-neutral-500 font-medium mt-2 leading-relaxed">
                Yes, JapaTrack is completely free, peaceful, and open. There are no ads, paid walls, or intrusive analytics tracking.
              </p>
            </div>

            <div className="p-5 bg-bg-zen rounded-2xl border border-neutral-100/50">
              <h4 className="font-bold text-neutral-800 text-sm">What is the &quot;Hybrid&quot; tracking mode?</h4>
              <p className="text-xs text-neutral-500 font-medium mt-2 leading-relaxed">
                Hybrid mode lets you utilize both live tapping and manual entry. If you add progress manually (e.g. logging 500 chants) and it is higher than your live counter, it updates to the manual value.
              </p>
            </div>

            <div className="p-5 bg-bg-zen rounded-2xl border border-neutral-100/50">
              <h4 className="font-bold text-neutral-800 text-sm">How do focus sessions affect my daily count?</h4>
              <p className="text-xs text-neutral-500 font-medium mt-2 leading-relaxed">
                When you finish a countdown timer or stopwatch session, JapaTrack prompts you to save it. Saving adds your chanting duration and counts directly to today&apos;s progress.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="px-6 py-20 text-center max-w-4xl mx-auto">
        <div className="bg-saffron-light/50 border border-saffron/20 rounded-3xl p-8 md:p-12 flex flex-col items-center">
          <span className="text-xs font-bold text-saffron uppercase tracking-widest">Connect Internally</span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-neutral-800 mt-2 tracking-tight">
            Cultivate your spiritual habit today
          </h2>
          <p className="text-sm text-neutral-500 font-medium mt-3 max-w-md leading-relaxed">
            Join other practitioners maintaining quiet consistency and mindful devotion.
          </p>
          <Link href="/register" className="mt-8 bg-saffron text-white text-sm font-bold px-8 py-3.5 rounded-2xl hover:bg-saffron/90 transition-all shadow-md shadow-saffron/15">
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-100 bg-white py-8 px-6 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="text-saffron text-sm font-bold">ॐ</span>
            <span>&copy; {new Date().getFullYear()} JapaTrack. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <a href="#features" className="hover:text-neutral-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-neutral-600 transition-colors">How it works</a>
            <a href="#faq" className="hover:text-neutral-600 transition-colors">FAQ</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

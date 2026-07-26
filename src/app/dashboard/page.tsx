import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardContent from "./DashboardContent";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Fetch current user record
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      dailyGoal: true,
      currentStreak: true,
      bestStreak: true,
      preferredDeity: true,
      preferredMantra: true,
      trackingMode: true,
    },
  });

  if (!user) {
    redirect("/api/auth/signout?redirectTo=/login");
  }

  // Align dates with UTC midnight
  const todayStr = new Date().toISOString().split("T")[0];
  const today = new Date(`${todayStr}T00:00:00Z`);

  // Fetch today's progress
  const progress = await prisma.dailyProgress.findUnique({
    where: {
      userId_date: {
        userId,
        date: today,
      },
    },
  });

  // Fetch today's focus sessions
  const sessions = await prisma.focusSession.findMany({
    where: {
      userId,
      startTime: {
        gte: today,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <DashboardContent
      initialUser={user}
      initialProgress={progress ? {
        chantCount: progress.chantCount,
        goal: progress.goal,
        focusMinutes: progress.focusMinutes,
        completed: progress.completed,
      } : null}
      initialSessions={sessions.map(s => ({
        id: s.id,
        startTime: s.startTime,
        duration: s.duration,
        chantCount: s.chantCount,
      }))}
    />
  );
}

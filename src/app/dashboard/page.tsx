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

  // Align dates with UTC midnight
  const todayStr = new Date().toISOString().split("T")[0];
  const today = new Date(`${todayStr}T00:00:00Z`);

  // Parallelize database queries for high speed
  const [user, progress, sessions] = await Promise.all([
    prisma.user.findUnique({
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
    }),
    prisma.dailyProgress.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
    }),
    prisma.focusSession.findMany({
      where: {
        userId,
        startTime: {
          gte: today,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  if (!user) {
    redirect("/api/auth/signout?redirectTo=/login");
  }

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

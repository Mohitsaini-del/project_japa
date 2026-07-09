import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import HistoryContent from "./HistoryContent";

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Fetch all historical daily progresses
  const progressList = await prisma.dailyProgress.findMany({
    where: { userId },
    orderBy: { date: "asc" },
  });

  // Fetch all focus sessions to count sessions per day
  const sessions = await prisma.focusSession.findMany({
    where: { userId },
    select: {
      id: true,
      startTime: true,
      duration: true,
      chantCount: true,
    },
    orderBy: { startTime: "asc" },
  });

  // Map progress database model to a plain object
  const progressData = progressList.map((p) => ({
    id: p.id,
    date: p.date.toISOString().split("T")[0],
    chantCount: p.chantCount,
    goal: p.goal,
    focusMinutes: p.focusMinutes,
    completed: p.completed,
  }));

  const sessionData = sessions.map((s) => ({
    date: s.startTime.toISOString().split("T")[0],
    duration: s.duration,
    chantCount: s.chantCount,
  }));

  return (
    <HistoryContent
      progressData={progressData}
      sessionData={sessionData}
    />
  );
}

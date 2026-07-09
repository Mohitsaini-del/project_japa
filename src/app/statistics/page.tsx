import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import StatisticsContent from "./StatisticsContent";

export default async function StatisticsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Fetch user streaks
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      currentStreak: true,
      bestStreak: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  // Fetch all progress logs
  const progressList = await prisma.dailyProgress.findMany({
    where: { userId },
    orderBy: { date: "asc" },
  });

  // Fetch all focus sessions
  const sessions = await prisma.focusSession.findMany({
    where: { userId },
    select: {
      duration: true,
    },
  });

  // 1. Calculate General Card Metrics
  const totalChants = progressList.reduce((acc, curr) => acc + curr.chantCount, 0);
  const totalSessions = sessions.length;
  
  const totalFocusMinutes = progressList.reduce((acc, curr) => acc + curr.focusMinutes, 0);
  const avgSessionLength = totalSessions > 0 ? Math.round(totalFocusMinutes / totalSessions) : 0;
  
  const completedDays = progressList.filter((p) => p.completed).length;
  const totalDays = progressList.length;
  const completionRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

  // 2. Compile Chart Data - Daily View (Last 7 Days)
  const dailyData = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    
    const record = progressList.find((p) => p.date.toISOString().split("T")[0] === dateStr);
    const label = d.toLocaleDateString("en-US", { weekday: "short" });
    
    dailyData.push({
      label,
      chants: record?.chantCount ?? 0,
      focusTime: record ? Math.round(record.focusMinutes) : 0,
    });
  }

  // 3. Compile Chart Data - Weekly View (Last 4 Weeks)
  const weeklyData = [];
  for (let i = 3; i >= 0; i--) {
    const startOffset = i * 7;
    const endOffset = startOffset + 6;
    
    const dStart = new Date(today);
    dStart.setDate(today.getDate() - endOffset);
    const dEnd = new Date(today);
    dEnd.setDate(today.getDate() - startOffset);

    // Filter progresses inside this week window
    const recordsInWeek = progressList.filter((p) => {
      const pTime = p.date.getTime();
      return pTime >= dStart.getTime() && pTime <= dEnd.getTime();
    });

    const chants = recordsInWeek.reduce((acc, curr) => acc + curr.chantCount, 0);
    const focusTime = recordsInWeek.reduce((acc, curr) => acc + curr.focusMinutes, 0);

    weeklyData.push({
      label: `Wk -${i}`,
      chants,
      focusTime: Math.round(focusTime),
    });
  }

  // 4. Compile Chart Data - Monthly View (Last 6 Months)
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const label = d.toLocaleDateString("en-US", { month: "short" });
    
    const recordsInMonth = progressList.filter((p) => {
      const pDate = p.date;
      return pDate.getFullYear() === d.getFullYear() && pDate.getMonth() === d.getMonth();
    });

    const chants = recordsInMonth.reduce((acc, curr) => acc + curr.chantCount, 0);
    const focusTime = recordsInMonth.reduce((acc, curr) => acc + curr.focusMinutes, 0);

    monthlyData.push({
      label,
      chants,
      focusTime: Math.round(focusTime),
    });
  }

  return (
    <StatisticsContent
      metrics={{
        totalChants,
        totalSessions,
        avgSessionLength,
        currentStreak: user.currentStreak,
        bestStreak: user.bestStreak,
        completionRate,
      }}
      charts={{
        daily: dailyData,
        weekly: weeklyData,
        monthly: monthlyData,
      }}
    />
  );
}

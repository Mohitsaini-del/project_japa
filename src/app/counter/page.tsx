import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CounterContent from "./CounterContent";

export default async function CounterPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      dailyGoal: true,
      preferredMantra: true,
      preferredDeity: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const today = new Date(`${todayStr}T00:00:00Z`);

  const progress = await prisma.dailyProgress.findUnique({
    where: {
      userId_date: {
        userId,
        date: today,
      },
    },
  });

  return (
    <CounterContent
      initialCount={progress?.chantCount ?? 0}
      initialGoal={progress?.goal ?? user.dailyGoal}
      preferredMantra={user.preferredMantra}
      preferredDeity={user.preferredDeity}
    />
  );
}

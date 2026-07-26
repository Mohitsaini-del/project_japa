import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TimerContent from "./TimerContent";

export default async function TimerPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      preferredMantra: true,
      preferredDeity: true,
    },
  });

  if (!user) {
    redirect("/api/auth/signout?redirectTo=/login");
  }

  return (
    <TimerContent
      preferredMantra={user.preferredMantra}
      preferredDeity={user.preferredDeity}
    />
  );
}

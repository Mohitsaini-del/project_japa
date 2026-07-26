import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProfileContent from "./ProfileContent";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      preferredDeity: true,
      preferredMantra: true,
      dailyGoal: true,
      trackingMode: true,
    },
  });

  if (!user) {
    redirect("/api/auth/signout?redirectTo=/login");
  }

  return (
    <ProfileContent
      initialUser={{
        name: user.name ?? "",
        email: user.email,
        preferredDeity: user.preferredDeity ?? "",
        preferredMantra: user.preferredMantra ?? "",
        dailyGoal: user.dailyGoal,
        trackingMode: user.trackingMode as "live" | "manual" | "hybrid",
      }}
    />
  );
}

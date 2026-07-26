"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { auth } from "@/lib/auth";

// Validation schemas
const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  preferredDeity: z.string().optional().nullable(),
  preferredMantra: z.string().optional().nullable(),
  dailyGoal: z.coerce.number().min(1, "Goal must be at least 1"),
  trackingMode: z.enum(["live", "manual", "hybrid"]),
});

/**
 * Register a new user
 */
export async function registerUserAction(prevState: unknown, formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    const validated = registerSchema.safeParse({ email, password, name });
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return { error: "User already exists with this email" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        dailyGoal: 108,
        trackingMode: "hybrid",
      },
    });

    return { success: true };
  } catch (error: unknown) {
    console.error("Registration error:", error);
    return { error: "Something went wrong during registration" };
  }
}

/**
 * Helper to update user streaks based on historical daily achievements
 */
async function updateStreaks(userId: string) {
  const progresses = await prisma.dailyProgress.findMany({
    where: { userId },
    orderBy: { date: "desc" },
  });

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);

  // Check if today or yesterday has met the goal to keep streak alive
  const todayProgress = progresses.find((p) => p.date.getTime() === today.getTime());
  const yesterdayProgress = progresses.find((p) => p.date.getTime() === yesterday.getTime());

  const isTodayMet = todayProgress && todayProgress.chantCount >= todayProgress.goal;
  const isYesterdayMet = yesterdayProgress && yesterdayProgress.chantCount >= yesterdayProgress.goal;

  let currentStreak = 0;

  if (isTodayMet || isYesterdayMet) {
    // If today is met, start checking from today. Else start from yesterday.
    const expectedDate = isTodayMet ? new Date(today) : new Date(yesterday);

    for (const p of progresses) {
      const pDate = new Date(p.date);
      pDate.setUTCHours(0, 0, 0, 0);

      if (pDate.getTime() === expectedDate.getTime()) {
        if (p.chantCount >= p.goal) {
          currentStreak++;
          // Move back by 1 day
          expectedDate.setUTCDate(expectedDate.getUTCDate() - 1);
        } else {
          break;
        }
      } else if (pDate.getTime() < expectedDate.getTime()) {
        // Gap in dates, streak is broken
        break;
      }
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { bestStreak: true },
  });

  if (user) {
    const bestStreak = Math.max(user.bestStreak, currentStreak);
    await prisma.user.update({
      where: { id: userId },
      data: {
        currentStreak,
        bestStreak,
      },
    });
  }
}

/**
 * Increment or set the daily chant count
 */
export async function updateChantCountAction(
  dateStr: string, // formatted YYYY-MM-DD
  value: number,
  mode: "increment" | "set"
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const userId = session.user.id;
  const date = new Date(`${dateStr}T00:00:00Z`);

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { dailyGoal: true, trackingMode: true },
    });

    if (!user) return { error: "User not found" };

    // Find or create daily progress
    const progress = await prisma.dailyProgress.findUnique({
      where: {
        userId_date: {
          userId,
          date,
        },
      },
    });

    const goal = progress ? progress.goal : user.dailyGoal;
    let newCount = 0;

    if (progress) {
      if (mode === "increment") {
        newCount = Math.max(0, progress.chantCount + value);
      } else {
        newCount = Math.max(0, value);
      }

      await prisma.dailyProgress.update({
        where: { id: progress.id },
        data: {
          chantCount: newCount,
          completed: newCount >= goal,
        },
      });
    } else {
      // Record doesn't exist yet for today
      newCount = Math.max(0, value);
      await prisma.dailyProgress.create({
        data: {
          userId,
          date,
          chantCount: newCount,
          goal,
          completed: newCount >= goal,
        },
      });
    }

    // Recalculate user streaks
    await updateStreaks(userId);

    revalidatePath("/dashboard");
    revalidatePath("/counter");
    revalidatePath("/statistics");

    return { success: true, count: newCount };
  } catch (error) {
    console.error("Error updating chant count:", error);
    return { error: "Database error" };
  }
}

/**
 * Save focus session details
 */
export async function saveFocusSessionAction(data: {
  startTime: Date;
  endTime: Date;
  duration: number; // in seconds
  chantCount: number;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const userId = session.user.id;

  try {
    // Save the FocusSession
    await prisma.focusSession.create({
      data: {
        userId,
        startTime: data.startTime,
        endTime: data.endTime,
        duration: data.duration,
        chantCount: data.chantCount,
      },
    });

    // Update DailyProgress
    const localDate = new Date(data.startTime);
    const dateStr = localDate.toISOString().split("T")[0];
    const date = new Date(`${dateStr}T00:00:00Z`);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { dailyGoal: true },
    });

    if (!user) return { error: "User not found" };

    const progress = await prisma.dailyProgress.findUnique({
      where: {
        userId_date: {
          userId,
          date,
        },
      },
    });

    const focusMinutes = data.duration / 60;
    const goal = progress ? progress.goal : user.dailyGoal;

    if (progress) {
      const newChants = progress.chantCount + data.chantCount;
      await prisma.dailyProgress.update({
        where: { id: progress.id },
        data: {
          chantCount: newChants,
          focusMinutes: progress.focusMinutes + focusMinutes,
          completed: newChants >= goal,
        },
      });
    } else {
      await prisma.dailyProgress.create({
        data: {
          userId,
          date,
          chantCount: data.chantCount,
          goal,
          focusMinutes,
          completed: data.chantCount >= goal,
        },
      });
    }

    // Update streaks
    await updateStreaks(userId);

    revalidatePath("/dashboard");
    revalidatePath("/timer");
    revalidatePath("/statistics");

    return { success: true };
  } catch (error) {
    console.error("Error saving focus session:", error);
    return { error: "Database error" };
  }
}

/**
 * Update Profile Settings
 */
export async function updateProfileSettingsAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const userId = session.user.id;

  try {
    const name = formData.get("name") as string;
    const preferredDeity = formData.get("preferredDeity") as string;
    const preferredMantra = formData.get("preferredMantra") as string;
    const dailyGoal = formData.get("dailyGoal");
    const trackingMode = formData.get("trackingMode") as string;

    const validated = profileSchema.safeParse({
      name,
      preferredDeity: preferredDeity || null,
      preferredMantra: preferredMantra || null,
      dailyGoal,
      trackingMode,
    });

    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: validated.data,
    });

    // Update today's goal as well if it exists
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

    if (progress) {
      await prisma.dailyProgress.update({
        where: { id: progress.id },
        data: {
          goal: validated.data.dailyGoal,
          completed: progress.chantCount >= validated.data.dailyGoal,
        },
      });
      await updateStreaks(userId);
    }

    revalidatePath("/dashboard");
    revalidatePath("/profile");

    return {
      success: true,
      user: {
        name: updatedUser.name,
        preferredDeity: updatedUser.preferredDeity,
        preferredMantra: updatedUser.preferredMantra,
        dailyGoal: updatedUser.dailyGoal,
        trackingMode: updatedUser.trackingMode,
      },
    };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { error: "Database error" };
  }
}

/**
 * Fetch calendar counts & statistics for the custom dashboard calendar widget
 */
export async function getDashboardCalendarDataAction(year: number, month: number) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const userId = session.user.id;

  try {
    // 1. Total chants (all time)
    const totalAggregate = await prisma.dailyProgress.aggregate({
      where: { userId },
      _sum: { chantCount: true },
    });
    const totalChants = totalAggregate._sum.chantCount ?? 0;

    // 2. Yearly total chants
    const startOfYear = new Date(Date.UTC(year, 0, 1));
    const endOfYear = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
    const yearlyAggregate = await prisma.dailyProgress.aggregate({
      where: {
        userId,
        date: {
          gte: startOfYear,
          lte: endOfYear,
        },
      },
      _sum: { chantCount: true },
    });
    const yearlyTotal = yearlyAggregate._sum.chantCount ?? 0;

    // 3. Monthly total chants
    const startOfMonth = new Date(Date.UTC(year, month - 1, 1));
    const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
    const monthlyAggregate = await prisma.dailyProgress.aggregate({
      where: {
        userId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: { chantCount: true },
    });
    const monthlyTotal = monthlyAggregate._sum.chantCount ?? 0;

    // 4. Daily progress records for the selected month to build the grid
    const monthlyProgress = await prisma.dailyProgress.findMany({
      where: {
        userId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      select: {
        date: true,
        chantCount: true,
        goal: true,
        completed: true,
      },
    });

    // Map progress list to dynamic dictionary of day -> info
    const progressMap: Record<number, { count: number; goal: number; completed: boolean }> = {};
    monthlyProgress.forEach((p) => {
      const day = p.date.getUTCDate();
      progressMap[day] = {
        count: p.chantCount,
        goal: p.goal,
        completed: p.completed,
      };
    });

    return {
      success: true,
      data: {
        totalChants,
        yearlyTotal,
        monthlyTotal,
        progressMap,
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard calendar data:", error);
    return { error: "Database error" };
  }
}

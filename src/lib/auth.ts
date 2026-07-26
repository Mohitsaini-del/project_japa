import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

interface CustomUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  dailyGoal?: number;
  preferredDeity?: string | null;
  preferredMantra?: string | null;
  trackingMode?: string;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "super-secret-japa-auth-key-2026",
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || "",
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (!parsedCredentials.success) return null;

        const { email, password } = parsedCredentials.data;
        const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (!user || !user.password) return null;

        const passwordsMatch = await bcrypt.compare(password, user.password);
        if (passwordsMatch) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            dailyGoal: user.dailyGoal,
            preferredDeity: user.preferredDeity,
            preferredMantra: user.preferredMantra,
            trackingMode: user.trackingMode,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const customUser = user as CustomUser;
        token.id = customUser.id;
        token.trackingMode = customUser.trackingMode ?? "hybrid";
        token.dailyGoal = customUser.dailyGoal ?? 108;
        token.preferredDeity = customUser.preferredDeity ?? "";
        token.preferredMantra = customUser.preferredMantra ?? "";
      }
      if (trigger === "update" && session) {
        if (session.trackingMode !== undefined) token.trackingMode = session.trackingMode;
        if (session.dailyGoal !== undefined) token.dailyGoal = session.dailyGoal;
        if (session.preferredDeity !== undefined) token.preferredDeity = session.preferredDeity;
        if (session.preferredMantra !== undefined) token.preferredMantra = session.preferredMantra;
        if (session.name !== undefined) token.name = session.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        const customUser = session.user as CustomUser;
        customUser.id = token.id as string;
        customUser.trackingMode = token.trackingMode as string;
        customUser.dailyGoal = token.dailyGoal as number;
        customUser.preferredDeity = token.preferredDeity as string;
        customUser.preferredMantra = token.preferredMantra as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});

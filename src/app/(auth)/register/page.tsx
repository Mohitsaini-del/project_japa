"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSession, signIn } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { registerUserAction } from "@/lib/actions";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

export default function Register() {
  const router = useRouter();
  const { toast } = useToast();
  const { status } = useSession();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-bg-zen flex flex-col items-center justify-center p-4 select-none font-sans">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-saffron-light text-saffron font-bold text-xl animate-pulse mb-3">
          ॐ
        </div>
        <p className="text-xs text-neutral-450 font-semibold animate-pulse">Loading JapaTrack...</p>
      </div>
    );
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("password", data.password);

      const res = await registerUserAction(null, formData);

      if (res?.error) {
        toast({ title: "Registration Failed", description: res.error, variant: "error" });
      } else {
        toast({
          title: "Registration Successful",
          description: "Your account has been created. Please sign in.",
          variant: "success",
        });
        router.push("/login");
      }
    } catch {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-bg-zen flex items-center justify-center p-4 md:p-6 select-none font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl border border-neutral-100 p-6 md:p-8 shadow-xl shadow-neutral-200/40">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <Link href="/" className="flex h-11 w-11 items-center justify-center rounded-2xl bg-saffron-light text-saffron font-bold text-xl mb-3">
            ॐ
          </Link>
          <h2 className="text-xl font-bold text-neutral-800 tracking-tight">Create your account</h2>
          <p className="text-xs text-neutral-400 font-semibold mt-1">Begin JapaTrack and log your daily chanting sessions</p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Name"
            placeholder="Your name"
            error={errors.name?.message}
            {...register("name")}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register("email")}
          />

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              error={errors.password?.message}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-9.5 text-neutral-400 hover:text-neutral-600 transition-colors p-1"
            >
              {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
            </button>
          </div>

          <Button type="submit" className="w-full mt-2" isLoading={loading}>
            Sign Up
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-100"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-wider select-none font-bold">
            <span className="bg-white px-3 text-neutral-400">Or continue with</span>
          </div>
        </div>

        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800 transition-all duration-200 cursor-pointer"
        >
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.59 5.59 0 0 1 8.4 12.928a5.59 5.59 0 0 1 5.59-5.59 5.46 5.46 0 0 1 3.734 1.448l3.11-3.11A9.87 9.87 0 0 0 13.99 3c-5.523 0-10 4.477-10 10s4.477 10 10 10c5.783 0 9.77-4.062 9.77-9.94a8.88 8.88 0 0 0-.166-1.775H12.24Z"
            />
          </svg>
          <span>Google Login</span>
        </button>

        {/* Redirect Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-neutral-400 font-medium">
            Already have an account?{" "}
            <Link href="/login" className="text-saffron font-bold hover:underline select-none">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

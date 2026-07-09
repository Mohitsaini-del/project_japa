"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { 
  User as UserIcon, 
  Settings, 
  Target, 
  Compass, 
  Check
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { updateProfileSettingsAction } from "@/lib/actions";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  preferredDeity: z.string().optional(),
  preferredMantra: z.string().optional(),
  dailyGoal: z.number().min(1, "Daily Goal must be at least 1 chant"),
  trackingMode: z.enum(["live", "manual", "hybrid"]),
});

type FormData = z.infer<typeof schema>;

interface ProfileContentProps {
  initialUser: {
    name: string;
    email: string;
    preferredDeity: string;
    preferredMantra: string;
    dailyGoal: number;
    trackingMode: "live" | "manual" | "hybrid";
  };
}

export default function ProfileContent({ initialUser }: ProfileContentProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { update } = useSession();
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialUser.name,
      preferredDeity: initialUser.preferredDeity,
      preferredMantra: initialUser.preferredMantra,
      dailyGoal: initialUser.dailyGoal,
      trackingMode: initialUser.trackingMode,
    },
  });

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("preferredDeity", data.preferredDeity || "");
      formData.append("preferredMantra", data.preferredMantra || "");
      formData.append("dailyGoal", data.dailyGoal.toString());
      formData.append("trackingMode", data.trackingMode);

      const res = await updateProfileSettingsAction(formData);

      if (res?.error || !res?.user) {
        toast({
          title: "Update Failed",
          description: res?.error || "Unable to save profile changes.",
          variant: "error",
        });
      } else {
        // Update client-side NextAuth session
        await update({
          name: res.user.name,
          dailyGoal: res.user.dailyGoal,
          preferredDeity: res.user.preferredDeity,
          preferredMantra: res.user.preferredMantra,
          trackingMode: res.user.trackingMode,
        });

        toast({
          title: "Profile Saved",
          description: "Your chanting configuration and preferences have been updated.",
          variant: "success",
        });
        
        router.refresh();
      }
    } catch {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeitySelect = (val: string) => {
    setValue("preferredDeity", val);
  };

  const handleMantraSelect = (val: string) => {
    setValue("preferredMantra", val);
  };

  return (
    <div className="max-w-2xl mx-auto font-sans">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Profile General Card */}
        <div className="rounded-3xl border border-neutral-100 bg-white p-5 md:p-6 shadow-sm shadow-neutral-100/50 space-y-4">
          <div className="flex items-center gap-2 border-b border-neutral-50 pb-3">
            <UserIcon className="h-5 w-5 text-saffron" />
            <h3 className="text-sm font-bold text-neutral-800 tracking-tight">Personal Details</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Name"
              placeholder="Your full name"
              error={errors.name?.message}
              {...register("name")}
            />
            <div className="flex flex-col gap-1.5 opacity-60">
              <label className="text-xs font-semibold text-neutral-600 tracking-wide">
                Email Address
              </label>
              <input
                disabled
                value={initialUser.email}
                className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-500 cursor-not-allowed outline-none"
              />
              <span className="text-[10px] font-medium text-neutral-400 leading-none">
                Email login identifier cannot be changed.
              </span>
            </div>
          </div>
        </div>

        {/* Chanting Preferences Card */}
        <div className="rounded-3xl border border-neutral-100 bg-white p-5 md:p-6 shadow-sm shadow-neutral-100/50 space-y-6">
          <div className="flex items-center gap-2 border-b border-neutral-50 pb-3">
            <Settings className="h-5 w-5 text-deepblue" />
            <h3 className="text-sm font-bold text-neutral-800 tracking-tight">Japa Preferences</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Preferred Deity */}
            <div className="space-y-2">
              <Input
                label="Preferred Deity"
                placeholder="Krishna, Shiva, Rama, Durga, etc."
                error={errors.preferredDeity?.message}
                {...register("preferredDeity")}
              />
              <div className="flex flex-wrap gap-1.5">
                {["Krishna", "Shiva", "Rama", "Durga"].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handleDeitySelect(d)}
                    className="px-2.5 py-1 bg-neutral-100/60 hover:bg-neutral-100 text-[10px] font-bold text-neutral-500 rounded-lg transition-colors cursor-pointer"
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Preferred Mantra */}
            <div className="space-y-2">
              <Input
                label="Preferred Mantra"
                placeholder="Hare Krishna Maha-mantra, etc."
                error={errors.preferredMantra?.message}
                {...register("preferredMantra")}
              />
              <div className="flex flex-wrap gap-1.5">
                {["Krishna Maha-mantra", "Om Namah Shivaya", "Gayatri Mantra"].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleMantraSelect(m)}
                    className="px-2.5 py-1 bg-neutral-100/60 hover:bg-neutral-100 text-[10px] font-bold text-neutral-500 rounded-lg transition-colors cursor-pointer"
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Practice Goals Card */}
        <div className="rounded-3xl border border-neutral-100 bg-white p-5 md:p-6 shadow-sm shadow-neutral-100/50 space-y-6">
          <div className="flex items-center gap-2 border-b border-neutral-50 pb-3">
            <Target className="h-5 w-5 text-success" />
            <h3 className="text-sm font-bold text-neutral-800 tracking-tight">Practice Goals</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Daily Goal */}
            <Input
              label="Daily Chanting Goal"
              type="number"
              min="1"
              error={errors.dailyGoal?.message}
              {...register("dailyGoal", { valueAsNumber: true })}
              helperText="Common targets: 108 chants (1 round), 1728 chants (16 rounds)."
            />

            {/* Tracking Mode */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-600 tracking-wide select-none">
                Tracking Mode
              </label>
              <select
                className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-800 outline-none focus:border-saffron focus:ring-1 focus:ring-saffron/30 transition-all cursor-pointer"
                {...register("trackingMode")}
              >
                <option value="live">Live Counter Tapping Only</option>
                <option value="manual">Manual Log Entry Only</option>
                <option value="hybrid">Hybrid (Counter & Manual Update)</option>
              </select>
              <span className="text-[10px] font-medium text-neutral-400 mt-0.5 leading-tight flex items-start gap-1">
                <Compass className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span>Hybrid lets you tap increments live OR update the day&apos;s total total count at once.</span>
              </span>
            </div>
          </div>
        </div>

        {/* Save CTA */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard")}
            disabled={saving}
            className="rounded-2xl"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={saving}
            className="rounded-2xl px-6"
          >
            <Check className="h-4.5 w-4.5 mr-1" /> Save Settings
          </Button>
        </div>

      </form>
    </div>
  );
}

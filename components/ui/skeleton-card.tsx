"use client"

import { cn } from "@/lib/utils"

interface SkeletonCardProps {
  className?: string
  variant?: "default" | "chart" | "kpi" | "avatar"
}

export function SkeletonCard({ className, variant = "default" }: SkeletonCardProps) {
  const shimmer =
    "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent dark:before:via-white/5"

  if (variant === "kpi") {
    return (
      <div className={cn("rounded-xl border border-border bg-card p-5", className)}>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className={cn("h-4 w-24 rounded-md bg-muted", shimmer)} />
            <div className={cn("h-8 w-32 rounded-md bg-muted", shimmer)} />
          </div>
          <div className={cn("h-10 w-10 rounded-lg bg-muted", shimmer)} />
        </div>
        <div className={cn("mt-3 h-4 w-40 rounded-md bg-muted", shimmer)} />
      </div>
    )
  }

  if (variant === "chart") {
    return (
      <div className={cn("rounded-xl border border-border bg-card p-5", className)}>
        <div className="mb-4 flex items-center justify-between">
          <div className="space-y-2">
            <div className={cn("h-5 w-32 rounded-md bg-muted", shimmer)} />
            <div className={cn("h-4 w-48 rounded-md bg-muted", shimmer)} />
          </div>
        </div>
        <div className={cn("h-[200px] w-full rounded-lg bg-muted", shimmer)} />
      </div>
    )
  }

  if (variant === "avatar") {
    return (
      <div className={cn("flex flex-col items-center gap-3", className)}>
        <div className={cn("h-24 w-24 rounded-full bg-muted", shimmer)} />
        <div className={cn("h-4 w-20 rounded-md bg-muted", shimmer)} />
      </div>
    )
  }

  return (
    <div className={cn("rounded-xl border border-border bg-card p-5", className)}>
      <div className="space-y-3">
        <div className={cn("h-5 w-3/4 rounded-md bg-muted", shimmer)} />
        <div className={cn("h-4 w-full rounded-md bg-muted", shimmer)} />
        <div className={cn("h-4 w-2/3 rounded-md bg-muted", shimmer)} />
      </div>
    </div>
  )
}

export function SkeletonBentoGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
      <div className="md:col-span-2 md:row-span-2">
        <SkeletonCard variant="chart" className="h-full" />
      </div>
      <SkeletonCard variant="kpi" />
      <SkeletonCard variant="kpi" />
      <SkeletonCard />
      <SkeletonCard />
      <div className="md:col-span-2">
        <SkeletonCard variant="chart" />
      </div>
      <SkeletonCard />
      <SkeletonCard />
    </div>
  )
}

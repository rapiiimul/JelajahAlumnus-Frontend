"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

import { useAuth } from "@/components/auth-provider"
import { AppShell } from "@/components/layout/app-shell"
import { Skeleton } from "@/components/ui/skeleton"

function FullPageLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <div className="flex w-full max-w-sm flex-col gap-3 p-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="mt-4 h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    </div>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAuthenticated, isHydrating } = useAuth()

  useEffect(() => {
    if (!isHydrating && !isAuthenticated) {
      router.replace("/login")
    }
  }, [isHydrating, isAuthenticated, router])

  if (isHydrating || !isAuthenticated) {
    return <FullPageLoading />
  }

  return <AppShell>{children}</AppShell>
}

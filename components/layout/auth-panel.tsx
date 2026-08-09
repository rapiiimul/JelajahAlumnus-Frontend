"use client"

import Link from "next/link"
import { GraduationCap } from "lucide-react"

import { Badge } from "@/components/ui/badge"

interface AuthPanelProps {
  badge?: string
  heading: string
  description?: string
  children: React.ReactNode
}

export function AuthPanel({ badge = "Portal Alumni", heading, description, children }: AuthPanelProps) {
  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:flex">
        <Link href="/" className="flex w-fit items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary-foreground/15">
            <GraduationCap className="size-6" aria-hidden />
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-bold">Lacak.app</span>
            <span className="block text-sm text-primary-foreground/70">Alumni · Capaian · Karier</span>
          </span>
        </Link>

        <div className="max-w-xl">
          <Badge className="bg-primary-foreground/15 text-primary-foreground">{badge}</Badge>
          <h1 className="mt-6 text-balance text-4xl font-bold leading-tight xl:text-5xl">{heading}</h1>
          {description && (
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-primary-foreground/75">{description}</p>
          )}
        </div>

        <p className="text-sm text-primary-foreground/60">© 2026 Lacak.app · Bursa Kerja Khusus</p>
      </section>

      <section className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="size-5" aria-hidden />
            </span>
            <span className="leading-tight">
              <span className="block font-bold">Lacak.app</span>
              <span className="block text-xs text-muted-foreground">Alumni · Capaian · Karier</span>
            </span>
          </div>
          {children}
        </div>
      </section>
    </main>
  )
}

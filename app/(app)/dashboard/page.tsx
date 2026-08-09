"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import {
  BriefcaseBusiness,
  CalendarDays,
  ChevronRight,
  CircleUserRound,
  ClipboardCheck,
  FileText,
  Sparkles,
} from "lucide-react"

import { useAuth } from "@/components/auth-provider"
import { ApplicationStatusBadge, TracerStatusBadge } from "@/components/shared/badges"
import { EmptyState, ErrorState, LoadingRows } from "@/components/shared/states"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchEvents } from "@/lib/api/events"
import { fetchApplications, fetchJobs } from "@/lib/api/jobs"
import { fetchProfile } from "@/lib/api/profile"
import { fetchSubmission } from "@/lib/api/tracer"
import { TRACER_STATUS_LABELS } from "@/lib/labels"
import type { AppEvent, Job, JobApplication, Profile, TracerSubmission } from "@/lib/types"
import { formatDate } from "@/lib/utils"

interface DashboardData {
  jobs: Job[]
  jobsTotal: number
  applications: JobApplication[]
  applicationsTotal: number
  events: AppEvent[]
  eventsTotal: number
  profile: Profile | null
  submission: TracerSubmission | null
}

function profileCompletion(profile: Profile | null): number {
  if (!profile) return 0
  const parts = [
    Boolean(profile.phone_number),
    Boolean(profile.major),
    Boolean(profile.graduation_year),
    Boolean(profile.about_me),
    profile.skills.length > 0,
    Boolean(profile.avatar_url),
  ]
  const done = parts.filter(Boolean).length
  return Math.round((done / parts.length) * 100)
}

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  href,
}: {
  label: string
  value: string
  detail: string
  icon: typeof BriefcaseBusiness
  href: string
}) {
  return (
    <Link href={href} className="group">
      <Card className="transition-colors hover:bg-muted/50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardDescription>{label}</CardDescription>
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4" aria-hidden />
          </span>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{value}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            {detail}
            <ChevronRight className="size-3 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState("")
  const [reloadKey, setReloadKey] = useState(0)

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const [jobsResult, applicationsResult, eventsResult, profile, submission] = await Promise.all([
        fetchJobs({ page: 1, signal }),
        fetchApplications(1),
        fetchEvents({ page: 1, signal }),
        fetchProfile(),
        fetchSubmission(),
      ])
      if (signal?.aborted) return
      setData({
        jobs: jobsResult.items,
        jobsTotal: jobsResult.meta.total,
        applications: applicationsResult.items,
        applicationsTotal: applicationsResult.meta.total,
        events: eventsResult.items,
        eventsTotal: eventsResult.meta.total,
        profile,
        submission,
      })
      setError("")
    } catch (caught) {
      if (signal?.aborted) return
      setError(caught instanceof Error ? caught.message : "Gagal memuat data dashboard.")
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void load(controller.signal)
    return () => controller.abort()
  }, [load, reloadKey])

  if (error) {
    return (
      <Card>
        <ErrorState message={error} onRetry={() => setReloadKey((key) => key + 1)} />
      </Card>
    )
  }

  if (!data) {
    return <LoadingRows count={5} />
  }

  const completion = profileCompletion(data.profile)
  const firstName = user?.name?.split(/\s+/)[0] ?? "Alumni"
  const upcomingEvents = data.events.filter((event) => !event.is_registered).slice(0, 3)
  const recentApplications = data.applications.slice(0, 4)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold md:text-2xl">Halo, {firstName} 👋</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Mari lanjutkan langkah kariermu bersama Lacak.app.
        </p>
      </div>

      {(completion < 100 || !data.submission) && (
        <Card className="border-primary/20 bg-primary text-primary-foreground">
          <CardContent className="flex flex-col justify-between gap-5 p-6 md:flex-row md:items-center">
            <div>
              <Badge className="bg-primary-foreground/15 text-primary-foreground">
                {!data.submission ? "Tracer study belum diisi" : `Profil ${completion}% lengkap`}
              </Badge>
              <h3 className="mt-3 text-lg font-bold md:text-xl">
                {!data.submission
                  ? "Bagikan capaianmu setelah lulus."
                  : "Lengkapi datamu agar peluang lebih relevan."}
              </h3>
              <p className="mt-1 text-sm text-primary-foreground/75">
                {!data.submission
                  ? "Datamu membantu sekolah menyiapkan lulusan yang lebih baik."
                  : "Profil lengkap meningkatkan visibilitasmu ke mitra industri."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {!data.submission && (
                <Button variant="secondary" render={<Link href="/tracer-study" />}>
                  Isi Tracer Study <ChevronRight data-icon="inline-end" />
                </Button>
              )}
              {completion < 100 && (
                <Button variant={data.submission ? "default" : "secondary"} render={<Link href="/profil" />}>
                  Lengkapi Profil <ChevronRight data-icon="inline-end" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Lowongan aktif"
          value={String(data.jobsTotal)}
          detail="Peluang dari mitra industri"
          icon={BriefcaseBusiness}
          href="/lowongan"
        />
        <StatCard
          label="Lamaran terkirim"
          value={String(data.applicationsTotal)}
          detail="Pantau perkembangan lamaran"
          icon={FileText}
          href="/lamaran"
        />
        <StatCard
          label="Kegiatan tersedia"
          value={String(data.eventsTotal)}
          detail="Event & pelatihan untukmu"
          icon={CalendarDays}
          href="/kegiatan"
        />
        <StatCard
          label="Status tracer"
          value={data.submission ? TRACER_STATUS_LABELS[data.submission.status] : "Belum diisi"}
          detail={data.submission ? "Terakhir diperbarui" : "Mulai isi sekarang"}
          icon={ClipboardCheck}
          href="/tracer-study"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Lamaran terbaru</CardTitle>
              <CardDescription>Perkembangan proses rekrutmenmu</CardDescription>
            </div>
            <Button variant="ghost" size="sm" render={<Link href="/lamaran" />}>
              Lihat semua
            </Button>
          </CardHeader>
          <CardContent>
            {recentApplications.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {recentApplications.map((application) => (
                  <li key={application.id}>
                    <Link
                      href="/lamaran"
                      className="flex items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-muted"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <BriefcaseBusiness className="size-4" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">
                          {application.job_vacancy.title}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {application.job_vacancy.company_name} · Dilamar {formatDate(application.applied_at)}
                        </span>
                      </span>
                      <ApplicationStatusBadge status={application.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={FileText}
                title="Belum ada lamaran"
                description="Jelajahi lowongan yang tersedia dan kirim lamaran pertamamu."
                action={
                  <Button render={<Link href="/lowongan" />}>
                    Cari Lowongan <ChevronRight data-icon="inline-end" />
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kegiatan mendatang</CardTitle>
            <CardDescription>Acara yang belum kamu daftar</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {upcomingEvents.map((event) => (
                  <li key={event.id}>
                    <Link
                      href="/kegiatan"
                      className="flex items-start gap-3 rounded-xl border p-3 transition-colors hover:bg-muted"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <CalendarDays className="size-4" aria-hidden />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">{event.title}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {formatDate(event.start_date)} ·{" "}
                          {event.location_type === "online" ? "Online" : event.location_details ?? "Offline"}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={Sparkles}
                title="Semua sudah didaftar"
                description="Kamu telah mendaftar di semua kegiatan yang tersedia."
              />
            )}
          </CardContent>
        </Card>
      </div>

      {data.submission && (
        <Card className="bg-secondary/40">
          <CardContent className="flex flex-col justify-between gap-4 p-6 md:flex-row md:items-center">
            <div className="flex items-center gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CircleUserRound className="size-5" aria-hidden />
              </span>
              <div>
                <p className="font-semibold">Capaian terakhir: {TRACER_STATUS_LABELS[data.submission.status]}</p>
                <p className="text-sm text-muted-foreground">
                  Diperbarui {formatDate(data.submission.submitted_at)}
                </p>
              </div>
              <TracerStatusBadge status={data.submission.status} />
            </div>
            <Button variant="outline" render={<Link href="/tracer-study" />}>
              Perbarui data capaian
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

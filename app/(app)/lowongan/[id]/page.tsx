"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { ArrowLeft, BriefcaseBusiness, CalendarDays, Clock3, UserRound } from "lucide-react"

import { ApplyJobDialog } from "@/components/shared/apply-job-dialog"
import { ErrorState } from "@/components/shared/states"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ApiError } from "@/lib/api/client"
import { fetchJob } from "@/lib/api/jobs"
import type { Job } from "@/lib/types"
import { formatDate } from "@/lib/utils"

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-8 w-40" />
      <div className="grid gap-6 xl:grid-cols-[1.6fr_0.8fr]">
        <div className="flex flex-col gap-6">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  )
}

export default function LowonganDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const jobId = params.id

  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [reloadKey, setReloadKey] = useState(0)
  const [applyOpen, setApplyOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      setJob(await fetchJob(jobId))
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Gagal memuat detail lowongan.")
    } finally {
      setLoading(false)
    }
  }, [jobId])

  useEffect(() => {
    void load()
  }, [load, reloadKey])

  if (loading) return <DetailSkeleton />

  if (error || !job) {
    return (
      <div className="flex flex-col gap-6">
        <Button variant="ghost" className="w-fit" onClick={() => router.back()}>
          <ArrowLeft data-icon="inline-start" />
          Kembali
        </Button>
        <Card>
          <ErrorState message={error || "Lowongan tidak ditemukan."} onRetry={() => setReloadKey((key) => key + 1)} />
        </Card>
      </div>
    )
  }

  const requirements = job.requirements ? job.requirements.split(/\n+/).map((line) => line.trim()).filter(Boolean) : []

  return (
    <div className="flex flex-col gap-6">
      <Button variant="ghost" className="w-fit" render={<Link href="/lowongan" />}>
        <ArrowLeft data-icon="inline-start" />
        Kembali ke lowongan
      </Button>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_0.8fr]">
        <div className="flex flex-col gap-6">
          {job.images?.[0] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={job.images[0]} alt="" className="h-56 w-full rounded-xl object-cover" loading="lazy" />
          )}

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4">
                  <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <BriefcaseBusiness className="size-6" aria-hidden />
                  </span>
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={job.is_applied ? "secondary" : "default"}>
                        {job.is_applied ? "Sudah dilamar" : "Masih dibuka"}
                      </Badge>
                    </div>
                    <CardTitle className="mt-3 text-2xl">{job.title}</CardTitle>
                    <CardDescription className="mt-1 font-medium">{job.company_name}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 border-t pt-5 text-sm sm:grid-cols-2 lg:grid-cols-3">
              <span className="inline-flex items-center gap-2 text-muted-foreground">
                <UserRound className="size-4 text-primary" aria-hidden />
                {job.posted_by ?? "BKK"}
              </span>
              <span className="inline-flex items-center gap-2 text-muted-foreground">
                <Clock3 className="size-4 text-primary" aria-hidden />
                Diposting {formatDate(job.posted_at)}
              </span>
              {job.expires_at && (
                <span className="inline-flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="size-4 text-primary" aria-hidden />
                  Batas lamaran {formatDate(job.expires_at)}
                </span>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Deskripsi pekerjaan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">{job.description}</p>
            </CardContent>
          </Card>

          {requirements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Persyaratan</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-muted-foreground">
                  {requirements.map((requirement) => (
                    <li key={requirement}>{requirement}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <Card className="h-fit lg:sticky lg:top-24">
            <CardHeader>
              <CardTitle>Tertarik dengan posisi ini?</CardTitle>
              <CardDescription>
                {job.is_applied
                  ? "Kamu sudah mengirim lamaran untuk lowongan ini."
                  : "Siapkan CV terbarumu dan kirim lamaran sekarang."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                size="lg"
                disabled={job.is_applied}
                onClick={() => setApplyOpen(true)}
              >
                {job.is_applied ? "Sudah Dilamar" : "Lamar Pekerjaan"}
              </Button>
              {job.expires_at && (
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Pendaftaran ditutup {formatDate(job.expires_at)}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ApplyJobDialog
        job={applyOpen ? job : null}
        onOpenChange={setApplyOpen}
        onSuccess={(updatedJob) => setJob({ ...updatedJob, is_applied: true })}
      />
    </div>
  )
}

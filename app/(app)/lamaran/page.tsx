"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { BriefcaseBusiness, FileDown, FileText, Send } from "lucide-react"

import { ApplicationStatusBadge } from "@/components/shared/badges"
import { EmptyState, ErrorState, LoadingRows } from "@/components/shared/states"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Pagination } from "@/components/ui/pagination"
import { ApiError } from "@/lib/api/client"
import { fetchApplications } from "@/lib/api/jobs"
import type { JobApplication } from "@/lib/types"
import { cn, formatDate, formatDateTime } from "@/lib/utils"

export default function LamaranPage() {
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [perPage, setPerPage] = useState(10)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [reloadKey, setReloadKey] = useState(0)
  const [selected, setSelected] = useState<JobApplication | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const result = await fetchApplications(page)
      setApplications(result.items)
      setTotal(result.meta.total)
      setLastPage(result.meta.last_page)
      setPerPage(result.meta.per_page)
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Gagal memuat riwayat lamaran.")
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    void load()
  }, [load, reloadKey])

  useEffect(() => {
    if (selected && !applications.some((item) => item.id === selected.id)) {
      setSelected(null)
    }
  }, [applications, selected])

  return (
    <div className="flex flex-col gap-6">
      {loading ? (
        <LoadingRows count={5} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => setReloadKey((key) => key + 1)} />
      ) : applications.length === 0 ? (
        <Card>
          <EmptyState
            icon={Send}
            title="Belum ada lamaran"
            description="Kamu belum mengirim lamaran apa pun. Jelajahi lowongan yang tersedia sekarang."
            action={
              <Button render={<Link href="/lowongan" />}>
                Cari Lowongan <BriefcaseBusiness data-icon="inline-end" />
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Menampilkan {applications.length} dari {total} lamaran
          </p>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.9fr]">
            <Card>
              <CardHeader>
                <CardTitle>Riwayat lamaran</CardTitle>
                <CardDescription>{total} lamaran terkirim</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-col gap-3">
                  {applications.map((application) => (
                    <li key={application.id}>
                      <button
                        type="button"
                        onClick={() => setSelected(application)}
                        aria-pressed={selected?.id === application.id}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors hover:bg-muted",
                          selected?.id === application.id && "border-primary bg-primary/5"
                        )}
                      >
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <BriefcaseBusiness className="size-5" aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-semibold">{application.job_vacancy.title}</span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {application.job_vacancy.company_name} · Dilamar {formatDate(application.applied_at)}
                          </span>
                        </span>
                        <ApplicationStatusBadge status={application.status} />
                      </button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="h-fit lg:sticky lg:top-24">
              <CardHeader>
                <CardTitle>Detail lamaran</CardTitle>
                <CardDescription>
                  {selected
                    ? `Lamaran #${selected.id} untuk ${selected.job_vacancy.title}`
                    : "Pilih lamaran untuk melihat detailnya"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selected ? (
                  <div className="flex flex-col gap-4">
                    <div>
                      <h3 className="font-bold">{selected.job_vacancy.title}</h3>
                      <p className="text-sm text-muted-foreground">{selected.job_vacancy.company_name}</p>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2.5">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <ApplicationStatusBadge status={selected.status} />
                    </div>
                    <div className="rounded-lg bg-muted px-3 py-2.5 text-sm">
                      <p className="text-muted-foreground">Dikirim pada</p>
                      <p className="font-medium">{formatDateTime(selected.applied_at)}</p>
                    </div>
                    {selected.cover_letter && (
                      <div className="rounded-lg border p-3">
                        <p className="mb-1 text-xs font-medium text-muted-foreground">Cover letter</p>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{selected.cover_letter}</p>
                      </div>
                    )}
                    <Button
                      variant="outline"
                      className="w-full"
                      render={
                        <a href={selected.cv_url} target="_blank" rel="noopener noreferrer" />
                      }
                    >
                      <FileDown data-icon="inline-start" />
                      Lihat CV yang dikirim
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-10 text-center">
                    <FileText className="size-8 text-muted-foreground" aria-hidden />
                    <p className="mt-3 text-sm text-muted-foreground">Belum ada lamaran dipilih.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Pagination
            meta={{ current_page: page, last_page: lastPage, per_page: perPage, total }}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  )
}

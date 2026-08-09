"use client"

import { useCallback, useEffect, useState } from "react"
import { BriefcaseBusiness, Search, X } from "lucide-react"

import { ApplyJobDialog } from "@/components/shared/apply-job-dialog"
import { JobCard } from "@/components/shared/job-card"
import { EmptyState, ErrorState, LoadingGrid } from "@/components/shared/states"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/ui/pagination"
import { ApiError } from "@/lib/api/client"
import { fetchJobs } from "@/lib/api/jobs"
import type { Job } from "@/lib/types"

export default function LowonganPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [reloadKey, setReloadKey] = useState(0)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
    }, 400)
    return () => window.clearTimeout(timer)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true)
    setError("")
    try {
      const result = await fetchJobs({ page, search: debouncedSearch || undefined, signal })
      setJobs(result.items)
      setTotal(result.meta.total)
      setLastPage(result.meta.last_page)
      setPerPage(result.meta.per_page)
    } catch (caught) {
      if (signal?.aborted) return
      setError(caught instanceof ApiError ? caught.message : "Gagal memuat lowongan.")
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [page, debouncedSearch])

  useEffect(() => {
    const controller = new AbortController()
    void load(controller.signal)
    return () => controller.abort()
  }, [load, reloadKey])

  const handleApplySuccess = (job: Job) => {
    setJobs((prev) => prev.map((item) => (item.id === job.id ? { ...item, is_applied: true } : item)))
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="relative">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          className="pl-9 pr-9"
          placeholder="Cari lowongan berdasarkan judul atau perusahaan..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Cari lowongan"
        />
        {search && (
          <button
            type="button"
            className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
            onClick={() => setSearch("")}
            aria-label="Bersihkan pencarian"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {loading ? (
        <LoadingGrid count={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => setReloadKey((key) => key + 1)} />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={BriefcaseBusiness}
          title={debouncedSearch ? "Lowongan tidak ditemukan" : "Belum ada lowongan"}
          description={
            debouncedSearch
              ? "Tidak ada lowongan yang cocok dengan pencarianmu. Coba kata kunci lain."
              : "Belum ada lowongan yang dipublikasikan. Silakan cek lagi nanti."
          }
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Menampilkan {jobs.length} dari {total} lowongan
            {debouncedSearch && (
              <>
                {" "}
                untuk kata kunci <span className="font-medium text-foreground">“{debouncedSearch}”</span>
              </>
            )}
          </p>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} onApply={setSelectedJob} />
            ))}
          </div>
          <Pagination
            meta={{ current_page: page, last_page: lastPage, per_page: perPage, total }}
            onPageChange={setPage}
          />
        </>
      )}

      <ApplyJobDialog
        job={selectedJob}
        onOpenChange={(open) => {
          if (!open) setSelectedJob(null)
        }}
        onSuccess={handleApplySuccess}
      />
    </div>
  )
}

import { getData, toPaginated } from "@/lib/api/client"
import type { Job, JobApplication, Paginated } from "@/lib/types"

const BASE = "/api/v1/jobs"

export interface FetchJobsParams {
  page?: number
  search?: string
  signal?: AbortSignal
}

export async function fetchJobs(params: FetchJobsParams = {}): Promise<Paginated<Job>> {
  const query = new URLSearchParams()
  if (params.page) query.set("page", String(params.page))
  if (params.search) query.set("search", params.search)
  const suffix = query.size > 0 ? `?${query.toString()}` : ""

  const response = await getData<Job[] | { data: Job[]; meta?: unknown }>(`${BASE}${suffix}`, { signal: params.signal })
  const paginated = toPaginated<Job>(response, (response as { meta?: Record<string, number> }).meta)
  return paginated
}

export function fetchJob(id: number | string): Promise<Job> {
  return getData<Job>(`${BASE}/${id}`)
}

export interface ApplyJobInput {
  cv: File
  cover_letter?: string
}

export function applyJob(id: number | string, input: ApplyJobInput): Promise<{ id: number; status: string }> {
  const formData = new FormData()
  formData.append("cv", input.cv)
  if (input.cover_letter) formData.append("cover_letter", input.cover_letter)
  return getData<{ id: number; status: string }>(`${BASE}/${id}/apply`, { method: "POST", formData })
}

export async function fetchApplications(page = 1): Promise<Paginated<JobApplication>> {
  const response = await getData<JobApplication[] | { data: JobApplication[]; meta?: unknown }>(
    `${BASE}/applications?page=${page}`
  )
  return toPaginated<JobApplication>(response, (response as { meta?: Record<string, number> }).meta)
}

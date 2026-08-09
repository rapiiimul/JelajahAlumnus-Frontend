import { ApiError, getData } from "@/lib/api/client"
import type { TracerStatus, TracerSubmission } from "@/lib/types"

const BASE = "/api/v1/tracer"

/**
 * Mengambil submission tracer study milik user yang sedang login.
 * Mengembalikan `null` ketika belum pernah mengisi (404).
 */
export async function fetchSubmission(): Promise<TracerSubmission | null> {
  try {
    return await getData<TracerSubmission>(`${BASE}/submissions`)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null
    throw error
  }
}

export type TracerSubmissionInput =
  | {
      status: "bekerja"
      location_scale: string
      location_country: string
      field_of_work: string
      salary_range: string
      company_name: string
      position: string
      start_date: string
      is_linear: boolean
    }
  | {
      status: "kuliah"
      university_name: string
      enrollment_date: string
      is_linear: boolean
    }
  | {
      status: "wirausaha"
      ownership_type: string
      employee_count: number
      monthly_omset_range: string
      business_type: string
    }

export function submitSubmission(input: TracerSubmissionInput): Promise<TracerSubmission> {
  return getData<TracerSubmission>(`${BASE}/submissions`, { method: "POST", body: input })
}

type TracerDetail =
  | TracerSubmission["detail_kerja"]
  | TracerSubmission["detail_kuliah"]
  | TracerSubmission["detail_wirausaha"]

/** Detail submission untuk status tertentu (mendukung variasi penamaan key dari resource). */
export function submissionDetail(submission: TracerSubmission): TracerDetail {
  const record = submission as unknown as Record<string, unknown>
  switch (submission.status) {
    case "bekerja":
      return (record.detail_kerja ?? record.detail_bekerja) as TracerDetail
    case "kuliah":
      return record.detail_kuliah as TracerDetail
    case "wirausaha":
      return record.detail_wirausaha as TracerDetail
    default:
      return undefined
  }
}

export function submissionDetailKey(status: TracerStatus): string {
  switch (status) {
    case "bekerja":
      return "detail_kerja"
    case "kuliah":
      return "detail_kuliah"
    case "wirausaha":
      return "detail_wirausaha"
  }
}

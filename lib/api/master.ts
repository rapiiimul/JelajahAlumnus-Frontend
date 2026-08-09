import { getData } from "@/lib/api/client"
import type { Major, School, TracerOptions } from "@/lib/types"

const BASE = "/api/v1/master"

export function fetchSchools(): Promise<School[]> {
  return getData<School[]>(`${BASE}/schools`)
}

/** Daftar jurusan terfilter oleh sekolah user yang sedang login (membutuhkan token). */
export function fetchMajors(): Promise<Major[]> {
  return getData<Major[]>(`${BASE}/majors`)
}

export function fetchTracerOptions(): Promise<TracerOptions> {
  return getData<TracerOptions>(`${BASE}/tracer-options`)
}

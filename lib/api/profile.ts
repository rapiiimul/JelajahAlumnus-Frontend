import { ApiError, getData } from "@/lib/api/client"
import type { Experience, Profile } from "@/lib/types"

const BASE = "/api/v1/profile"

/**
 * Mengambil profil alumni yang sedang login.
 * Mengembalikan `null` ketika profil belum pernah dibuat (404).
 */
export async function fetchProfile(): Promise<Profile | null> {
  try {
    return await getData<Profile>(BASE)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null
    throw error
  }
}

export interface UpdateProfileInput {
  major_id?: number | null
  graduation_year?: number | null
  phone_number?: string
  about_me?: string
  skills?: string[]
  linkedin_url?: string
  portfolio_url?: string
  avatar?: File | null
  resume?: File | null
}

export function updateProfile(input: UpdateProfileInput): Promise<Profile> {
  const formData = new FormData()

  if (input.major_id != null) formData.append("major_id", String(input.major_id))
  if (input.graduation_year != null) formData.append("graduation_year", String(input.graduation_year))
  if (input.phone_number != null) formData.append("phone_number", input.phone_number)
  if (input.about_me != null) formData.append("about_me", input.about_me)
  if (input.linkedin_url != null) formData.append("linkedin_url", input.linkedin_url)
  if (input.portfolio_url != null) formData.append("portfolio_url", input.portfolio_url)

  for (const skill of input.skills ?? []) {
    const trimmed = skill.trim()
    if (trimmed) formData.append("skills[]", trimmed)
  }

  if (input.avatar) formData.append("avatar", input.avatar)
  if (input.resume) formData.append("resume", input.resume)

  return getData<Profile>(BASE, { method: "POST", formData })
}

export interface ExperienceInput {
  company_name: string
  position: string
  description?: string
  start_date: string
  end_date?: string | null
  is_current: boolean
}

export function createExperience(input: ExperienceInput): Promise<Experience> {
  return getData<Experience>(`${BASE}/experiences`, { method: "POST", body: normalizeExperience(input) })
}

export function updateExperience(id: number, input: ExperienceInput): Promise<Experience> {
  return getData<Experience>(`${BASE}/experiences/${id}`, { method: "PUT", body: normalizeExperience(input) })
}

export function deleteExperience(id: number): Promise<null> {
  return getData<null>(`${BASE}/experiences/${id}`, { method: "DELETE" })
}

function normalizeExperience(input: ExperienceInput): Record<string, unknown> {
  const body: Record<string, unknown> = {
    company_name: input.company_name,
    position: input.position,
    is_current: input.is_current,
  }
  if (input.description != null) body.description = input.description
  if (input.start_date) body.start_date = input.start_date
  if (input.is_current) {
    body.end_date = null
  } else if (input.end_date) {
    body.end_date = input.end_date
  }
  return body
}

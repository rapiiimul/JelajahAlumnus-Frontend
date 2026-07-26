const TOKEN_STORAGE_KEY = "jejak-lulusan-api-token"

export type ApiHealthResponse = {
  success?: boolean
  message?: string
  data?: Record<string, unknown>
}

export type BackendLoginResponse = {
  ok: boolean
  token: string | null
  payload?: unknown
  message?: string
}

export type BackendActionResponse = {
  ok: boolean
  message: string
  payload?: unknown
}

export type BackendProfile = {
  name?: string
  email?: string
  nisn?: string
  phone_number?: string
  major_id?: number
  graduation_year?: number
  about_me?: string
  skills?: string[]
  linkedin_url?: string
  portfolio_url?: string
  [key: string]: unknown
}

export type BackendEvent = {
  id: string
  title: string
  description: string
  date: string
  location: string
  category: string
  registered: boolean
}

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function saveApiToken(token: string | null) {
  if (typeof window === "undefined") return
  if (token) {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token)
  } else {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY)
  }
}

export function getApiToken() {
  return getStoredToken()
}

async function requestJson<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set("Accept", "application/json")

  if (!headers.has("Content-Type") && init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json")
  }

  const token = getStoredToken()
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const response = await fetch(path, {
    ...init,
    headers,
  })

  const rawText = await response.text()
  let payload: unknown = null

  if (rawText) {
    try {
      payload = JSON.parse(rawText)
    } catch {
      payload = rawText
    }
  }

  if (!response.ok) {
    const message = typeof payload === "object" && payload && "message" in payload ? String((payload as { message?: unknown }).message ?? "") : ""
    throw new Error(message || `Request failed with status ${response.status}`)
  }

  return payload as T
}

function unwrapPayload(payload: unknown): unknown {
  if (Array.isArray(payload)) return payload
  if (!payload || typeof payload !== "object") return payload

  const record = payload as Record<string, unknown>
  if (record.data !== undefined) return unwrapPayload(record.data)
  if (record.items !== undefined) return unwrapPayload(record.items)
  if (record.result !== undefined) return unwrapPayload(record.result)
  if (record.jobs !== undefined) return unwrapPayload(record.jobs)
  if (record.applications !== undefined) return unwrapPayload(record.applications)
  if (record.data_list !== undefined) return unwrapPayload(record.data_list)
  if (record.records !== undefined) return unwrapPayload(record.records)

  return payload
}

function toJob(item: any, index: number) {
  const id = String(item?.id ?? item?.job_id ?? item?.slug ?? item?.uuid ?? `job-${index + 1}`)
  const title = String(item?.title ?? item?.job_title ?? item?.name ?? "Lowongan kerja")
  const company = String(item?.company_name ?? item?.company ?? item?.employer ?? "Perusahaan")
  const location = String(item?.location ?? item?.city ?? item?.work_location ?? "Remote")
  const type = String(item?.employment_type ?? item?.type ?? "Full-time")
  const salary = String(item?.salary_range ?? item?.salary ?? item?.compensation ?? "Menyesuaikan")
  const deadline = String(item?.deadline ?? item?.application_deadline ?? item?.closing_date ?? "Segera")
  const match = typeof item?.match === "number" ? item.match : 80
  const statusRaw = String(item?.status ?? "Terbit")
  const status: "Terbit" | "Draft" | "Ditutup" = statusRaw === "Draft" || statusRaw === "Ditutup" ? statusRaw : "Terbit"
  const description = String(item?.description ?? item?.summary ?? item?.about ?? "Deskripsi belum tersedia.")
  const responsibilities = Array.isArray(item?.responsibilities) ? item.responsibilities.map(String) : [description]
  const requirements = Array.isArray(item?.requirements) ? item.requirements.map(String) : []
  const skills = Array.isArray(item?.skills) ? item.skills.map(String) : []
  const benefits = Array.isArray(item?.benefits) ? item.benefits.map(String) : []
  const applicants = Number(item?.applicants_count ?? item?.applicants ?? 0)

  return {
    id,
    title,
    company,
    location,
    type,
    salary,
    deadline,
    match,
    status,
    description,
    responsibilities,
    requirements,
    skills,
    benefits,
    applicants,
  }
}

function toApplication(item: any, index: number) {
  const id = String(item?.id ?? item?.application_id ?? `application-${index + 1}`)
  const jobId = String(item?.job_id ?? item?.job?.id ?? item?.vacancy_id ?? item?.jobId ?? "")
  const jobTitle = String(item?.job_title ?? item?.job?.title ?? item?.position ?? "Lowongan")
  const company = String(item?.company_name ?? item?.company ?? item?.job?.company ?? "Perusahaan")
  const date = String(item?.applied_at ?? item?.created_at ?? item?.date ?? "Hari ini")
  const statusRaw = String(item?.status ?? item?.application_status ?? "Dikirim")
  const note = String(item?.note ?? item?.cover_letter ?? item?.message ?? "Status aplikasi sedang diperbarui.")

  const status: "Dikirim" | "Ditinjau" | "Wawancara" | "Diterima" | "Ditolak" =
    statusRaw === "Ditinjau" || statusRaw === "Wawancara" || statusRaw === "Diterima" || statusRaw === "Ditolak"
      ? (statusRaw as "Dikirim" | "Ditinjau" | "Wawancara" | "Diterima" | "Ditolak")
      : "Dikirim"

  return {
    id,
    jobId,
    jobTitle,
    company,
    date,
    status,
    note,
  }
}

function toEvent(item: any): BackendEvent {
  return {
    id: String(item?.id ?? item?.event_id ?? item?.slug ?? ""),
    title: String(item?.title ?? item?.name ?? item?.event_name ?? "Acara"),
    description: String(item?.description ?? item?.summary ?? item?.about ?? "Deskripsi belum tersedia."),
    date: String(item?.date ?? item?.schedule_date ?? item?.start_date ?? "Segera"),
    location: String(item?.location ?? item?.venue ?? item?.city ?? "Online"),
    category: String(item?.category ?? item?.type ?? "Acara"),
    registered: Boolean(item?.registered ?? item?.is_registered ?? item?.joined ?? false),
  }
}

function getErrorMessage(payload: unknown): string {
  if (typeof payload === "string") return payload
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>
    if (typeof record.message === "string") return record.message
    if (typeof record.error === "string") return record.error
    if (typeof record.detail === "string") return record.detail
  }
  return "Permintaan gagal."
}

export async function getApiHealth(): Promise<ApiHealthResponse> {
  return requestJson<ApiHealthResponse>("/api/health")
}

export async function loginToBackend(identifier: string, password: string): Promise<BackendLoginResponse> {
  try {
    const payload = await requestJson<unknown>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier, password }),
    })

    const record = payload as Record<string, unknown>
    const token = typeof record?.data === "object" && record.data && "token" in (record.data as Record<string, unknown>)
      ? String((record.data as Record<string, unknown>).token ?? "")
      : typeof record?.token === "string"
        ? record.token
        : null

    if (token) {
      saveApiToken(token)
    }

    return { ok: true, token: token || null, payload, message: typeof record?.message === "string" ? record.message : "Login berhasil." }
  } catch (error) {
    return { ok: false, token: null, message: getErrorMessage(error instanceof Error ? error.message : error) }
  }
}

export async function registerToBackend(input: { name:string; email:string; nisn:string; password:string; password_confirmation:string; role?:string }): Promise<BackendActionResponse> {
  try {
    const payload = await requestJson<unknown>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: input.name,
        email: input.email,
        nisn: input.nisn,
        password: input.password,
        password_confirmation: input.password_confirmation,
      }),
    })
    return { ok: true, message: "Pendaftaran berhasil. Silakan verifikasi OTP Anda.", payload }
  } catch (error) {
    return { ok: false, message: getErrorMessage(error instanceof Error ? error.message : error) }
  }
}

export async function verifyEmailToBackend(email: string, otp: string): Promise<BackendActionResponse> {
  try {
    await requestJson<unknown>("/api/v1/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    })
    return { ok: true, message: "Email berhasil diverifikasi." }
  } catch (error) {
    return { ok: false, message: getErrorMessage(error instanceof Error ? error.message : error) }
  }
}

export async function resendOtpToBackend(email: string, context: "verify" | "reset" = "verify"): Promise<BackendActionResponse> {
  try {
    await requestJson<unknown>("/api/v1/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify({ email, context }),
    })
    return { ok: true, message: "OTP baru berhasil dikirim." }
  } catch (error) {
    return { ok: false, message: getErrorMessage(error instanceof Error ? error.message : error) }
  }
}

export async function fetchProfileFromBackend(): Promise<BackendProfile | null> {
  try {
    const payload = await requestJson<unknown>("/api/v1/profile")
    const data = unwrapPayload(payload)
    if (!data || typeof data !== "object") return null
    return data as BackendProfile
  } catch {
    return null
  }
}

export async function updateProfileToBackend(input: Record<string, unknown>): Promise<BackendActionResponse> {
  try {
    await requestJson<unknown>("/api/v1/profile", {
      method: "POST",
      body: JSON.stringify(input),
    })
    return { ok: true, message: "Profil berhasil diperbarui." }
  } catch (error) {
    return { ok: false, message: getErrorMessage(error instanceof Error ? error.message : error) }
  }
}

export async function submitTracerStudyToBackend(payload: Record<string, unknown>): Promise<BackendActionResponse> {
  try {
    await requestJson<unknown>("/api/v1/tracer/submissions", {
      method: "POST",
      body: JSON.stringify(payload),
    })
    return { ok: true, message: "Tracer study berhasil dikirim." }
  } catch (error) {
    return { ok: false, message: getErrorMessage(error instanceof Error ? error.message : error) }
  }
}

export async function fetchEventsFromBackend(): Promise<BackendEvent[]> {
  try {
    const payload = await requestJson<unknown>("/api/v1/events")
    const data = unwrapPayload(payload)
    if (!Array.isArray(data)) return []
    return data.map((item) => toEvent(item))
  } catch {
    return []
  }
}

export async function registerEventToBackend(id: string): Promise<BackendActionResponse> {
  try {
    await requestJson<unknown>(`/api/v1/events/${id}/register`, {
      method: "POST",
      body: JSON.stringify({}),
    })
    return { ok: true, message: "Registrasi acara berhasil." }
  } catch (error) {
    return { ok: false, message: getErrorMessage(error instanceof Error ? error.message : error) }
  }
}

export async function fetchJobsFromBackend() {
  try {
    const payload = await requestJson<unknown>("/api/v1/jobs")
    const data = unwrapPayload(payload)
    if (!Array.isArray(data)) return []
    return data.map((item, index) => toJob(item, index))
  } catch {
    return []
  }
}

export async function fetchApplicationsFromBackend() {
  try {
    const payload = await requestJson<unknown>("/api/v1/jobs/applications")
    const data = unwrapPayload(payload)
    if (!Array.isArray(data)) return []
    return data.map((item, index) => toApplication(item, index))
  } catch {
    return []
  }
}

// ============================================================
// Tipe data berdasarkan kontrak API Lacak.app (SRS v9 + Swagger)
// https://202.155.18.120/api/documentation
// ============================================================

// ---------- Envelope respons API ----------

export interface ApiMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  meta?: ApiMeta
}

export interface ApiErrorBody {
  success?: boolean
  message?: string
  errors?: Record<string, string[]>
}

export interface Paginated<T> {
  items: T[]
  meta: ApiMeta
}

// ---------- Autentikasi ----------

export interface Role {
  id: number
  name: string
  guard_name: string
  pivot?: Record<string, unknown>
}

export interface AuthUser {
  id: number
  name: string
  email: string | null
  nisn: string | null
  email_verified_at: string | null
  avatar: string | null
  school_id: number | null
  created_at: string
  updated_at: string
  roles: Role[]
}

export interface LoginResult {
  user: AuthUser
  token: string
}

export interface RegisterResult {
  user: AuthUser
  email: string
  message: string
}

// ---------- Master Data ----------

export interface Option {
  value: string | boolean
  label: string
}

export interface School {
  id: number
  name: string
}

export interface Major {
  id: number
  code: string
  name: string
}

export type TracerStatus = "bekerja" | "kuliah" | "wirausaha"

export interface TracerOptions {
  statuses: Option[]
  forms: Partial<Record<TracerStatus, Record<string, Option[]>>>
}

// ---------- Profil Alumni ----------

export interface Experience {
  id: number
  company_name: string
  position: string
  description: string | null
  start_date: string
  end_date: string | null
  is_current: boolean
}

export interface Profile {
  id: number
  user: {
    name: string
    email: string | null
    nisn: string | null
  }
  major: Major | null
  graduation_year: number | null
  phone_number: string | null
  avatar_url: string | null
  about_me: string | null
  skills: string[]
  linkedin_url: string | null
  portfolio_url: string | null
  resume_url: string | null
  experiences: Experience[]
}

// ---------- Tracer Study ----------

export interface TracerWorkDetail {
  id: number
  tracer_submission_id: number
  location_scale: string
  location_country: string
  field_of_work: string
  salary_range: string
  company_name: string
  position: string
  start_date: string
  is_linear: boolean
  created_at: string
  updated_at: string
}

export interface TracerStudyDetail {
  id: number
  tracer_submission_id: number
  university_name: string
  enrollment_date: string
  is_linear: boolean
  created_at: string
  updated_at: string
}

export interface TracerEntrepreneurDetail {
  id: number
  tracer_submission_id: number
  ownership_type: string
  employee_count: number
  monthly_omset_range: string
  business_type: string
  created_at: string
  updated_at: string
}

export interface TracerSubmission {
  id: number
  status: TracerStatus
  submitted_at: string
  detail_kerja?: TracerWorkDetail | null
  detail_kuliah?: TracerStudyDetail | null
  detail_wirausaha?: TracerEntrepreneurDetail | null
}

// ---------- Bursa Kerja Khusus ----------

export interface Job {
  id: number
  title: string
  company_name: string
  images: string[]
  description: string
  requirements: string
  is_active: boolean
  expires_at: string | null
  posted_at: string | null
  posted_by: string | null
  is_applied: boolean
}

export type ApplicationStatus = "pending" | "reviewed" | "accepted" | "rejected"

export interface JobApplication {
  id: number
  job_vacancy: Job
  status: ApplicationStatus
  cv_url: string
  cover_letter: string | null
  applied_at: string
}

// ---------- Event & Pelatihan ----------

export type EventType = "webinar" | "bootcamp" | "training" | "job_fair" | "other"
export type LocationType = "online" | "offline" | "hybrid"
export type ParticipationStatus = "registered" | "attended" | "cancelled"

export interface AppEvent {
  id: number
  title: string
  slug: string
  description: string
  event_type: EventType
  location_type: LocationType
  location_details: string | null
  start_date: string
  end_date: string | null
  banner_url: string | null
  is_active: boolean
  posted_by: string | null
  is_registered: boolean
  created_at: string
}

export interface EventParticipation {
  id: number
  event: AppEvent
  status: ParticipationStatus
  registered_at: string
}

import type { ApiErrorBody, ApiMeta, ApiResponse, Paginated } from "@/lib/types"

export const TOKEN_STORAGE_KEY = "lacak-token"

const LOGIN_PATH = "/login"

export class ApiError extends Error {
  readonly status: number
  readonly errors?: Record<string, string[]>

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.errors = errors
  }
}

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function saveToken(token: string | null): void {
  if (typeof window === "undefined") return
  if (token) {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token)
  } else {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY)
  }
}

export function getToken(): string | null {
  return getStoredToken()
}

function isAuthRequest(path: string): boolean {
  return path.startsWith("/api/v1/auth/")
}

/**
 * Wrapper HTTP menuju API backend melalui proxy Next.js (/api/[...path]).
 * Menangani envelope `{ success, message, data, meta }` serta
 * error 401 (session kedaluwarsa), 422 (validasi), dan error lainnya.
 */
export async function request<T>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
    body?: unknown
    formData?: FormData
    signal?: AbortSignal
  } = {}
): Promise<ApiResponse<T>> {
  const { method = "GET", body, formData, signal } = options

  const headers = new Headers()
  headers.set("Accept", "application/json")

  const token = getStoredToken()
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  let requestBody: BodyInit | undefined
  if (formData) {
    requestBody = formData
  } else if (body !== undefined) {
    headers.set("Content-Type", "application/json")
    requestBody = JSON.stringify(body)
  }

  const response = await fetch(path, { method, headers, body: requestBody, signal })

  const rawText = await response.text()
  let payload: ApiErrorBody | ApiResponse<T> | null = null

  if (rawText) {
    try {
      payload = JSON.parse(rawText) as ApiErrorBody | ApiResponse<T>
    } catch {
      payload = null
    }
  }

  if (!response.ok) {
    const status = response.status
    const body = payload && typeof payload === "object" ? payload : null
    const message =
      (body && typeof body.message === "string" && body.message) ||
      `Permintaan gagal (${status}). Silakan coba lagi.`
    const errors = body && "errors" in body && body.errors ? body.errors : undefined

    if (status === 401 && !isAuthRequest(path) && token) {
      saveToken(null)
      if (typeof window !== "undefined" && !window.location.pathname.startsWith(LOGIN_PATH)) {
        window.location.assign(LOGIN_PATH)
      }
    }

    throw new ApiError(message, status, errors)
  }

  return (payload ?? { success: true, message: "Berhasil.", data: null as T }) as ApiResponse<T>
}

/** Mengambil `data` dari envelope; melempar ApiError jika gagal. */
export async function getData<T>(path: string, options?: Parameters<typeof request<T>>[1]): Promise<T> {
  const response = await request<T>(path, options)
  return response.data
}

/**
 * Menormalkan dua bentuk pagination yang digunakan backend:
 * - `{ data: [...], meta: {...} }` (list job/event)
 * - `{ data: { current_page, data: [...], ... }, meta: {...} }` (Laravel paginator, list lamaran/my-events)
 */
export function toPaginated<T>(data: unknown, meta?: Partial<ApiMeta> | null): Paginated<T> {
  const normalized: ApiMeta = {
    current_page: meta?.current_page ?? 1,
    last_page: meta?.last_page ?? 1,
    per_page: meta?.per_page ?? 10,
    total: meta?.total ?? 0,
  }

  if (!data || typeof data !== "object") {
    return { items: [], meta: normalized }
  }

  const record = data as Record<string, unknown>

  if (Array.isArray(record.data)) {
    return { items: record.data as T[], meta: normalized }
  }

  if (Array.isArray(data)) {
    return { items: data as T[], meta: normalized }
  }

  return { items: [], meta: normalized }
}

export { LOGIN_PATH }

import { getData, request, saveToken } from "@/lib/api/client"
import type { LoginResult, RegisterResult } from "@/lib/types"

const BASE = "/api/v1/auth"

export interface RegisterInput {
  name: string
  nisn: string
  email: string
  password: string
  password_confirmation: string
  school_id: number
}

export function register(input: RegisterInput): Promise<RegisterResult> {
  return getData<RegisterResult>(`${BASE}/register`, { method: "POST", body: input })
}

export function verifyEmail(email: string, otp: string): Promise<LoginResult> {
  return getData<LoginResult>(`${BASE}/verify-email`, { method: "POST", body: { email, otp } })
}

export function login(identifier: string, password: string): Promise<LoginResult> {
  return getData<LoginResult>(`${BASE}/login`, { method: "POST", body: { identifier, password } })
}

export function resendOtp(email: string, context: "verify" | "reset"): Promise<{ message?: string }> {
  return getData<{ message?: string }>(`${BASE}/resend-otp`, { method: "POST", body: { email, context } })
}

export function forgotPassword(email: string): Promise<{ email: string; expires_in: string }> {
  return getData<{ email: string; expires_in: string }>(`${BASE}/forgot-password`, {
    method: "POST",
    body: { email },
  })
}

export function resetPassword(
  email: string,
  otp: string,
  new_password: string,
  new_password_confirmation: string
): Promise<null> {
  return getData<null>(`${BASE}/reset-password`, {
    method: "POST",
    body: { email, otp, new_password, new_password_confirmation },
  })
}

/** Logout di sisi backend (best-effort) dan bersihkan token lokal. */
export async function logout(): Promise<void> {
  try {
    await request<null>(`${BASE}/logout`, { method: "POST" })
  } catch {
    // Token lokal tetap dibersihkan walau backend tidak merespons.
  } finally {
    saveToken(null)
  }
}

"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { CheckCircle2, ChevronRight, Loader2, LockKeyhole, Mail, UserRound } from "lucide-react"

import { AuthPanel } from "@/components/layout/auth-panel"
import { OtpInput } from "@/components/shared/otp-input"
import { FieldError, FormAlert } from "@/components/shared/states"
import { register, resendOtp, verifyEmail } from "@/lib/api/auth"
import { ApiError } from "@/lib/api/client"
import { fetchSchools } from "@/lib/api/master"
import type { School } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Step = "form" | "otp" | "success"

interface FormValues {
  name: string
  nisn: string
  email: string
  password: string
  password_confirmation: string
  school_id: string
}

const INITIAL_VALUES: FormValues = {
  name: "",
  nisn: "",
  email: "",
  password: "",
  password_confirmation: "",
  school_id: "",
}

function firstError(errors: Record<string, string[]>, field: string): string | undefined {
  return errors[field]?.[0]
}

export default function RegisterPage() {
  const [step, setStep] = useState<Step>("form")
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES)
  const [schools, setSchools] = useState<School[]>([])
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""))
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    let active = true
    void fetchSchools()
      .then((data) => {
        if (active) setSchools(data)
      })
      .catch(() => {
        if (active) setError("Gagal memuat daftar sekolah. Silakan muat ulang halaman.")
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = window.setInterval(() => {
      setResendCooldown((seconds) => Math.max(0, seconds - 1))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [resendCooldown > 0])

  const updateField = useCallback((field: keyof FormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    setFieldErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }, [])

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault()
    if (isSubmitting) return

    setError("")
    setFieldErrors({})
    setIsSubmitting(true)
    try {
      await register({
        name: values.name.trim(),
        nisn: values.nisn.trim(),
        email: values.email.trim(),
        password: values.password,
        password_confirmation: values.password_confirmation,
        school_id: Number(values.school_id),
      })
      setStep("otp")
      setDigits(Array(6).fill(""))
    } catch (caught) {
      if (caught instanceof ApiError && caught.errors) {
        setFieldErrors(caught.errors)
      }
      setError(caught instanceof ApiError ? caught.message : "Pendaftaran gagal. Silakan coba lagi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerify = async (event: React.FormEvent) => {
    event.preventDefault()
    if (isSubmitting) return

    const otp = digits.join("")
    if (otp.length < 6) {
      setError("Masukkan 6 digit kode OTP yang dikirim ke email Anda.")
      return
    }

    setError("")
    setIsSubmitting(true)
    try {
      await verifyEmail(values.email, otp)
      setStep("success")
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Kode OTP tidak valid.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResend = async () => {
    if (isSubmitting || resendCooldown > 0) return
    setIsSubmitting(true)
    setError("")
    try {
      await resendOtp(values.email, "verify")
      setResendCooldown(30)
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Gagal mengirim ulang OTP.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthPanel
      badge="Pendaftaran Alumni"
      heading="Bergabung dan jadilah bagian dari jaringan alumni terpercaya."
      description="Daftarkan diri, verifikasi akun, dan mulai perjalanan karier bersama ribuan alumni."
    >
      {step === "form" && (
        <form onSubmit={handleRegister} noValidate>
          <p className="text-sm font-semibold text-primary">PORTAL ALUMNI & BKK</p>
          <h2 className="mt-2 text-3xl font-bold">Buat akun baru</h2>
          <p className="mt-2 text-muted-foreground">Isi data diri Anda untuk memulai pendaftaran.</p>

          <div className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Nama lengkap</Label>
              <div className="relative">
                <UserRound className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <Input
                  id="name"
                  className="pl-9"
                  placeholder="Contoh: Aulia Rahma"
                  value={values.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  aria-invalid={Boolean(fieldErrors.name)}
                  required
                  autoFocus
                />
              </div>
              <FieldError message={firstError(fieldErrors, "name")} />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="nisn">NISN</Label>
              <Input
                id="nisn"
                inputMode="numeric"
                placeholder="Contoh: 0011223344"
                value={values.nisn}
                onChange={(event) => updateField("nisn", event.target.value.replace(/[^0-9]/g, ""))}
                aria-invalid={Boolean(fieldErrors.nisn)}
                required
              />
              <FieldError message={firstError(fieldErrors, "nisn")} />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <Input
                  id="email"
                  type="email"
                  className="pl-9"
                  placeholder="nama@email.com"
                  value={values.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  aria-invalid={Boolean(fieldErrors.email)}
                  required
                />
              </div>
              <FieldError message={firstError(fieldErrors, "email")} />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="school">Sekolah</Label>
              <Select value={values.school_id} onValueChange={(value) => updateField("school_id", value ?? "")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih sekolah asal" />
                </SelectTrigger>
                <SelectContent>
                  {schools.map((school) => (
                    <SelectItem key={school.id} value={String(school.id)}>
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError message={firstError(fieldErrors, "school_id")} />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Kata sandi</Label>
              <div className="relative">
                <LockKeyhole className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  className="pl-9"
                  placeholder="Minimal 8 karakter"
                  value={values.password}
                  onChange={(event) => updateField("password", event.target.value)}
                  aria-invalid={Boolean(fieldErrors.password)}
                  required
                />
              </div>
              <FieldError message={firstError(fieldErrors, "password")} />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password_confirmation">Konfirmasi kata sandi</Label>
              <Input
                id="password_confirmation"
                type="password"
                autoComplete="new-password"
                placeholder="Ulangi kata sandi"
                value={values.password_confirmation}
                onChange={(event) => updateField("password_confirmation", event.target.value)}
                aria-invalid={Boolean(fieldErrors.password_confirmation)}
                required
              />
              <FieldError message={firstError(fieldErrors, "password_confirmation")} />
            </div>

            {error && <FormAlert>{error}</FormAlert>}

            <Button size="lg" type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" data-icon="inline-start" />}
              {isSubmitting ? "Mendaftarkan..." : "Kirim kode OTP"}
              <ChevronRight data-icon="inline-end" />
            </Button>
          </div>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            Sudah punya akun?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Masuk sekarang
            </Link>
          </p>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={handleVerify} noValidate>
          <p className="text-sm font-semibold text-primary">VERIFIKASI EMAIL</p>
          <h2 className="mt-2 text-3xl font-bold">Masukkan kode OTP</h2>
          <p className="mt-2 text-muted-foreground">Kami mengirim kode 6 digit ke email Anda.</p>

          <div className="mt-6 rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            Kode dikirim ke <span className="font-semibold text-foreground">{values.email}</span>. Silakan cek kotak
            masuk atau folder spam.
          </div>

          <div className="mt-6 flex flex-col gap-4">
            <Label htmlFor="otp">Kode OTP</Label>
            <OtpInput value={digits} onChange={setDigits} disabled={isSubmitting} />
            {error && <FormAlert>{error}</FormAlert>}

            <Button size="lg" type="submit" disabled={isSubmitting || digits.join("").length < 6}>
              {isSubmitting && <Loader2 className="animate-spin" data-icon="inline-start" />}
              {isSubmitting ? "Memverifikasi..." : "Verifikasi OTP"}
              <ChevronRight data-icon="inline-end" />
            </Button>
          </div>

          <button
            type="button"
            className="mt-3 w-full text-center text-sm text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleResend}
            disabled={isSubmitting || resendCooldown > 0}
          >
            {resendCooldown > 0
              ? `Kirim ulang kode OTP dalam ${resendCooldown}s`
              : isSubmitting
                ? "Mengirim ulang..."
                : "Kirim ulang kode OTP"}
          </button>
        </form>
      )}

      {step === "success" && (
        <div>
          <div className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <CheckCircle2 className="size-8" aria-hidden />
          </div>
          <p className="mt-6 text-sm font-semibold text-primary">PENDAFTARAN SELESAI</p>
          <h2 className="mt-2 text-3xl font-bold">Akun berhasil dibuat</h2>
          <p className="mt-2 text-muted-foreground">
            Akun Anda telah diverifikasi dan siap digunakan. Silakan masuk untuk melengkapi profil.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Button size="lg" render={<Link href="/login" />}>
              Masuk ke dashboard <ChevronRight data-icon="inline-end" />
            </Button>
          </div>
        </div>
      )}
    </AuthPanel>
  )
}

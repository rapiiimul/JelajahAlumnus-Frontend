"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { CheckCircle2, ChevronRight, Eye, EyeOff, Loader2, LockKeyhole, Mail } from "lucide-react"

import { AuthPanel } from "@/components/layout/auth-panel"
import { OtpInput } from "@/components/shared/otp-input"
import { FieldError, FormAlert } from "@/components/shared/states"
import { forgotPassword, resendOtp, resetPassword } from "@/lib/api/auth"
import { ApiError } from "@/lib/api/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Step = "email" | "otp" | "success"

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""))
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = window.setInterval(() => {
      setResendCooldown((seconds) => Math.max(0, seconds - 1))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [resendCooldown > 0])

  const requestOtp = async (event: React.FormEvent) => {
    event.preventDefault()
    if (isSubmitting) return

    setError("")
    setIsSubmitting(true)
    try {
      await forgotPassword(email.trim())
      setStep("otp")
      setDigits(Array(6).fill(""))
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Gagal mengirim kode OTP.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = async (event: React.FormEvent) => {
    event.preventDefault()
    if (isSubmitting) return

    const otp = digits.join("")
    if (otp.length < 6) {
      setError("Masukkan 6 digit kode OTP yang dikirim ke email Anda.")
      return
    }
    if (newPassword.length < 8) {
      setError("Kata sandi baru minimal 8 karakter.")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("Konfirmasi kata sandi tidak cocok.")
      return
    }

    setError("")
    setIsSubmitting(true)
    try {
      await resetPassword(email, otp, newPassword, confirmPassword)
      setStep("success")
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Gagal mereset kata sandi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResend = async () => {
    if (isSubmitting || resendCooldown > 0) return
    setIsSubmitting(true)
    setError("")
    try {
      await resendOtp(email, "reset")
      setResendCooldown(30)
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Gagal mengirim ulang OTP.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthPanel
      badge="Bantuan Akun"
      heading="Pulihkan akses ke akun alumni Anda dengan mudah."
      description="Masukkan email terdaftar dan kami akan mengirimkan kode OTP untuk mereset kata sandi Anda."
    >
      {step === "email" && (
        <form onSubmit={requestOtp} noValidate>
          <p className="text-sm font-semibold text-primary">PORTAL ALUMNI & BKK</p>
          <h2 className="mt-2 text-3xl font-bold">Lupa kata sandi?</h2>
          <p className="mt-2 text-muted-foreground">Masukkan email terdaftar untuk menerima kode OTP.</p>

          <div className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <Input
                  id="email"
                  type="email"
                  className="pl-9"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            {error && <FormAlert>{error}</FormAlert>}

            <Button size="lg" type="submit" disabled={isSubmitting || !email.trim()}>
              {isSubmitting && <Loader2 className="animate-spin" data-icon="inline-start" />}
              {isSubmitting ? "Mengirim..." : "Kirim kode OTP"}
              <ChevronRight data-icon="inline-end" />
            </Button>
          </div>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            Ingat kata sandi?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Masuk sekarang
            </Link>
          </p>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={handleReset} noValidate>
          <p className="text-sm font-semibold text-primary">RESET KATA SANDI</p>
          <h2 className="mt-2 text-3xl font-bold">Buat kata sandi baru</h2>
          <p className="mt-2 text-muted-foreground">Masukkan kode OTP dan kata sandi baru Anda.</p>

          <div className="mt-6 rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            Kode dikirim ke <span className="font-semibold text-foreground">{email}</span>. Berlaku selama 5 menit.
          </div>

          <div className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="otp">Kode OTP</Label>
              <OtpInput value={digits} onChange={setDigits} disabled={isSubmitting} />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="new_password">Kata sandi baru</Label>
              <div className="relative">
                <LockKeyhole className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <Input
                  id="new_password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className="pl-9 pr-10"
                  placeholder="Minimal 8 karakter"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="absolute top-1/2 right-1.5 -translate-y-1/2"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="new_password_confirmation">Konfirmasi kata sandi baru</Label>
              <Input
                id="new_password_confirmation"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Ulangi kata sandi baru"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                aria-invalid={Boolean(confirmPassword && confirmPassword !== newPassword)}
                required
              />
              {confirmPassword && confirmPassword !== newPassword && (
                <FieldError message="Konfirmasi kata sandi tidak cocok." />
              )}
            </div>

            {error && <FormAlert>{error}</FormAlert>}

            <Button size="lg" type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" data-icon="inline-start" />}
              {isSubmitting ? "Menyimpan..." : "Simpan kata sandi baru"}
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
          <p className="mt-6 text-sm font-semibold text-primary">KATA SANDI DIPERBARUI</p>
          <h2 className="mt-2 text-3xl font-bold">Berhasil direset</h2>
          <p className="mt-2 text-muted-foreground">
            Kata sandi Anda telah berhasil diperbarui. Silakan masuk dengan kata sandi baru.
          </p>
          <div className="mt-6">
            <Button size="lg" className="w-full" render={<Link href="/login" />}>
              Masuk ke dashboard <ChevronRight data-icon="inline-end" />
            </Button>
          </div>
        </div>
      )}
    </AuthPanel>
  )
}

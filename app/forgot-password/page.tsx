"use client"

import Link from "next/link"
import { useRef, useState } from "react"
import { ChevronRight, GraduationCap, LockKeyhole, Mail } from "lucide-react"
import { forgotPasswordToBackend, resendOtpToBackend, resetPasswordToBackend } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Step = "email" | "otp" | "success"

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="flex flex-col gap-2 text-sm font-medium">{label}{children}</label>
}

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""))
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const requestOtp = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!email.trim()) {
      setError("Masukkan alamat email Anda.")
      return
    }
    setIsSubmitting(true)
    setError("")
    const result = await forgotPasswordToBackend(email)
    setIsSubmitting(false)
    if (!result.ok) {
      setError(result.message || "Gagal mengirim OTP.")
      return
    }
    setMessage(result.message || `Kode OTP telah dikirim ke ${email}.`)
    setStep("otp")
    setDigits(Array(6).fill(""))
  }

  const resetPassword = async (event: React.FormEvent) => {
    event.preventDefault()
    const otp = digits.join("")
    if (otp.length < 6) {
      setError("Masukkan 6 digit kode OTP yang dikirim ke email Anda.")
      return
    }
    if (newPassword.length < 6) {
      setError("Kata sandi baru minimal 6 karakter.")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("Konfirmasi kata sandi tidak cocok.")
      return
    }
    setIsSubmitting(true)
    setError("")
    const result = await resetPasswordToBackend(email, otp, newPassword, confirmPassword)
    setIsSubmitting(false)
    if (!result.ok) {
      setError(result.message || "Reset kata sandi gagal.")
      return
    }
    setMessage(result.message || "Kata sandi berhasil diperbarui.")
    setStep("success")
  }

  const resendOtp = async () => {
    setIsSubmitting(true)
    const result = await resendOtpToBackend(email, "reset")
    setIsSubmitting(false)
    setMessage(result.message || "OTP baru telah dikirim.")
    setDigits(Array(6).fill(""))
    setError("")
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_.95fr]">
      <section className="hidden flex-col justify-between bg-primary p-12 text-primary-foreground lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary-foreground/15">
            <GraduationCap />
          </div>
          <div>
            <p className="font-bold leading-tight">Jejak Lulusan</p>
            <p className="text-xs text-primary-foreground/70">SMK Nusantara</p>
          </div>
        </div>
        <div className="max-w-xl">
          <h1 className="text-5xl font-bold leading-tight text-balance">
            Pulihkan akses ke akun alumni Anda dengan mudah.
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-primary-foreground/75">
            Masukkan email terdaftar dan kami akan mengirimkan kode OTP untuk mereset kata sandi Anda.
          </p>
        </div>
        <p className="text-sm text-primary-foreground/60">© 2026 SMK Nusantara · Bursa Kerja Khusus</p>
      </section>

      <section className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <GraduationCap />
              </div>
              <div>
                <p className="font-bold leading-tight">Jejak Lulusan</p>
                <p className="text-xs text-muted-foreground">SMK Nusantara</p>
              </div>
            </div>
          </div>

          {step === "email" && (
            <form onSubmit={requestOtp}>
              <p className="text-sm font-semibold text-primary">PORTAL ALUMNI & BKK</p>
              <h2 className="mt-2 text-3xl font-bold">Lupa kata sandi?</h2>
              <p className="mt-2 text-muted-foreground">Masukkan email terdaftar untuk menerima kode OTP.</p>
              <div className="mt-6 flex flex-col gap-4">
                <Field label="Email">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input className="pl-9" type="email" placeholder="nama@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                </Field>
                {error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
                <Button size="lg" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Mengirim..." : "Kirim kode OTP"} <ChevronRight data-icon="inline-end" />
                </Button>
              </div>
              <div className="mt-5 text-center text-sm text-muted-foreground">
                Ingat kata sandi?{" "}
                <Link href="/login" className="font-semibold text-primary hover:underline">Masuk sekarang</Link>
              </div>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={resetPassword}>
              <p className="text-sm font-semibold text-primary">RESET KATA SANDI</p>
              <h2 className="mt-2 text-3xl font-bold">Buat kata sandi baru</h2>
              <p className="mt-2 text-muted-foreground">Masukkan kode OTP dan kata sandi baru Anda.</p>
              <div className="mt-6 rounded-lg bg-muted p-4 text-sm text-muted-foreground">
                Kode dikirim ke <span className="font-semibold text-foreground">{email}</span>. Berlaku selama 5 menit.
              </div>
              <div className="mt-6 flex flex-col gap-4">
                <p className="text-sm font-medium">Kode OTP</p>
                <div className="flex gap-2">
                  {digits.map((d, i) => (
                    <input
                      key={i}
                      ref={el => { refs.current[i] = el }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={d}
                      className="h-12 w-full rounded-lg border border-input bg-transparent text-center text-lg font-semibold outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                      onChange={e => {
                        const val = e.target.value.replace(/[^0-9]/g, "").slice(-1)
                        const next = [...digits]
                        next[i] = val
                        setDigits(next)
                        if (val && i < 5) refs.current[i + 1]?.focus()
                      }}
                      onKeyDown={e => {
                        if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus()
                      }}
                      onPaste={e => {
                        e.preventDefault()
                        const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6)
                        const next = Array(6).fill("")
                        pasted.split("").forEach((c, idx) => { next[idx] = c })
                        setDigits(next)
                        refs.current[Math.min(pasted.length, 5)]?.focus()
                      }}
                    />
                  ))}
                </div>
                <Field label="Kata sandi baru">
                  <div className="relative">
                    <LockKeyhole className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input className="pl-9" type="password" placeholder="Minimal 6 karakter" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                  </div>
                </Field>
                <Field label="Konfirmasi kata sandi">
                  <div className="relative">
                    <LockKeyhole className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input className="pl-9" type="password" placeholder="Ulangi kata sandi baru" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                  </div>
                </Field>
                {error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
                {message && <p className="rounded-lg bg-primary/5 p-3 text-sm text-primary">{message}</p>}
                <Button size="lg" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Menyimpan..." : "Simpan kata sandi baru"} <ChevronRight data-icon="inline-end" />
                </Button>
              </div>
              <button
                type="button"
                className="mt-3 w-full text-center text-sm text-primary hover:underline"
                onClick={resendOtp}
                disabled={isSubmitting}
              >
                Kirim ulang kode OTP
              </button>
            </form>
          )}

          {step === "success" && (
            <div>
              <div className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <LockKeyhole className="size-8" />
              </div>
              <p className="mt-6 text-sm font-semibold text-primary">KATA SANDI DIPERBARUI</p>
              <h2 className="mt-2 text-3xl font-bold">Berhasil direset</h2>
              <p className="mt-2 text-muted-foreground">
                {message || "Kata sandi Anda telah berhasil diperbarui. Silakan masuk dengan kata sandi baru."}
              </p>
              <div className="mt-6">
                <Button size="lg" className="w-full" render={<Link href="/login" />}>
                  Masuk ke dashboard <ChevronRight data-icon="inline-end" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

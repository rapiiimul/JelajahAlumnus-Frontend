"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowLeft, ArrowRight, CheckCircle2, GraduationCap, LockKeyhole, Mail, Sparkles, UserRound } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { registerToBackend, resendOtpToBackend, verifyEmailToBackend } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

type Step = "form" | "otp" | "success"

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export default function RegisterPage() {
  const [step, setStep] = useState<Step>("form")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [nisn, setNisn] = useState("")
  const [password, setPassword] = useState("")
  const role: "alumni" = "alumni"
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const sendOtp = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!name.trim() || !email.trim() || !nisn.trim() || !password.trim()) {
      setError("Lengkapi semua kolom terlebih dahulu.")
      return
    }

    if (password.length < 6) {
      setError("Kata sandi minimal 6 karakter.")
      return
    }

    setIsSubmitting(true)
    setError("")
    const result = await registerToBackend({
      name,
      email,
      nisn,
      password,
      password_confirmation: password,
      role,
    })
    setIsSubmitting(false)

    if (!result.ok) {
      setError(result.message || "Pendaftaran gagal.")
      return
    }

    setMessage(result.message || `Kode OTP telah dikirim ke ${email}.`)
    setStep("otp")
    setOtp("")
  }

  const verifyOtp = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!otp.trim()) {
      setError("Masukkan kode OTP yang dikirim ke email Anda.")
      return
    }

    setIsSubmitting(true)
    setError("")
    const result = await verifyEmailToBackend(email, otp)
    setIsSubmitting(false)

    if (!result.ok) {
      setError(result.message || "Kode OTP tidak sesuai.")
      return
    }

    setMessage(result.message || "Verifikasi berhasil. Akun Anda siap digunakan.")
    setStep("success")
  }

  const resendOtp = async () => {
    setIsSubmitting(true)
    const result = await resendOtpToBackend(email, "verify")
    setIsSubmitting(false)
    setMessage(result.message || "OTP baru telah dikirim.")
    setOtp("")
    setError("")
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(13,118,88,0.15),_transparent_45%),linear-gradient(135deg,_#f8fbf9_0%,_#eef7f3_100%)] px-4 py-10 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row lg:items-center">
        <section className="flex-1 rounded-3xl border border-primary/10 bg-background/80 p-8 shadow-sm backdrop-blur md:p-10">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <GraduationCap className="size-6" />
            </div>
            <div>
              <p className="text-lg font-semibold">Jejak Lulusan</p>
              <p className="text-sm text-muted-foreground">SMK Nusantara</p>
            </div>
          </div>

          <Badge className="mt-8 bg-primary/10 text-primary">Pendaftaran akun</Badge>
          <h1 className="mt-4 text-3xl font-bold leading-tight md:text-4xl">
            Buat akun baru untuk ikut terhubung dengan alumni dan peluang karier.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Proses pendaftaran dan verifikasi OTP sekarang terhubung ke backend resmi Lacak.app.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/80 bg-muted/40 p-4">
              <p className="text-sm font-semibold">Cepat</p>
              <p className="mt-1 text-sm text-muted-foreground">Isi data singkat dan dapatkan kode verifikasi dalam hitungan detik.</p>
            </div>
            <div className="rounded-2xl border border-border/80 bg-muted/40 p-4">
              <p className="text-sm font-semibold">Aman untuk demo</p>
              <p className="mt-1 text-sm text-muted-foreground">OTP dikirim langsung oleh sistem backend ke email Anda.</p>
            </div>
          </div>
        </section>

        <Card className="w-full max-w-xl border-primary/10 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{step === "success" ? "Akun berhasil dibuat" : step === "otp" ? "Masukkan kode OTP" : "Daftar akun"}</CardTitle>
                <CardDescription>
                  {step === "success"
                    ? "Verifikasi selesai, Anda bisa lanjut ke halaman login."
                    : step === "otp"
                      ? "Kami mengirim kode ke email Anda."
                      : "Isi data diri Anda untuk memulai."}
                </CardDescription>
              </div>
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <Sparkles className="size-5" />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {step === "form" && (
              <form className="space-y-4" onSubmit={sendOtp}>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nama lengkap</label>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input className="pl-9" placeholder="Contoh: Aulia Rahma" value={name} onChange={(event) => setName(event.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input className="pl-9" type="email" placeholder="nama@email.com" value={email} onChange={(event) => setEmail(event.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">NISN</label>
                  <Input placeholder="Contoh: 0011223344" value={nisn} onChange={(event) => setNisn(event.target.value)} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Kata sandi</label>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input className="pl-9" type="password" placeholder="Minimal 6 karakter" value={password} onChange={(event) => setPassword(event.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Daftar sebagai</label>
                  <div className="rounded-2xl border border-border/80 bg-muted/40 p-4 text-sm text-muted-foreground">Alumni</div>
                </div>

                {error ? <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}

                <Button className="w-full" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Mengirim..." : "Kirim OTP"} <ArrowRight className="ml-2 size-4" />
                </Button>
              </form>
            )}

            {step === "otp" && (
              <form className="space-y-4" onSubmit={verifyOtp}>
                <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">Kode dikirim ke</p>
                  <p className="mt-1">{email || "email Anda"}</p>
                  <p className="mt-3 rounded-lg bg-background px-3 py-2 text-sm text-primary">
                    Silakan cek email Anda untuk kode OTP yang dikirim sistem.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Kode OTP</label>
                  <Input
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(event) => setOtp(event.target.value.replace(/[^0-9]/g, ""))}
                  />
                </div>

                {error ? <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}
                {message ? <p className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary">{message}</p> : null}

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button className="flex-1" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Memproses..." : "Verifikasi OTP"}
                  </Button>
                  <Button type="button" variant="outline" className="flex-1" onClick={resendOtp} disabled={isSubmitting}>
                    Kirim ulang
                  </Button>
                </div>
              </form>
            )}

            {step === "success" && (
              <div className="space-y-4">
                <div className="flex items-center justify-center rounded-full bg-green-100 p-4 text-green-700">
                  <CheckCircle2 className="size-10" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold">Pendaftaran berhasil</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {message || "Akun Anda telah diverifikasi dan siap digunakan."}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button asChild>
                    <Link href="/login">
                      Ke halaman login <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/">
                      <ArrowLeft className="mr-2 size-4" /> Kembali ke beranda
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

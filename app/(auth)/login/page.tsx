"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react"

import { useAuth } from "@/components/auth-provider"
import { AuthPanel } from "@/components/layout/auth-panel"
import { FormAlert } from "@/components/shared/states"
import { ApiError } from "@/lib/api/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated, isHydrating } = useAuth()

  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isHydrating && isAuthenticated) {
      router.replace("/dashboard")
    }
  }, [isHydrating, isAuthenticated, router])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (isSubmitting) return

    setError("")
    setIsSubmitting(true)
    try {
      await login(identifier.trim(), password)
      router.replace("/dashboard")
    } catch (caught) {
      const message = caught instanceof ApiError ? caught.message : "Login gagal. Silakan coba lagi."
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthPanel
      heading="Dari ruang kelas menuju masa depan yang gemilang."
      description="Terhubung dengan alumni, peluang industri, dan perkembangan karier melalui satu platform terpercaya."
    >
      <form onSubmit={handleSubmit} noValidate>
        <p className="text-sm font-semibold text-primary">PORTAL ALUMNI & BKK</p>
        <h2 className="mt-2 text-3xl font-bold">Selamat datang kembali</h2>
        <p className="mt-2 text-muted-foreground">Masuk menggunakan email atau NISN terdaftar.</p>

        <div className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="identifier">Email atau NISN</Label>
            <Input
              id="identifier"
              type="text"
              autoComplete="username"
              placeholder="nama@email.com atau NISN"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Kata sandi</Label>
              <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">
                Lupa kata sandi?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Masukkan kata sandi"
                className="pr-10"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
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

          {error && <FormAlert>{error}</FormAlert>}

          <Button size="lg" type="submit" disabled={isSubmitting || !identifier.trim() || !password}>
            {isSubmitting && <Loader2 className="animate-spin" data-icon="inline-start" />}
            {isSubmitting ? "Memproses..." : "Masuk"}
          </Button>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Belum punya akun?{" "}
        <Link href="/register" className="font-semibold text-primary hover:underline">
          Daftar sekarang
        </Link>
      </p>

    </AuthPanel>
  )
}

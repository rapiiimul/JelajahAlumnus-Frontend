import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useApp } from "@/components/app-provider"
import { loginToBackend } from "@/lib/api-client"
import { GraduationCap } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { switchRole } = useApp()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await loginToBackend(email, password)

      if (result.ok) {
        router.push("/dashboard")
      } else {
        setError(result.message || "Login gagal. Silakan coba lagi.")
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-[1.05fr_.95fr]">
      {/* Left side - Login Form */}
      <section className="flex flex-col justify-between overflow-hidden bg-muted p-12 text-foreground">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <GraduationCap className="size-5" />
          </div>
          <div>
            <p className="text-lg font-bold">Jejak Lulusan</p>
            <p className="text-sm text-muted-foreground">SMK Nusantara</p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-3xl font-bold tracking-tight">Masuk ke Akun Anda</h2>
          <p className="text-muted-foreground">
            Masukkan email dan kata sandi untuk melanjutkan
          </p>
        </div>

        <div className="mt-auto">
          <div className="rounded-xl bg-primary/5 p-4 text-primary">
            <p className="text-sm font-semibold">Pusat bantuan BKK</p>
            <p className="mt-1 text-xs leading-relaxed">Butuh bantuan masuk ke sistem? Hubungi tim BKK.</p>
            <button className="mt-3 text-xs font-semibold underline underline-offset-4">
              Hubungi dukungan
            </button>
          </div>
        </div>
      </section>

      {/* Right side - Login Form */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden p-12">
        <div className="mx-auto w-full max-w-sm">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Masuk</CardTitle>
              <CardDescription>
                Masukkan email dan kata sandi Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="aulia.rahma@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Kata Sandi</Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                {error && (
                  <div className="text-sm text-red-600">{error}</div>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Memproses..." : "Masuk"}
                </Button>
              </form>
              <div className="mt-4 text-center text-sm">
                <a href="/forgot-password" className="underline underline-offset-4">
                  Lupa kata sandi?
                </a>
              </div>
            </CardContent>
          </Card>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            Belum punya akun?{" "}
            <a href="/register" className="underline underline-offset-4">
              Daftar
            </a>
          </div>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            <p>Demo Account:</p>
            <p>Email: aulia.rahma@email.com</p>
            <p>Password: alumni123</p>
          </div>
        </div>
      </section>
    </main>
  )
}

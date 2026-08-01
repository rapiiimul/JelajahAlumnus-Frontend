import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useApp } from "@/components/app-provider"
import { LayoutDashboard, ClipboardCheck, BriefcaseBusiness, CalendarDays, CircleUserRound, TrendingUp, Users, BarChart3 } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { session, jobs, applications, apiStatus } = useApp()

  const stats = {
    totalJobs: jobs.length,
    appliedJobs: applications.length,
    pendingApplications: applications.filter(a => a.status === "Dikirim").length,
    upcomingEvents: 3 // This would come from the backend in a real app
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Selamat datang, {session?.name}. Pantau aktivitas Anda dan temukan peluang baru.
          </p>
        </div>

        {/* Status Backend */}
        <div className="mb-8">
          <div className={`rounded-lg p-4 ${apiStatus?.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
            <div className="flex items-center">
              {apiStatus?.success ? (
                <BarChart3 className="w-5 h-5 mr-2" />
              ) : (
                <TrendingUp className="w-5 h-5 mr-2" />
              )}
              <div>
                <p className="font-medium">
                  {apiStatus?.success ? "Backend Terhubung" : "Backend Tidak Tersedia"}
                </p>
                <p className="text-sm">
                  {apiStatus?.message || "Sistem berjalan dalam mode demo"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Lowongan</CardTitle>
              <BriefcaseBusiness className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalJobs}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalJobs > 0 ? "Ada lowongan baru" : "Tunggu informasi selanjutnya"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lamaran Terkirim</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.appliedJobs}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingApplications} menunggu peninjauan
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Event Mendatang</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
              <p className="text-xs text-muted-foreground">
                {stats.upcomingEvents > 0 ? "Daftar sekarang" : "Tunggu informasi selanjutnya"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profil Lengkap</CardTitle>
              <CircleUserRound className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">75%</div>
              <Progress value={75} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                Lengkapi profil untuk meningkatkan visibilitas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Tracer Study</CardTitle>
              <CardDescription>
                Bantu kami meningkatkan kualitas pendidikan dengan mengisi data Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <Button asChild className="w-full">
                  <Link href="/tracer-study">Isi Tracer Study</Link>
                </Button>
                <Button variant="outline" className="w-full">
                  Lihat Riwayat
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bursa Kerja</CardTitle>
              <CardDescription>
                Temukan peluang kerja yang tersedia untuk lulusan SMK Nusantara
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <Button asChild className="w-full">
                  <Link href="/lowongan">Jelajahi Lowongan</Link>
                </Button>
                <Button variant="outline" className="w-full">
                  Lamaran Saya
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <CardTitle>Lamaran Terbaru</CardTitle>
            <CardDescription>
              Riwayat lamaran pekerjaan Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            {applications.length > 0 ? (
              <div className="space-y-4">
                {applications.slice(0, 3).map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{app.jobTitle}</h4>
                      <p className="text-sm text-gray-600">{app.company}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={app.status === "Diterima" ? "default" : "secondary"}>
                        {app.status}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">{app.date}</p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  Lihat Semua Lamaran
                </Button>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <ClipboardCheck className="mx-auto w-12 h-12 mb-2" />
                <p>Belum ada lamaran pekerjaan</p>
                <Button asChild className="mt-4">
                  <Link href="/lowongan">Cari Lowongan</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

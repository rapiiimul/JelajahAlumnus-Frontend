import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useApp } from "@/components/app-provider"
import { fetchJobsFromBackend } from "@/lib/api-client"
import { useRouter } from "next/navigation"
import { Search, BriefcaseBusiness, MapPin, CalendarDays } from "lucide-react"

export default function LowonganPage() {
  const { session, saved, toggleSaved, apply } = useApp()
  const router = useRouter()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredJobs, setFilteredJobs] = useState<any[]>([])
  const [selectedJob, setSelectedJob] = useState<any>(null)

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const jobsData = await fetchJobsFromBackend()
        setJobs(jobsData)
        setFilteredJobs(jobsData)
      } catch (error) {
        console.error("Gagal memuat lowongan:", error)
      } finally {
        setLoading(false)
      }
    }

    loadJobs()
  }, [])

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredJobs(jobs)
    } else {
      const filtered = jobs.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredJobs(filtered)
    }
  }, [searchTerm, jobs])

  const handleApply = (job: any) => {
    if (!session) {
      router.push("/login")
      return
    }

    setSelectedJob(job)
  }

  const confirmApply = (note: string) => {
    if (selectedJob) {
      apply(selectedJob, note)
      setSelectedJob(null)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Memuat data lowongan...</div>
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Bursa Kerja Khusus</h1>
          <p className="text-gray-600">
            Temukan peluang kerja yang tersedia untuk lulusan SMK Nusantara
          </p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Cari lowongan berdasarkan judul, perusahaan, atau lokasi..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="flex flex-col h-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{job.title}</CardTitle>
                    <CardDescription className="font-medium">{job.company}</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleSaved(job.id)}
                    className={saved.includes(job.id) ? "text-red-500" : ""}
                  >
                    <svg
                      className={`w-5 h-5 ${saved.includes(job.id) ? "fill-current" : ""}`}
                      fill={saved.includes(job.id) ? "currentColor" : "none"}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {job.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarDays className="w-4 h-4 mr-2" />
                    {job.deadline}
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant={job.status === "Terbit" ? "default" : "secondary"}>
                      {job.status}
                    </Badge>
                    <span className="text-sm text-gray-500">{job.applicants} pelamar</span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3">{job.description}</p>
                </div>
              </CardContent>
              <div className="mt-auto pt-4">
                <Button 
                  className="w-full" 
                  onClick={() => handleApply(job)}
                >
                  Lamar Pekerjaan
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-10">
            <BriefcaseBusiness className="mx-auto w-12 h-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium">Tidak ada lowongan</h3>
            <p className="mt-1 text-gray-500">
              {searchTerm 
                ? "Tidak ada lowongan yang cocok dengan pencarian Anda."
                : "Belum ada lowongan kerja yang tersedia. Silakan cek lagi nanti."
              }
            </p>
          </div>
        )}
      </div>

      {/* Modal Apply */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Lamar Pekerjaan: {selectedJob.title}</h3>
            <p className="text-gray-600 mb-4">
              Anda akan melamar ke {selectedJob.company} untuk posisi {selectedJob.title}.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Catatan tambahan (opsional)</label>
              <textarea
                className="w-full p-2 border rounded-md"
                rows={3}
                placeholder="Tambahkan catatan untuk perusahaan..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedJob(null)}>
                Batal
              </Button>
              <Button onClick={() => confirmApply("")}>
                Kirim Lamaran
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

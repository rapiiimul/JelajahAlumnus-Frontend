import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useApp } from "@/components/app-provider"
import { fetchEventsFromBackend } from "@/lib/api-client"
import { useRouter } from "next/navigation"
import { Search, CalendarDays, MapPin, Users } from "lucide-react"

export default function KegiatanPage() {
  const { session, registerEventToBackend } = useApp()
  const router = useRouter()
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredEvents, setFilteredEvents] = useState<any[]>([])
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [registering, setRegistering] = useState(false)

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const eventsData = await fetchEventsFromBackend()
        setEvents(eventsData)
        setFilteredEvents(eventsData)
      } catch (error) {
        console.error("Gagal memuat event:", error)
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [])

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredEvents(events)
    } else {
      const filtered = events.filter(event => 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredEvents(filtered)
    }
  }, [searchTerm, events])

  const handleRegister = async (event: any) => {
    if (!session) {
      router.push("/login")
      return
    }

    setSelectedEvent(event)
    setRegistering(true)
  }

  const confirmRegistration = async () => {
    if (selectedEvent) {
      try {
        await registerEventToBackend(selectedEvent.id)
        alert(`Pendaftaran untuk ${selectedEvent.title} berhasil!`)
        // Update event status to registered
        const updatedEvents = events.map(event => 
          event.id === selectedEvent.id 
            ? { ...event, registered: true } 
            : event
        )
        setEvents(updatedEvents)
        setFilteredEvents(updatedEvents)
      } catch (error) {
        alert("Gagal mendaftar. Silakan coba lagi.")
      } finally {
        setRegistering(false)
        setSelectedEvent(null)
      }
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Memuat data kegiatan...</div>
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Event & Pelatihan</h1>
          <p className="text-gray-600">
            Daftar event dan pelatihan yang tersedia untuk alumni SMK Nusantara
          </p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Cari event berdasarkan nama, kategori, atau lokasi..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="flex flex-col h-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <CardDescription>{event.category}</CardDescription>
                  </div>
                  <Badge variant={event.registered ? "default" : "secondary"}>
                    {event.registered ? "Terdaftar" : "Buka"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarDays className="w-4 h-4 mr-2" />
                    {event.date}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {event.location}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3">{event.description}</p>
                </div>
              </CardContent>
              <div className="mt-auto pt-4">
                <Button 
                  className="w-full" 
                  onClick={() => handleRegister(event)}
                  disabled={event.registered}
                >
                  {event.registered ? "Sudah Terdaftar" : "Daftar Sekarang"}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-10">
            <CalendarDays className="mx-auto w-12 h-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium">Tidak ada event</h3>
            <p className="mt-1 text-gray-500">
              {searchTerm 
                ? "Tidak ada event yang cocok dengan pencarian Anda."
                : "Belum ada event yang tersedia. Silakan cek lagi nanti."
              }
            </p>
          </div>
        )}
      </div>

      {/* Modal Register */}
      {registering && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Daftar Event: {selectedEvent.title}</h3>
            <p className="text-gray-600 mb-4">
              Anda akan mendaftar untuk event {selectedEvent.title} yang akan diselenggarakan pada {selectedEvent.date} di {selectedEvent.location}.
            </p>
            <p className="text-gray-600 mb-6">
              Pastikan Anda hadir pada waktu dan tempat yang telah ditentukan.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setRegistering(false); setSelectedEvent(null); }}>
                Batal
              </Button>
              <Button onClick={confirmRegistration}>
                Konfirmasi Pendaftaran
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

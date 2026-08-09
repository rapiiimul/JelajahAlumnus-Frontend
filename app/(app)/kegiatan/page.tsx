"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { CalendarDays, CalendarX2, Search, X } from "lucide-react"

import { EventCard } from "@/components/shared/event-card"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { ParticipationStatusBadge } from "@/components/shared/badges"
import { EmptyState, ErrorState, LoadingGrid, LoadingRows } from "@/components/shared/states"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/ui/pagination"
import { ApiError } from "@/lib/api/client"
import { fetchEvents, fetchMyEvents, registerEvent } from "@/lib/api/events"
import type { AppEvent, EventParticipation } from "@/lib/types"
import { formatDate } from "@/lib/utils"

export default function KegiatanPage() {
  const [events, setEvents] = useState<AppEvent[]>([])
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [perPage, setPerPage] = useState(10)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [reloadKey, setReloadKey] = useState(0)

  const [myEvents, setMyEvents] = useState<EventParticipation[]>([])
  const [myEventsLoaded, setMyEventsLoaded] = useState(false)

  const [pendingEvent, setPendingEvent] = useState<AppEvent | null>(null)
  const [registering, setRegistering] = useState(false)
  const [registerError, setRegisterError] = useState("")

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true)
    setError("")
    try {
      const result = await fetchEvents({ page, signal })
      setEvents(result.items)
      setTotal(result.meta.total)
      setLastPage(result.meta.last_page)
      setPerPage(result.meta.per_page)
    } catch (caught) {
      if (signal?.aborted) return
      setError(caught instanceof ApiError ? caught.message : "Gagal memuat kegiatan.")
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [page])

  useEffect(() => {
    const controller = new AbortController()
    void load(controller.signal)
    return () => controller.abort()
  }, [load, reloadKey])

  const loadMyEvents = useCallback(async () => {
    try {
      const result = await fetchMyEvents(1)
      setMyEvents(result.items)
    } catch {
      setMyEvents([])
    } finally {
      setMyEventsLoaded(true)
    }
  }, [])

  useEffect(() => {
    void loadMyEvents()
  }, [loadMyEvents, reloadKey])

  const handleRegister = async () => {
    if (!pendingEvent || registering) return

    setRegistering(true)
    setRegisterError("")
    try {
      await registerEvent(pendingEvent.id)
      setEvents((prev) => prev.map((event) => (event.id === pendingEvent.id ? { ...event, is_registered: true } : event)))
      void loadMyEvents()
      setPendingEvent(null)
    } catch (caught) {
      setRegisterError(caught instanceof ApiError ? caught.message : "Gagal mendaftar kegiatan.")
    } finally {
      setRegistering(false)
    }
  }

  const filteredEvents = search.trim()
    ? events.filter((event) => {
        const keyword = search.trim().toLowerCase()
        return (
          event.title.toLowerCase().includes(keyword) ||
          event.description.toLowerCase().includes(keyword) ||
          event.location_details?.toLowerCase().includes(keyword)
        )
      })
    : events

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-6">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            className="pl-9 pr-9"
            placeholder="Cari kegiatan berdasarkan nama, deskripsi, atau lokasi..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Cari kegiatan"
          />
          {search && (
            <button
              type="button"
              className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
              onClick={() => setSearch("")}
              aria-label="Bersihkan pencarian"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {loading ? (
          <LoadingGrid count={6} />
        ) : error ? (
          <ErrorState message={error} onRetry={() => setReloadKey((key) => key + 1)} />
        ) : filteredEvents.length === 0 ? (
          <EmptyState
            icon={CalendarX2}
            title={search.trim() ? "Kegiatan tidak ditemukan" : "Belum ada kegiatan"}
            description={
              search.trim()
                ? "Tidak ada kegiatan yang cocok dengan pencarianmu."
                : "Belum ada kegiatan yang dipublikasikan. Silakan cek lagi nanti."
            }
          />
        ) : (
          <>
            <p className="text-sm text-muted-foreground" aria-live="polite">
              Menampilkan {filteredEvents.length} dari {total} kegiatan
              {search.trim() && (
                <>
                  {" "}
                  untuk kata kunci <span className="font-medium text-foreground">“{search.trim()}”</span>
                </>
              )}
            </p>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} onRegister={setPendingEvent} />
              ))}
            </div>
            <Pagination
              meta={{ current_page: page, last_page: lastPage, per_page: perPage, total }}
              onPageChange={setPage}
            />
          </>
        )}
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold">Kegiatan yang diikuti</h2>
          <p className="text-sm text-muted-foreground">Rekap acara yang pernah kamu daftar.</p>
        </div>

        {!myEventsLoaded ? (
          <LoadingRows count={2} />
        ) : myEvents.length === 0 ? (
          <Card>
            <EmptyState
              icon={CalendarDays}
              title="Belum ada kegiatan diikuti"
              description="Daftar pada kegiatan di atas dan pantau kehadiranmu di sini."
            />
          </Card>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {myEvents.map((participation) => (
              <li key={participation.id}>
                <Card>
                  <CardContent className="flex items-center gap-4 p-4">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <CalendarDays className="size-5" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/kegiatan/${participation.event.id}`}
                        className="block truncate font-semibold hover:underline"
                      >
                        {participation.event.title}
                      </Link>
                      <p className="truncate text-xs text-muted-foreground">
                        {formatDate(participation.event.start_date)} · Didaftarkan{" "}
                        {formatDate(participation.registered_at)}
                      </p>
                    </div>
                    <ParticipationStatusBadge status={participation.status} />
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ConfirmDialog
        open={Boolean(pendingEvent)}
        onOpenChange={(open) => {
          if (!open) setPendingEvent(null)
        }}
        title={`Daftar ${pendingEvent?.title ?? "kegiatan"}?`}
        description={
          pendingEvent ? (
            <>
              Kamu akan mendaftar sebagai peserta kegiatan yang diselenggarakan pada{" "}
              <span className="font-medium text-foreground">{formatDate(pendingEvent.start_date)}</span>. Pastikan kamu
              dapat hadir pada waktu yang ditentukan.
            </>
          ) : undefined
        }
        confirmLabel="Konfirmasi Pendaftaran"
        loading={registering}
        error={registerError}
        onConfirm={handleRegister}
      />
    </div>
  )
}

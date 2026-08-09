"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { ArrowLeft, CalendarDays, CheckCircle2, Clock3, MapPin, Presentation, UserRound } from "lucide-react"

import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { EventTypeBadge, LocationTypeBadge } from "@/components/shared/badges"
import { ErrorState } from "@/components/shared/states"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ApiError } from "@/lib/api/client"
import { fetchEvent, registerEvent } from "@/lib/api/events"
import type { AppEvent } from "@/lib/types"
import { formatDateTime } from "@/lib/utils"

export default function KegiatanDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const eventId = params.id

  const [event, setEvent] = useState<AppEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [reloadKey, setReloadKey] = useState(0)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [registering, setRegistering] = useState(false)
  const [registerError, setRegisterError] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      setEvent(await fetchEvent(eventId))
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Gagal memuat detail kegiatan.")
    } finally {
      setLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    void load()
  }, [load, reloadKey])

  const handleRegister = async () => {
    if (!event || registering) return
    setRegistering(true)
    setRegisterError("")
    try {
      await registerEvent(event.id)
      setEvent({ ...event, is_registered: true })
      setConfirmOpen(false)
    } catch (caught) {
      setRegisterError(caught instanceof ApiError ? caught.message : "Gagal mendaftar kegiatan.")
    } finally {
      setRegistering(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-56 rounded-xl" />
        <div className="grid gap-6 xl:grid-cols-[1.6fr_0.8fr]">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-56 rounded-xl" />
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="flex flex-col gap-6">
        <Button variant="ghost" className="w-fit" onClick={() => router.back()}>
          <ArrowLeft data-icon="inline-start" />
          Kembali
        </Button>
        <Card>
          <ErrorState message={error || "Kegiatan tidak ditemukan."} onRetry={() => setReloadKey((key) => key + 1)} />
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Button variant="ghost" className="w-fit" render={<Link href="/kegiatan" />}>
        <ArrowLeft data-icon="inline-start" />
        Kembali ke kegiatan
      </Button>

      <div className="relative overflow-hidden rounded-xl">
        {event.banner_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.banner_url} alt="" className="h-64 w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-56 items-center justify-center bg-primary/10 text-primary">
            <Presentation className="size-14" aria-hidden />
          </div>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_0.8fr]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap gap-2">
                <EventTypeBadge type={event.event_type} />
                <LocationTypeBadge type={event.location_type} />
                {event.is_registered && (
                  <Badge variant="secondary">
                    <CheckCircle2 data-icon="inline-start" />
                    Terdaftar
                  </Badge>
                )}
              </div>
              <CardTitle className="mt-3 text-2xl">{event.title}</CardTitle>
              <CardDescription>{event.posted_by}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 border-t pt-5 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="size-4 text-primary" aria-hidden />
                Mulai {formatDateTime(event.start_date)}
              </span>
              {event.end_date && (
                <span className="inline-flex items-center gap-2">
                  <Clock3 className="size-4 text-primary" aria-hidden />
                  Selesai {formatDateTime(event.end_date)}
                </span>
              )}
              {event.location_details && (
                <span className="inline-flex items-center gap-2">
                  <MapPin className="size-4 text-primary" aria-hidden />
                  {event.location_details}
                </span>
              )}
              <span className="inline-flex items-center gap-2">
                <UserRound className="size-4 text-primary" aria-hidden />
                Diselenggarakan oleh {event.posted_by ?? "BKK"}
              </span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Deskripsi kegiatan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{event.description}</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card className="h-fit lg:sticky lg:top-24">
            <CardHeader>
              <CardTitle>Ikut serta?</CardTitle>
              <CardDescription>
                {event.is_registered
                  ? "Kamu sudah terdaftar sebagai peserta kegiatan ini."
                  : "Pendaftaran peserta kegiatan ini gratis dan terbuka untuk alumni."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                size="lg"
                variant={event.is_registered ? "secondary" : "default"}
                disabled={event.is_registered}
                onClick={() => setConfirmOpen(true)}
              >
                {event.is_registered ? "Sudah Terdaftar" : "Daftar Sekarang"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Daftar ${event.title}?`}
        description={
          <>
            Kamu akan mendaftar sebagai peserta kegiatan yang diselenggarakan pada{" "}
            <span className="font-medium text-foreground">{formatDateTime(event.start_date)}</span>. Pastikan kamu dapat
            hadir pada waktu yang ditentukan.
          </>
        }
        confirmLabel="Konfirmasi Pendaftaran"
        loading={registering}
        error={registerError}
        onConfirm={handleRegister}
      />
    </div>
  )
}

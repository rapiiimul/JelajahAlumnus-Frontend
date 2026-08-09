"use client"

import Link from "next/link"
import { CalendarDays, Clock3, MapPin, Presentation } from "lucide-react"

import { EventTypeBadge, LocationTypeBadge } from "@/components/shared/badges"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDateTime } from "@/lib/utils"
import type { AppEvent } from "@/lib/types"

interface EventCardProps {
  event: AppEvent
  onRegister: (event: AppEvent) => void
}

export function EventCard({ event, onRegister }: EventCardProps) {
  const registered = event.is_registered

  return (
    <Card className="flex h-full flex-col">
      <div className="relative h-36 overflow-hidden">
        {event.banner_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.banner_url} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full items-center justify-center bg-primary/10 text-primary">
            <Presentation className="size-10" aria-hidden />
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <EventTypeBadge type={event.event_type} />
          <LocationTypeBadge type={event.location_type} />
        </div>
      </div>
      <CardHeader>
        <CardTitle className="leading-snug">
          <Link href={`/kegiatan/${event.id}`} className="hover:underline">
            {event.title}
          </Link>
        </CardTitle>
        <CardDescription>{event.posted_by}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2 text-sm text-muted-foreground">
        <p className="line-clamp-3 text-sm leading-relaxed">{event.description}</p>
        <div className="mt-auto flex flex-col gap-1.5 pt-3 text-xs">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5" aria-hidden />
            {formatDateTime(event.start_date)}
            {event.end_date ? ` — ${formatDateTime(event.end_date)}` : ""}
          </span>
          {event.location_details && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5" aria-hidden />
              {event.location_details}
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex w-full gap-2">
          <Button variant="outline" className="flex-1" render={<Link href={`/kegiatan/${event.id}`} />}>
            Detail
          </Button>
          <Button className="flex-1" variant={registered ? "secondary" : "default"} disabled={registered} onClick={() => onRegister(event)}>
            {registered ? (
              <>
                <Clock3 data-icon="inline-start" />
                Terdaftar
              </>
            ) : (
              "Daftar Sekarang"
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

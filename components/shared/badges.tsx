import { Badge } from "@/components/ui/badge"
import {
  APPLICATION_STATUS_LABELS,
  EVENT_TYPE_LABELS,
  LOCATION_TYPE_LABELS,
  PARTICIPATION_STATUS_LABELS,
  TRACER_STATUS_LABELS,
} from "@/lib/labels"
import type { ApplicationStatus, EventType, LocationType, ParticipationStatus, TracerStatus } from "@/lib/types"

export function TracerStatusBadge({ status }: { status: TracerStatus }) {
  return (
    <Badge variant={status === "bekerja" ? "default" : status === "kuliah" ? "secondary" : "outline"}>
      {TRACER_STATUS_LABELS[status]}
    </Badge>
  )
}

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  const variant =
    status === "accepted" ? "default" : status === "rejected" ? "destructive" : status === "reviewed" ? "secondary" : "outline"
  return <Badge variant={variant}>{APPLICATION_STATUS_LABELS[status]}</Badge>
}

export function ParticipationStatusBadge({ status }: { status: ParticipationStatus }) {
  const variant = status === "attended" ? "default" : status === "cancelled" ? "destructive" : "secondary"
  return <Badge variant={variant}>{PARTICIPATION_STATUS_LABELS[status]}</Badge>
}

export function EventTypeBadge({ type }: { type: EventType }) {
  return <Badge variant="outline">{EVENT_TYPE_LABELS[type]}</Badge>
}

export function LocationTypeBadge({ type }: { type: LocationType }) {
  return <Badge variant="secondary">{LOCATION_TYPE_LABELS[type]}</Badge>
}

export function isLinearLabel(isLinear: boolean | undefined): string {
  if (isLinear === undefined) return "—"
  return isLinear ? "Linear (sesuai jurusan)" : "Tidak linear"
}

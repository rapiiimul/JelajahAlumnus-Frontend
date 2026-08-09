import { getData, toPaginated } from "@/lib/api/client"
import type { AppEvent, EventParticipation, Paginated } from "@/lib/types"

const BASE = "/api/v1/events"

export interface FetchEventsParams {
  page?: number
  signal?: AbortSignal
}

export async function fetchEvents(params: FetchEventsParams = {}): Promise<Paginated<AppEvent>> {
  const suffix = params.page ? `?page=${params.page}` : ""
  const response = await getData<AppEvent[] | { data: AppEvent[]; meta?: unknown }>(`${BASE}${suffix}`, {
    signal: params.signal,
  })
  return toPaginated<AppEvent>(response, (response as { meta?: Record<string, number> }).meta)
}

export function fetchEvent(id: number | string): Promise<AppEvent> {
  return getData<AppEvent>(`${BASE}/${id}`)
}

export function registerEvent(id: number | string): Promise<{ event_id: number; status: string }> {
  return getData<{ event_id: number; status: string }>(`${BASE}/${id}/register`, { method: "POST", body: {} })
}

export async function fetchMyEvents(page = 1): Promise<Paginated<EventParticipation>> {
  const response = await getData<EventParticipation[] | { data: EventParticipation[]; meta?: unknown }>(
    `${BASE}/my-events?page=${page}`
  )
  return toPaginated<EventParticipation>(response, (response as { meta?: Record<string, number> }).meta)
}

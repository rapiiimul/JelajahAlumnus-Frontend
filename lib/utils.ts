import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const DATE_ONLY = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" })
const DATETIME = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

/** `2026-07-31` atau `2026-07-31 14:30:00` → `31 Jul 2026` */
export function formatDate(value: string | null | undefined): string {
  if (!value) return "—"
  const date = new Date(value.includes("T") ? value : value.replace(" ", "T"))
  if (Number.isNaN(date.getTime())) return value
  return DATE_ONLY.format(date)
}

/** `2026-07-31 14:30:00` → `31 Jul 2026, 14.30` */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—"
  const date = new Date(value.includes("T") ? value : value.replace(" ", "T"))
  if (Number.isNaN(date.getTime())) return value
  return DATETIME.format(date)
}

/** Konversi `YYYY-MM-DD` menjadi format `YYYY-MM-DD` siap input `<input type="date">`. */
export function toDateInputValue(value: string | null | undefined): string {
  if (!value) return ""
  const date = new Date(value.includes("T") ? value : value.replace(" ", "T"))
  if (Number.isNaN(date.getTime())) return ""
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function initials(name: string | null | undefined): string {
  if (!name) return "?"
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

export function pluralize(value: number, singular: string, plural: string): string {
  return value === 1 ? singular : plural
}

"use client"

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ApiMeta } from "@/lib/types"

function pageItems(current: number, last: number): (number | "…")[] {
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1)

  const items: (number | "…")[] = [1]
  if (current > 3) items.push("…")

  for (let page = Math.max(2, current - 1); page <= Math.min(last - 1, current + 1); page++) {
    items.push(page)
  }
  if (current < last - 2) items.push("…")
  items.push(last)
  return items
}

interface PaginationProps {
  meta: ApiMeta
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({ meta, onPageChange, className }: PaginationProps) {
  const { current_page: current, last_page: last, total } = meta

  if (last <= 1) return null

  const pages = pageItems(current, last)

  return (
    <nav aria-label="Navigasi halaman" className={cn("flex flex-col items-center gap-3", className)}>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          disabled={current <= 1}
          onClick={() => onPageChange(current - 1)}
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeftIcon />
        </Button>

        {pages.map((page, index) =>
          page === "…" ? (
            <span key={`ellipsis-${index}`} className="px-1.5 text-sm text-muted-foreground" aria-hidden>
              …
            </span>
          ) : (
            <Button
              key={page}
              variant={page === current ? "default" : "outline"}
              size="icon-sm"
              aria-current={page === current ? "page" : undefined}
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          )
        )}

        <Button
          variant="outline"
          size="icon-sm"
          disabled={current >= last}
          onClick={() => onPageChange(current + 1)}
          aria-label="Halaman berikutnya"
        >
          <ChevronRightIcon />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Halaman {current} dari {last} · {total} data
      </p>
    </nav>
  )
}

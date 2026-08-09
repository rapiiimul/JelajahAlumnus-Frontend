"use client"

import { useId } from "react"
import { FileText, UploadCloud, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FileInputProps {
  label: string
  hint?: string
  accept?: string
  maxSizeMb?: number
  error?: string
  fileName?: string
  disabled?: boolean
  onChange: (file: File | null) => void
}

export function FileInput({
  label,
  hint,
  accept,
  maxSizeMb,
  error,
  fileName,
  disabled = false,
  onChange,
}: FileInputProps) {
  const id = useId()

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="flex w-fit items-center gap-1.5 text-sm font-medium select-none">
        {label}
      </label>
      <div
        className={cn(
          "flex flex-col gap-3 rounded-lg border border-dashed px-3 py-3 sm:flex-row sm:items-center",
          error ? "border-destructive/50 bg-destructive/5" : "border-input bg-muted/30"
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2.5 text-sm">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileText className="size-4" aria-hidden />
          </span>
          <span className="min-w-0">
            {fileName ? (
              <span className="block truncate font-medium">{fileName}</span>
            ) : (
              <span className="block text-muted-foreground">Belum ada file dipilih</span>
            )}
            {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            type="button"
            disabled={disabled}
            onClick={() => document.getElementById(id)?.click()}
          >
            <UploadCloud data-icon="inline-start" />
            {fileName ? "Ganti" : "Pilih file"}
          </Button>
          {fileName && (
            <Button
              variant="ghost"
              size="icon-sm"
              type="button"
              disabled={disabled}
              aria-label="Hapus file"
              onClick={() => onChange(null)}
            >
              <X />
            </Button>
          )}
        </div>
      </div>
      <input
        id={id}
        type="file"
        accept={accept}
        disabled={disabled}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0] ?? null
          if (file && maxSizeMb && file.size > maxSizeMb * 1024 * 1024) {
            event.target.value = ""
            return
          }
          onChange(file)
        }}
      />
      {error && (
        <p role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { Loader2, Send } from "lucide-react"

import { FileInput } from "@/components/shared/file-input"
import { FieldError, FormAlert } from "@/components/shared/states"
import { ApiError } from "@/lib/api/client"
import { applyJob } from "@/lib/api/jobs"
import type { Job } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface ApplyJobDialogProps {
  job: Job | null
  onOpenChange: (open: boolean) => void
  onSuccess: (job: Job) => void
}

function firstError(errors: Record<string, string[]>, field: string): string | undefined {
  return errors[field]?.[0]
}

export function ApplyJobDialog({ job, onOpenChange, onSuccess }: ApplyJobDialogProps) {
  const [cv, setCv] = useState<File | null>(null)
  const [coverLetter, setCoverLetter] = useState("")
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (job) {
      setCv(null)
      setCoverLetter("")
      setError("")
      setFieldErrors({})
    }
  }, [job])

  if (!job) return null

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (isSubmitting) return

    if (!cv) {
      setFieldErrors({ cv: ["Pilih file CV Anda untuk melamar."] })
      return
    }

    setError("")
    setFieldErrors({})
    setIsSubmitting(true)
    try {
      await applyJob(job.id, { cv, cover_letter: coverLetter.trim() || undefined })
      onSuccess(job)
      onOpenChange(false)
    } catch (caught) {
      if (caught instanceof ApiError && caught.errors) {
        setFieldErrors(caught.errors)
      }
      setError(caught instanceof ApiError ? caught.message : "Gagal mengirim lamaran. Silakan coba lagi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={Boolean(job)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>Lamar {job.title}</DialogTitle>
            <DialogDescription>
              Kirim Curriculum Vitae (CV) dan cover letter ke {job.company_name}.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <FileInput
                label="Curriculum Vitae (CV)"
                hint="Format PDF, DOC, atau DOCX · maksimal 5 MB"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                maxSizeMb={5}
                fileName={cv?.name}
                error={firstError(fieldErrors, "cv")}
                onChange={(file) => {
                  setCv(file)
                  setFieldErrors((prev) => {
                    if (!prev.cv) return prev
                    const next = { ...prev }
                    delete next.cv
                    return next
                  })
                }}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="cover_letter">Cover letter</Label>
              <Textarea
                id="cover_letter"
                rows={5}
                placeholder="Ceritakan mengapa Anda cocok untuk posisi ini..."
                value={coverLetter}
                onChange={(event) => setCoverLetter(event.target.value)}
                aria-invalid={Boolean(fieldErrors.cover_letter)}
              />
              <FieldError message={firstError(fieldErrors, "cover_letter")} />
            </div>

            {error && <FormAlert>{error}</FormAlert>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" data-icon="inline-start" />}
              {isSubmitting ? "Mengirim lamaran..." : "Kirim lamaran"}
              {!isSubmitting && <Send data-icon="inline-end" />}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

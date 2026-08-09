"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  GraduationCap,
  Loader2,
  Pencil,
  Send,
} from "lucide-react"

import { TracerStatusBadge } from "@/components/shared/badges"
import { FieldError, FormAlert } from "@/components/shared/states"
import { ApiError } from "@/lib/api/client"
import { fetchTracerOptions } from "@/lib/api/master"
import { fetchSubmission, submitSubmission, type TracerSubmissionInput } from "@/lib/api/tracer"
import { FIELD_LABELS, TRACER_STATUS_LABELS } from "@/lib/labels"
import type { Option, TracerOptions, TracerStatus, TracerSubmission } from "@/lib/types"
import { formatDate, toDateInputValue } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type FieldKind = "select" | "text" | "number" | "date" | "boolean"

interface FieldConfig {
  key: string
  kind: FieldKind
  placeholder?: string
  hint?: string
}

const FIELD_CONFIGS: Record<TracerStatus, FieldConfig[]> = {
  bekerja: [
    { key: "location_scale", kind: "select" },
    { key: "location_country", kind: "select" },
    { key: "field_of_work", kind: "text" },
    { key: "salary_range", kind: "select" },
    { key: "company_name", kind: "text", placeholder: "Contoh: PT Nusantara Digital" },
    { key: "position", kind: "text", placeholder: "Contoh: Junior Developer" },
    { key: "start_date", kind: "date" },
    { key: "is_linear", kind: "boolean" },
  ],
  kuliah: [
    { key: "university_name", kind: "text", placeholder: "Contoh: Telkom University" },
    { key: "enrollment_date", kind: "date" },
    { key: "is_linear", kind: "boolean" },
  ],
  wirausaha: [
    { key: "ownership_type", kind: "select" },
    { key: "employee_count", kind: "number", placeholder: "Contoh: 5" },
    { key: "monthly_omset_range", kind: "select" },
    { key: "business_type", kind: "text", placeholder: "Contoh: F&B (Kafe)" },
  ],
}

const STATUS_META: Record<TracerStatus, { label: string; icon: typeof BriefcaseBusiness; description: string }> = {
  bekerja: { label: "Bekerja", icon: BriefcaseBusiness, description: "Bekerja di perusahaan atau instansi" },
  kuliah: { label: "Melanjutkan / Kuliah", icon: GraduationCap, description: "Melanjutkan pendidikan ke perguruan tinggi" },
  wirausaha: { label: "Wirausaha", icon: Building2, description: "Memiliki atau menjalankan usaha sendiri" },
}

function optionLabel(options: Option[] | undefined, value: string | boolean): string {
  return options?.find((option) => String(option.value) === String(value))?.label ?? String(value)
}

function submissionToValues(submission: TracerSubmission): Record<string, string> {
  const values: Record<string, string> = { status: submission.status }
  const detail = submissionDetailSafe(submission)
  if (!detail) return values

  for (const [key, value] of Object.entries(detail)) {
    if (key.startsWith("id") || key.includes("_at") || key === "tracer_submission_id") continue
    if (key === "is_linear") {
      values[key] = String(Boolean(value))
    } else if (key === "enrollment_date" || key === "start_date") {
      values[key] = toDateInputValue(String(value))
    } else {
      values[key] = String(value ?? "")
    }
  }
  return values
}

function submissionDetailSafe(submission: TracerSubmission): Record<string, unknown> | undefined {
  const record = submission as unknown as Record<string, unknown>
  const detail =
    record.detail_kerja ??
    record.detail_bekerja ??
    (submission.status === "kuliah"
      ? record.detail_kuliah
      : submission.status === "wirausaha"
        ? record.detail_wirausaha
        : undefined)
  if (!detail || typeof detail !== "object") return undefined
  return detail as Record<string, unknown>
}

export default function TracerStudyPage() {
  const [options, setOptions] = useState<TracerOptions | null>(null)
  const [submission, setSubmission] = useState<TracerSubmission | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [reloadKey, setReloadKey] = useState(0)

  const [status, setStatus] = useState<TracerStatus>("bekerja")
  const [values, setValues] = useState<Record<string, string>>({})
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [submitError, setSubmitError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    setLoadError("")
    void Promise.all([fetchTracerOptions(), fetchSubmission()])
      .then(([optionData, submissionData]) => {
        if (!active) return
        setOptions(optionData)
        setSubmission(submissionData)
        if (submissionData) {
          const initialValues = submissionToValues(submissionData)
          setValues(initialValues)
          setStatus(submissionData.status)
        }
      })
      .catch((caught) => {
        if (!active) return
        setLoadError(caught instanceof ApiError ? caught.message : "Gagal memuat data tracer study.")
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [reloadKey])

  const formOptions = useMemo(() => options?.forms?.[status] ?? {}, [options, status])

  const setValue = useCallback((key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    setFieldErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }, [])

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <Skeleton className="mb-6 h-10 w-64" />
        <div className="grid gap-3 sm:grid-cols-3">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <Skeleton className="mt-6 h-96 rounded-xl" />
      </div>
    )
  }

  if (loadError) {
    return (
      <Card>
        <div className="flex flex-col items-center gap-4 px-6 py-14 text-center">
          <p className="text-sm text-muted-foreground">{loadError}</p>
          <Button variant="outline" onClick={() => setReloadKey((key) => key + 1)}>
            Coba lagi
          </Button>
        </div>
      </Card>
    )
  }

  const buildPayload = (): TracerSubmissionInput | null => {
    const errors: Record<string, string[]> = {}
    const required = FIELD_CONFIGS[status].map((field) => field.key)
    const invalid: Record<string, string[]> = {}

    for (const field of required) {
      const value = values[field]
      const isEmpty = value === undefined || value === "" || value === null
      if (isEmpty) {
        invalid[field] = [`${FIELD_LABELS[field] ?? field} wajib diisi.`]
      }
      if (field === "employee_count" && !isEmpty && (Number(value) < 0 || !Number.isFinite(Number(value)))) {
        invalid[field] = ["Jumlah karyawan harus berupa angka yang valid."]
      }
    }

    if (Object.keys(invalid).length > 0) {
      setFieldErrors(invalid)
      return null
    }
    setFieldErrors(errors)

    if (status === "bekerja") {
      return {
        status: "bekerja",
        location_scale: values.location_scale,
        location_country: values.location_country,
        field_of_work: values.field_of_work.trim(),
        salary_range: values.salary_range,
        company_name: values.company_name.trim(),
        position: values.position.trim(),
        start_date: values.start_date,
        is_linear: values.is_linear === "true",
      }
    }
    if (status === "kuliah") {
      return {
        status: "kuliah",
        university_name: values.university_name.trim(),
        enrollment_date: values.enrollment_date,
        is_linear: values.is_linear === "true",
      }
    }
    return {
      status: "wirausaha",
      ownership_type: values.ownership_type,
      employee_count: Number(values.employee_count),
      monthly_omset_range: values.monthly_omset_range,
      business_type: values.business_type.trim(),
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (isSubmitting) return

    setSubmitError("")
    const payload = buildPayload()
    if (!payload) return

    setIsSubmitting(true)
    try {
      const result = await submitSubmission(payload)
      setSubmission(result)
      setValues(submissionToValues(result))
      setDone(true)
    } catch (caught) {
      if (caught instanceof ApiError && caught.errors) {
        setFieldErrors(caught.errors)
      }
      setSubmitError(caught instanceof ApiError ? caught.message : "Gagal menyimpan data tracer study.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (done && submission) {
    return <TracerSuccess submission={submission} options={options} onEdit={() => setDone(false)} />
  }

  const statusOptions = options?.statuses ?? []
  const details = FIELD_CONFIGS[status].map((field) => {
    const optionList = field.kind === "select" || field.kind === "boolean" ? formOptions[field.key] : undefined
    return { ...field, options: optionList }
  })

  return (
    <div className="mx-auto w-full max-w-3xl">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Badge className="w-fit" variant="secondary">
                {submission ? "Data sudah pernah diisi" : "Form capaian alumni"}
              </Badge>
              {submission && (
                <p className="text-xs text-muted-foreground">
                  Terakhir diperbarui {formatDate(submission.submitted_at)}
                </p>
              )}
            </div>
            <CardTitle className="text-xl">Apa aktivitasmu setelah lulus?</CardTitle>
            <CardDescription>Informasi ini hanya digunakan untuk evaluasi dan pengembangan sekolah.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Status aktivitas setelah lulus">
              {statusOptions.map((option) => {
                const value = String(option.value) as TracerStatus
                const meta = STATUS_META[value]
                if (!meta) return null
                const Icon = meta.icon
                const active = status === value
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => {
                      setStatus(value)
                      setFieldErrors({})
                    }}
                    className={cn(
                      "flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors",
                      active
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "hover:bg-muted"
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-9 items-center justify-center rounded-lg",
                        active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      )}
                    >
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <span className="text-sm font-semibold">{meta.label}</span>
                    <span className="text-xs text-muted-foreground">{meta.description}</span>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Detail {TRACER_STATUS_LABELS[status]}
            </CardTitle>
            <CardDescription>Lengkapi semua kolom sesuai kondisimu saat ini.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {details.map((field) => {
              const errorMessage = fieldErrors[field.key]?.[0]
              const value = values[field.key] ?? ""
              const commonProps = {
                id: `field-${field.key}`,
                "aria-invalid": Boolean(errorMessage),
                required: true,
              }

              if (field.kind === "select") {
                return (
                  <div key={field.key} className="flex flex-col gap-2">
                    <Label htmlFor={`field-${field.key}`}>{FIELD_LABELS[field.key] ?? field.key}</Label>
                    <Select value={value} onValueChange={(next) => setValue(field.key, next ?? "")}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih salah satu" />
                      </SelectTrigger>
                      <SelectContent>
                        {(field.options ?? []).map((option) => (
                          <SelectItem key={String(option.value)} value={String(option.value)}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError message={errorMessage} />
                  </div>
                )
              }

              if (field.kind === "boolean") {
                return (
                  <div key={field.key} className="flex flex-col gap-2 sm:col-span-2">
                    <Label>{FIELD_LABELS[field.key] ?? field.key}</Label>
                    <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label={FIELD_LABELS[field.key]}>
                      {(field.options ?? []).map((option) => {
                        const optionValue = String(option.value)
                        const active = value === optionValue
                        return (
                          <button
                            key={optionValue}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            onClick={() => setValue(field.key, optionValue)}
                            className={cn(
                              "flex items-center gap-3 rounded-xl border p-3 text-left text-sm transition-colors",
                              active ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted"
                            )}
                          >
                            <span
                              className={cn(
                                "flex size-5 items-center justify-center rounded-full border",
                                active ? "border-primary bg-primary" : "border-input"
                              )}
                            >
                              {active && <span className="size-2 rounded-full bg-primary-foreground" />}
                            </span>
                            <span className="font-medium">{option.label}</span>
                          </button>
                        )
                      })}
                    </div>
                    <FieldError message={errorMessage} />
                  </div>
                )
              }

              return (
                <div key={field.key} className="flex flex-col gap-2">
                  <Label htmlFor={`field-${field.key}`}>{FIELD_LABELS[field.key] ?? field.key}</Label>
                  {field.kind === "number" ? (
                    <Input
                      {...commonProps}
                      type="number"
                      min={0}
                      step={1}
                      inputMode="numeric"
                      placeholder={field.placeholder}
                      value={value}
                      onChange={(event) => setValue(field.key, event.target.value)}
                    />
                  ) : (
                    <Input
                      {...commonProps}
                      type={field.kind === "date" ? "date" : "text"}
                      placeholder={field.placeholder}
                      value={value}
                      onChange={(event) => setValue(field.key, event.target.value)}
                    />
                  )}
                  <FieldError message={errorMessage} />
                </div>
              )
            })}
          </CardContent>
        </Card>

        {submitError && <FormAlert>{submitError}</FormAlert>}

        <div className="flex justify-end">
          <Button size="lg" type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" data-icon="inline-start" />}
            {isSubmitting ? "Menyimpan..." : submission ? "Perbarui data" : "Kirim tracer study"}
            {!isSubmitting && <Send data-icon="inline-end" />}
          </Button>
        </div>
      </form>
    </div>
  )
}

function TracerSuccess({
  submission,
  options,
  onEdit,
}: {
  submission: TracerSubmission
  options: TracerOptions | null
  onEdit: () => void
}) {
  const detail = submissionDetailSafe(submission)
  const fieldOptions = options?.forms?.[submission.status] ?? {}
  const rows = detail
    ? Object.entries(detail).filter(
        ([key]) => !key.startsWith("id") && key !== "tracer_submission_id" && !key.includes("_at")
      )
    : []

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardContent className="flex flex-col items-center p-8 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <CheckCircle2 className="size-8" aria-hidden />
        </span>
        <h2 className="mt-5 text-2xl font-bold">Tracer study berhasil dikirim</h2>
        <p className="mt-2 text-muted-foreground">
          Terima kasih. Data capaianmu telah tersimpan dan dapat diperbarui kapan saja.
        </p>

        <div className="mt-6 w-full rounded-xl border p-4 text-left">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold">Ringkasan data</span>
            <TracerStatusBadge status={submission.status} />
          </div>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            {rows.map(([key, value]) => (
              <div key={key} className="rounded-lg bg-muted/60 px-3 py-2">
                <dt className="text-xs text-muted-foreground">{FIELD_LABELS[key] ?? key}</dt>
                <dd className="mt-0.5 font-medium">
                  {key === "is_linear"
                    ? String(value) === "1" || String(value) === "true"
                      ? "Ya, sesuai jurusan"
                      : "Tidak sesuai"
                    : key === "employee_count"
                      ? `${value} orang`
                      : optionLabel(fieldOptions[key], String(value))}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <Button className="mt-6" variant="outline" onClick={onEdit}>
          <Pencil data-icon="inline-start" />
          Perbarui jawaban
        </Button>
      </CardContent>
    </Card>
  )
}

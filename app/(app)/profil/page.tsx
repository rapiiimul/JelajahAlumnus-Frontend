"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  BriefcaseBusiness,
  CheckCircle2,
  ExternalLink,
  FileText,
  GraduationCap,
  Link2,
  Loader2,
  Mail,
  Pencil,
  Phone,
  Plus,
  Save,
  Trash2,
  UserRound,
  X,
} from "lucide-react"

import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { FileInput } from "@/components/shared/file-input"
import { EmptyState, ErrorState, FieldError, FormAlert, LoadingRows } from "@/components/shared/states"
import { ApiError } from "@/lib/api/client"
import { fetchMajors } from "@/lib/api/master"
import {
  createExperience,
  deleteExperience,
  fetchProfile,
  updateExperience,
  updateProfile,
} from "@/lib/api/profile"
import type { Experience, Major, Profile } from "@/lib/types"
import { cn, formatDate, initials, toDateInputValue } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface ProfileFormState {
  major_id: string
  graduation_year: string
  phone_number: string
  about_me: string
  skills: string[]
  linkedin_url: string
  portfolio_url: string
}

interface ExperienceFormState {
  company_name: string
  position: string
  start_date: string
  end_date: string
  is_current: boolean
  description: string
}

function emptyProfileForm(): ProfileFormState {
  return {
    major_id: "",
    graduation_year: "",
    phone_number: "",
    about_me: "",
    skills: [],
    linkedin_url: "",
    portfolio_url: "",
  }
}

function profileToForm(profile: Profile): ProfileFormState {
  return {
    major_id: String(profile.major?.id ?? ""),
    graduation_year: String(profile.graduation_year ?? ""),
    phone_number: profile.phone_number ?? "",
    about_me: profile.about_me ?? "",
    skills: profile.skills,
    linkedin_url: profile.linkedin_url ?? "",
    portfolio_url: profile.portfolio_url ?? "",
  }
}

function emptyExperienceForm(): ExperienceFormState {
  return {
    company_name: "",
    position: "",
    start_date: "",
    end_date: "",
    is_current: false,
    description: "",
  }
}

function experienceToForm(experience: Experience): ExperienceFormState {
  return {
    company_name: experience.company_name,
    position: experience.position,
    start_date: toDateInputValue(experience.start_date),
    end_date: toDateInputValue(experience.end_date),
    is_current: experience.is_current,
    description: experience.description ?? "",
  }
}

export default function ProfilPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [majors, setMajors] = useState<Major[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [reloadKey, setReloadKey] = useState(0)
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)

  const [form, setForm] = useState<ProfileFormState>(emptyProfileForm)
  const [skillInput, setSkillInput] = useState("")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({})
  const [formError, setFormError] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const [expOpen, setExpOpen] = useState(false)
  const [expEditing, setExpEditing] = useState<Experience | null>(null)
  const [expForm, setExpForm] = useState<ExperienceFormState>(emptyExperienceForm)
  const [expErrors, setExpErrors] = useState<Record<string, string[]>>({})
  const [expError, setExpError] = useState("")
  const [expSaving, setExpSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<Experience | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const [profileData, majorsData] = await Promise.all([fetchProfile(), fetchMajors()])
      if (signal?.aborted) return
      setProfile(profileData)
      setMajors(majorsData)
      setLoadError("")
    } catch (caught) {
      if (signal?.aborted) return
      setLoadError(caught instanceof ApiError ? caught.message : "Gagal memuat profil.")
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void load(controller.signal)
    return () => controller.abort()
  }, [load, reloadKey])

  const startEdit = () => {
    setForm(profile ? profileToForm(profile) : emptyProfileForm())
    setAvatarFile(null)
    setResumeFile(null)
    setFormErrors({})
    setFormError("")
    setSaved(false)
    setEditing(true)
  }

  const setField = (key: keyof ProfileFormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setFormErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const addSkill = () => {
    const skill = skillInput.trim()
    if (!skill) return
    setForm((prev) => {
      if (prev.skills.some((item) => item.toLowerCase() === skill.toLowerCase())) return prev
      return { ...prev, skills: [...prev.skills, skill] }
    })
    setSkillInput("")
  }

  const removeSkill = (skill: string) => {
    setForm((prev) => ({ ...prev, skills: prev.skills.filter((item) => item !== skill) }))
  }

  const handleSaveProfile = async (event: React.FormEvent) => {
    event.preventDefault()
    if (isSaving) return

    const errors: Record<string, string[]> = {}
    if (!form.major_id) errors.major_id = ["Pilih jurusanmu."]
    if (!form.graduation_year) errors.graduation_year = ["Pilih tahun lulus."]
    if (form.linkedin_url && !form.linkedin_url.startsWith("http")) {
      errors.linkedin_url = ["URL harus diawali http:// atau https://."]
    }
    if (form.portfolio_url && !form.portfolio_url.startsWith("http")) {
      errors.portfolio_url = ["URL harus diawali http:// atau https://."]
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }
    setFormErrors({})
    setFormError("")
    setIsSaving(true)

    try {
      const updated = await updateProfile({
        major_id: Number(form.major_id),
        graduation_year: Number(form.graduation_year),
        phone_number: form.phone_number.trim(),
        about_me: form.about_me.trim(),
        skills: form.skills,
        linkedin_url: form.linkedin_url.trim(),
        portfolio_url: form.portfolio_url.trim(),
        avatar: avatarFile,
        resume: resumeFile,
      })
      setProfile(updated)
      setEditing(false)
      setSaved(true)
      setAvatarFile(null)
      setResumeFile(null)
    } catch (caught) {
      if (caught instanceof ApiError && caught.errors) setFormErrors(caught.errors)
      setFormError(caught instanceof ApiError ? caught.message : "Gagal menyimpan profil.")
    } finally {
      setIsSaving(false)
    }
  }

  const openExpCreate = () => {
    setExpEditing(null)
    setExpForm(emptyExperienceForm())
    setExpErrors({})
    setExpError("")
    setExpOpen(true)
  }

  const openExpEdit = (experience: Experience) => {
    setExpEditing(experience)
    setExpForm(experienceToForm(experience))
    setExpErrors({})
    setExpError("")
    setExpOpen(true)
  }

  const setExpField = (key: keyof ExperienceFormState, value: string | boolean) => {
    setExpForm((prev) => ({ ...prev, [key]: value }))
    setExpErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const handleSaveExperience = async () => {
    if (expSaving) return

    const errors: Record<string, string[]> = {}
    if (!expForm.company_name.trim()) errors.company_name = ["Nama perusahaan wajib diisi."]
    if (!expForm.position.trim()) errors.position = ["Posisi wajib diisi."]
    if (!expForm.start_date) errors.start_date = ["Tanggal mulai wajib diisi."]
    if (!expForm.is_current && !expForm.end_date) errors.end_date = ["Wajib diisi jika sudah selesai."]
    if (expForm.end_date && expForm.start_date && expForm.end_date < expForm.start_date) {
      errors.end_date = ["Tanggal selesai tidak boleh sebelum tanggal mulai."]
    }
    if (Object.keys(errors).length > 0) {
      setExpErrors(errors)
      return
    }
    setExpErrors({})
    setExpError("")
    setExpSaving(true)

    try {
      const input = {
        company_name: expForm.company_name.trim(),
        position: expForm.position.trim(),
        description: expForm.description.trim() || undefined,
        start_date: expForm.start_date,
        end_date: expForm.is_current ? null : expForm.end_date,
        is_current: expForm.is_current,
      }
      if (expEditing) {
        await updateExperience(expEditing.id, input)
      } else {
        await createExperience(input)
      }
      setExpOpen(false)
      const profileData = await fetchProfile()
      setProfile(profileData)
    } catch (caught) {
      if (caught instanceof ApiError && caught.errors) setExpErrors(caught.errors)
      setExpError(caught instanceof ApiError ? caught.message : "Gagal menyimpan pengalaman kerja.")
    } finally {
      setExpSaving(false)
    }
  }

  const handleDeleteExperience = async () => {
    if (!deleteTarget || isDeleting) return
    setDeleteError("")
    setIsDeleting(true)
    try {
      await deleteExperience(deleteTarget.id)
      setDeleteTarget(null)
      const profileData = await fetchProfile()
      setProfile(profileData)
    } catch (caught) {
      setDeleteError(caught instanceof ApiError ? caught.message : "Gagal menghapus pengalaman kerja.")
    } finally {
      setIsDeleting(false)
    }
  }

  const avatarPreview = useMemo(() => {
    if (avatarFile) return URL.createObjectURL(avatarFile)
    return profile?.avatar_url ?? null
  }, [avatarFile, profile?.avatar_url])

  const graduationYears = useMemo(() => {
    const currentYear = new Date().getFullYear()
    return Array.from({ length: 41 }, (_, index) => currentYear - index)
  }, [])

  if (loading) {
    return <LoadingRows count={5} />
  }

  if (loadError) {
    return (
      <Card>
        <ErrorState message={loadError} onRetry={() => setReloadKey((key) => key + 1)} />
      </Card>
    )
  }

  if (editing) {
    return (
      <form onSubmit={handleSaveProfile} noValidate className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{profile ? "Edit profil" : "Lengkapi profil"}</CardTitle>
            <CardDescription>
              Data ini digunakan untuk mencocokkanmu dengan lowongan dan kegiatan yang relevan.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="flex flex-col items-center gap-2">
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarPreview}
                    alt="Pratinjau foto profil"
                    className="size-20 rounded-full border object-cover"
                  />
                ) : (
                  <span className="flex size-20 items-center justify-center rounded-full bg-muted text-xl font-bold text-muted-foreground">
                    {initials(profile?.user.name)}
                  </span>
                )}
                <span className="text-xs text-muted-foreground">Foto profil</span>
              </div>
              <div className="flex-1">
                <FileInput
                  label="Unggah foto profil"
                  hint="JPG atau PNG · maks 2 MB"
                  accept="image/jpeg,image/png,image/webp"
                  maxSizeMb={2}
                  fileName={avatarFile?.name}
                  onChange={setAvatarFile}
                />
                <FieldError message={formErrors.avatar?.[0]} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="profile-major">Jurusan / Konsentrasi Keahlian</Label>
                <Select value={form.major_id} onValueChange={(value) => setField("major_id", value ?? "")}>
                  <SelectTrigger id="profile-major" className="w-full">
                    <SelectValue placeholder="Pilih jurusan" />
                  </SelectTrigger>
                  <SelectContent>
                    {majors.map((major) => (
                      <SelectItem key={major.id} value={String(major.id)}>
                        {major.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError message={formErrors.major_id?.[0]} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="profile-graduation">Tahun lulus</Label>
                <Select
                  value={form.graduation_year}
                  onValueChange={(value) => setField("graduation_year", value ?? "")}
                >
                  <SelectTrigger id="profile-graduation" className="w-full">
                    <SelectValue placeholder="Pilih tahun" />
                  </SelectTrigger>
                  <SelectContent>
                    {graduationYears.map((year) => (
                      <SelectItem key={year} value={String(year)}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError message={formErrors.graduation_year?.[0]} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="profile-phone">Nomor WhatsApp</Label>
                <Input
                  id="profile-phone"
                  type="tel"
                  inputMode="tel"
                  placeholder="Contoh: 081234567890"
                  value={form.phone_number}
                  aria-invalid={Boolean(formErrors.phone_number)}
                  onChange={(event) => setField("phone_number", event.target.value)}
                />
                <FieldError message={formErrors.phone_number?.[0]} />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label htmlFor="profile-about">Tentang saya</Label>
                <Textarea
                  id="profile-about"
                  rows={4}
                  placeholder="Ceritakan singkat tentang dirimu, keahlian, dan tujuan kariermu."
                  value={form.about_me}
                  onChange={(event) => setField("about_me", event.target.value)}
                />
                <FieldError message={formErrors.about_me?.[0]} />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label>Keahlian</Label>
                <div className="flex flex-col gap-2">
                  {form.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2" aria-label="Daftar keahlian">
                      {form.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="gap-1 pr-1">
                          {skill}
                          <button
                            type="button"
                            aria-label={`Hapus keahlian ${skill}`}
                            className="flex size-4 items-center justify-center rounded-full text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
                            onClick={() => removeSkill(skill)}
                          >
                            <X className="size-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input
                      aria-label="Tambah keahlian"
                      placeholder="Contoh: UI/UX, Public Speaking"
                      value={skillInput}
                      onChange={(event) => setSkillInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault()
                          addSkill()
                        }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={addSkill}>
                      <Plus data-icon="inline-start" />
                      Tambah
                    </Button>
                  </div>
                </div>
                <FieldError message={formErrors.skills?.[0]} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="profile-linkedin">URL LinkedIn</Label>
                <Input
                  id="profile-linkedin"
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                  value={form.linkedin_url}
                  aria-invalid={Boolean(formErrors.linkedin_url)}
                  onChange={(event) => setField("linkedin_url", event.target.value)}
                />
                <FieldError message={formErrors.linkedin_url?.[0]} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="profile-portfolio">URL Portofolio</Label>
                <Input
                  id="profile-portfolio"
                  type="url"
                  placeholder="https://..."
                  value={form.portfolio_url}
                  aria-invalid={Boolean(formErrors.portfolio_url)}
                  onChange={(event) => setField("portfolio_url", event.target.value)}
                />
                <FieldError message={formErrors.portfolio_url?.[0]} />
              </div>
              <div className="sm:col-span-2">
                <FileInput
                  label="Curriculum Vitae (CV)"
                  hint="PDF, DOC, atau DOCX · maks 5 MB"
                  accept=".pdf,.doc,.docx"
                  maxSizeMb={5}
                  fileName={resumeFile?.name}
                  onChange={setResumeFile}
                />
                <FieldError message={formErrors.resume?.[0]} />
              </div>
            </div>

            {formError && <FormAlert>{formError}</FormAlert>}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="animate-spin" data-icon="inline-start" />}
                {isSaving ? "Menyimpan..." : "Simpan profil"}
                {!isSaving && <Save data-icon="inline-end" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    )
  }

  if (!profile) {
    return (
      <Card>
        <EmptyState
          icon={UserRound}
          title="Profil alumni belum dibuat"
          description="Lengkapi profilmu agar dapat melamar lowongan, mengikuti kegiatan, dan mengisi tracer study."
          action={
            <Button onClick={startEdit}>
              Lengkapi Profil <CheckCircle2 data-icon="inline-end" />
            </Button>
          }
        />
      </Card>
    )
  }

  const fullName = profile.user.name

  return (
    <div className="flex flex-col gap-6">
      {saved && (
        <FormAlert type="success" className="flex items-center gap-2">
          <CheckCircle2 className="size-4 shrink-0" aria-hidden />
          Profil berhasil diperbarui.
        </FormAlert>
      )}

      <Card>
        <CardContent className="flex flex-col gap-5 p-6 md:flex-row md:items-start">
          <div className="flex items-center gap-4 md:flex-col md:items-center md:text-center">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt={`Foto profil ${fullName}`}
                className="size-16 rounded-full border object-cover md:size-20"
              />
            ) : (
              <span className="flex size-16 items-center justify-center rounded-full bg-muted text-lg font-bold text-muted-foreground md:size-20 md:text-xl">
                {initials(fullName)}
              </span>
            )}
            <div className="text-left md:text-center">
              <p className="text-xs text-muted-foreground">Alumni Lacak.app</p>
              <p className="text-sm font-semibold">
                {profile.major ? profile.major.name : "Jurusan belum diisi"}
              </p>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-xl font-bold md:text-2xl">{fullName}</h2>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  {profile.user.nisn && <span className="flex items-center gap-1.5">NISN: {profile.user.nisn}</span>}
                  {profile.user.email && (
                    <span className="flex items-center gap-1.5">
                      <Mail className="size-3.5" aria-hidden />
                      {profile.user.email}
                    </span>
                  )}
                  {profile.phone_number && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="size-3.5" aria-hidden />
                      {profile.phone_number}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button variant="outline" onClick={startEdit}>
                  <Pencil data-icon="inline-start" />
                  Edit profil
                </Button>
                <Button render={<Link href="/tracer-study" />}>
                  Isi tracer study
                </Button>
              </div>
            </div>

            {profile.about_me && <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{profile.about_me}</p>}

            {profile.skills.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="size-4 text-primary" aria-hidden />
              Informasi akademik
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-lg bg-muted/60 px-3 py-2">
              <p className="text-xs text-muted-foreground">Jurusan</p>
              <p className="mt-0.5 font-medium">{profile.major?.name ?? "—"}</p>
            </div>
            <div className="rounded-lg bg-muted/60 px-3 py-2">
              <p className="text-xs text-muted-foreground">Tahun lulus</p>
              <p className="mt-0.5 font-medium">{profile.graduation_year ?? "—"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="size-4 text-primary" aria-hidden />
              Tautan & dokumen
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            {profile.linkedin_url && (
              <a
                href={profile.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-muted"
              >
                <Link2 className="size-4 text-primary" aria-hidden />
                <span className="min-w-0 flex-1 truncate">{profile.linkedin_url}</span>
                <ExternalLink className="size-3.5 text-muted-foreground" aria-hidden />
              </a>
            )}
            {profile.portfolio_url && (
              <a
                href={profile.portfolio_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-muted"
              >
                <FileText className="size-4 text-primary" aria-hidden />
                <span className="min-w-0 flex-1 truncate">Portofolio</span>
                <ExternalLink className="size-3.5 text-muted-foreground" aria-hidden />
              </a>
            )}
            {profile.resume_url && (
              <a
                href={profile.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-muted"
              >
                <FileText className="size-4 text-primary" aria-hidden />
                <span className="min-w-0 flex-1 truncate">Curriculum Vitae (CV)</span>
                <ExternalLink className="size-3.5 text-muted-foreground" aria-hidden />
              </a>
            )}
            {!profile.linkedin_url && !profile.portfolio_url && !profile.resume_url && (
              <p className="px-3 py-2 text-muted-foreground">Belum ada tautan atau dokumen yang dibagikan.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BriefcaseBusiness className="size-4 text-primary" aria-hidden />
              Pengalaman kerja
            </CardTitle>
            <CardDescription>Riwayat pekerjaan yang pernah atau sedang kamu jalani</CardDescription>
          </div>
          <Button onClick={openExpCreate}>
            <Plus data-icon="inline-start" />
            Tambah
          </Button>
        </CardHeader>
        <CardContent>
          {profile.experiences.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {profile.experiences.map((experience) => (
                <li
                  key={experience.id}
                  className="flex flex-col gap-2 rounded-xl border p-4 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{experience.position}</p>
                      {experience.is_current && <Badge className="w-fit">Berlangsung</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{experience.company_name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(experience.start_date)} –{" "}
                      {experience.is_current ? "Sekarang" : formatDate(experience.end_date)}
                    </p>
                    {experience.description && (
                      <p className="mt-2 text-sm text-muted-foreground">{experience.description}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Edit pengalaman di ${experience.company_name}`}
                      onClick={() => openExpEdit(experience)}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:text-destructive"
                      aria-label={`Hapus pengalaman di ${experience.company_name}`}
                      onClick={() => {
                        setDeleteError("")
                        setDeleteTarget(experience)
                      }}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={BriefcaseBusiness}
              title="Belum ada pengalaman kerja"
              description="Tambahkan riwayat kerja, magang, atau volunteer untuk memperkaya profilmu."
              action={
                <Button onClick={openExpCreate}>
                  <Plus data-icon="inline-start" />
                  Tambah pengalaman
                </Button>
              }
            />
          )}
        </CardContent>
      </Card>

      <ExperienceDialog
        open={expOpen}
        editing={expEditing}
        form={expForm}
        errors={expErrors}
        error={expError}
        saving={expSaving}
        onOpenChange={(open) => {
          if (!expSaving) setExpOpen(open)
        }}
        onFieldChange={setExpField}
        onSave={handleSaveExperience}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!isDeleting) setDeleteTarget(open ? deleteTarget : null)
        }}
        title="Hapus pengalaman kerja?"
        description={
          deleteTarget
            ? `Pengalaman di "${deleteTarget.company_name}" akan dihapus permanen dari profilmu.`
            : undefined
        }
        confirmLabel="Hapus"
        cancelLabel="Batal"
        destructive
        loading={isDeleting}
        error={deleteError}
        onConfirm={handleDeleteExperience}
      />
    </div>
  )
}

function ExperienceDialog({
  open,
  editing,
  form,
  errors,
  error,
  saving,
  onOpenChange,
  onFieldChange,
  onSave,
}: {
  open: boolean
  editing: Experience | null
  form: ExperienceFormState
  errors: Record<string, string[]>
  error: string
  saving: boolean
  onOpenChange: (open: boolean) => void
  onFieldChange: (key: keyof ExperienceFormState, value: string | boolean) => void
  onSave: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit pengalaman kerja" : "Tambah pengalaman kerja"}</DialogTitle>
          <DialogDescription>
            {editing
              ? "Perbarui informasi pengalaman kerja ini."
              : "Ceritakan pengalaman kerja, magang, atau volunteer yang pernah kamu jalani."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="exp-company">Nama perusahaan / instansi</Label>
            <Input
              id="exp-company"
              placeholder="Contoh: PT Nusantara Digital"
              value={form.company_name}
              aria-invalid={Boolean(errors.company_name)}
              onChange={(event) => onFieldChange("company_name", event.target.value)}
            />
            <FieldError message={errors.company_name?.[0]} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="exp-position">Posisi</Label>
            <Input
              id="exp-position"
              placeholder="Contoh: Junior Developer"
              value={form.position}
              aria-invalid={Boolean(errors.position)}
              onChange={(event) => onFieldChange("position", event.target.value)}
            />
            <FieldError message={errors.position?.[0]} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="exp-start">Tanggal mulai</Label>
            <Input
              id="exp-start"
              type="date"
              value={form.start_date}
              aria-invalid={Boolean(errors.start_date)}
              onChange={(event) => onFieldChange("start_date", event.target.value)}
            />
            <FieldError message={errors.start_date?.[0]} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="exp-end">Tanggal selesai</Label>
            <Input
              id="exp-end"
              type="date"
              disabled={form.is_current}
              value={form.is_current ? "" : form.end_date}
              aria-invalid={Boolean(errors.end_date)}
              onChange={(event) => onFieldChange("end_date", event.target.value)}
            />
            <FieldError message={errors.end_date?.[0]} />
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={form.is_current}
            onClick={() => onFieldChange("is_current", !form.is_current)}
            className={cn(
              "flex items-center gap-3 rounded-xl border p-3 text-left text-sm transition-colors sm:col-span-2",
              form.is_current ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted"
            )}
          >
            <span
              className={cn(
                "flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors",
                form.is_current ? "bg-primary" : "bg-input"
              )}
            >
              <span
                className={cn(
                  "size-4 rounded-full bg-background shadow transition-transform",
                  form.is_current ? "translate-x-4" : "translate-x-0"
                )}
              />
            </span>
            <span className="font-medium">Masih berlangsung sampai sekarang</span>
          </button>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="exp-description">Deskripsi</Label>
            <Textarea
              id="exp-description"
              rows={3}
              placeholder="Ceritakan tanggung jawab dan pencapaianmu di posisi ini."
              value={form.description}
              onChange={(event) => onFieldChange("description", event.target.value)}
            />
            <FieldError message={errors.description?.[0]} />
          </div>
        </div>
        {error && <FormAlert>{error}</FormAlert>}
        <DialogFooter>
          <Button variant="outline" disabled={saving} onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button disabled={saving} onClick={onSave}>
            {saving && <Loader2 className="animate-spin" data-icon="inline-start" />}
            {saving ? "Menyimpan..." : editing ? "Simpan perubahan" : "Tambah pengalaman"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

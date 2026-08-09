import type { ApplicationStatus, EventType, LocationType, ParticipationStatus, TracerStatus } from "@/lib/types"

export const TRACER_STATUS_LABELS: Record<TracerStatus, string> = {
  bekerja: "Bekerja",
  kuliah: "Melanjutkan / Kuliah",
  wirausaha: "Wirausaha",
}

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: "Menunggu Review",
  reviewed: "Sedang Direview",
  accepted: "Diterima",
  rejected: "Ditolak",
}

export const PARTICIPATION_STATUS_LABELS: Record<ParticipationStatus, string> = {
  registered: "Terdaftar",
  attended: "Hadir",
  cancelled: "Dibatalkan",
}

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  webinar: "Webinar",
  bootcamp: "Bootcamp",
  training: "Training",
  job_fair: "Job Fair",
  other: "Lainnya",
}

export const LOCATION_TYPE_LABELS: Record<LocationType, string> = {
  online: "Online",
  offline: "Offline",
  hybrid: "Hybrid",
}

export const FIELD_LABELS: Record<string, string> = {
  name: "Nama lengkap",
  nisn: "NISN",
  email: "Email",
  password: "Kata sandi",
  password_confirmation: "Konfirmasi kata sandi",
  school_id: "Sekolah",
  phone_number: "Nomor WhatsApp",
  major_id: "Jurusan / Konsentrasi Keahlian",
  graduation_year: "Tahun lulus",
  about_me: "Tentang saya",
  skills: "Keahlian",
  linkedin_url: "URL LinkedIn",
  portfolio_url: "URL Portofolio",
  avatar: "Foto profil",
  resume: "Curriculum Vitae",
  location_scale: "Lokasi (skala)",
  location_country: "Lokasi (negara)",
  field_of_work: "Bidang pekerjaan",
  salary_range: "Rentang gaji",
  company_name: "Nama perusahaan / instansi",
  position: "Posisi / jabatan",
  start_date: "Tanggal mulai bekerja",
  is_linear: "Linearitas jurusan",
  university_name: "Nama universitas / perguruan tinggi",
  enrollment_date: "Tanggal masuk",
  ownership_type: "Kepemilikan usaha",
  employee_count: "Jumlah karyawan",
  monthly_omset_range: "Rentang omset per bulan",
  business_type: "Jenis usaha",
  cv: "Curriculum Vitae (CV)",
  cover_letter: "Cover letter",
  otp: "Kode OTP",
  new_password: "Kata sandi baru",
  new_password_confirmation: "Konfirmasi kata sandi baru",
  company_name_exp: "Nama perusahaan / instansi",
  position_exp: "Posisi",
  description: "Deskripsi",
  end_date: "Tanggal selesai",
  is_current: "Masih berlangsung",
}

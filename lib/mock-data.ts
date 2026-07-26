export type Role = "alumni"
export type PageKey = "dashboard" | "alumni" | "tracer" | "lowongan" | "kegiatan" | "laporan" | "pengguna" | "profil"

export const roleLabels: Record<Role, string> = {
  alumni: "Alumni",
}

export const alumni = [
  { id: "ALM-2401", name: "Aulia Rahma", nisn: "0067319284", major: "Rekayasa Perangkat Lunak", year: "2024", status: "Bekerja", place: "PT Solusi Digital", verified: true },
  { id: "ALM-2402", name: "Fajar Nugraha", nisn: "0068117291", major: "Teknik Komputer dan Jaringan", year: "2024", status: "Kuliah", place: "Universitas Negeri Yogyakarta", verified: true },
  { id: "ALM-2403", name: "Nabila Putri", nisn: "0065218320", major: "Akuntansi", year: "2024", status: "Wirausaha", place: "Nabila Creative", verified: false },
  { id: "ALM-2308", name: "Rizky Maulana", nisn: "0059321842", major: "Rekayasa Perangkat Lunak", year: "2023", status: "Bekerja", place: "Telkom Indonesia", verified: true },
  { id: "ALM-2311", name: "Dinda Maharani", nisn: "0057219340", major: "Manajemen Perkantoran", year: "2023", status: "Belum bekerja", place: "—", verified: false },
  { id: "ALM-2219", name: "Bagas Pratama", nisn: "0048327192", major: "Teknik Komputer dan Jaringan", year: "2022", status: "Bekerja", place: "Lintas Data Prima", verified: true },
]

export const jobs = [
  { title: "Junior Frontend Developer", company: "Nusantara Digital", location: "Yogyakarta", type: "Full-time", deadline: "28 Jul 2026", match: 92 },
  { title: "IT Support Specialist", company: "PT Arunika Teknologi", location: "Semarang", type: "Full-time", deadline: "2 Agu 2026", match: 87 },
  { title: "Staf Administrasi", company: "Karya Muda Group", location: "Solo", type: "Full-time", deadline: "5 Agu 2026", match: 81 },
  { title: "Accounting Intern", company: "Mitra Finansial", location: "Remote", type: "Magang", deadline: "10 Agu 2026", match: 78 },
]

export const activities = [
  { date: "18", month: "JUL", title: "Career Preparation Class", meta: "09.00 WIB · Aula Sekolah", category: "Pelatihan" },
  { date: "23", month: "JUL", title: "Campus Hiring Nusantara Digital", meta: "13.00 WIB · Lab Komputer", category: "Rekrutmen" },
  { date: "02", month: "AGU", title: "Alumni Sharing Session", meta: "10.00 WIB · Daring", category: "Webinar" },
]

export const statusData = [
  { label: "Bekerja", value: 428, percent: 57 },
  { label: "Kuliah", value: 181, percent: 24 },
  { label: "Wirausaha", value: 76, percent: 10 },
  { label: "Belum bekerja", value: 67, percent: 9 },
]

export const monthlyResponses = [42, 55, 48, 70, 64, 84, 76, 96, 88, 110, 103, 126]

export const users = [
  { name: "Siti Handayani", email: "bkk@smknusantara.sch.id", role: "Admin BKK", status: "Aktif" },
  { name: "Aulia Rahma", email: "aulia.rahma@email.com", role: "Alumni", status: "Aktif" },
  { name: "Fajar Nugraha", email: "fajar.n@email.com", role: "Alumni", status: "Aktif" },
  { name: "Nabila Putri", email: "nabila.putri@email.com", role: "Alumni", status: "Menunggu" },
]

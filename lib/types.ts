export type Role = "alumni"
export type PageKey = "dashboard" | "tracer" | "lowongan" | "kegiatan" | "profil"

export type Job = { id:string; title:string; company:string; location:string; type:string; salary:string; deadline:string; match:number; status:"Terbit"|"Draft"|"Ditutup"; description:string; responsibilities:string[]; requirements:string[]; skills:string[]; benefits:string[]; applicants:number }
export type Application = { id:string; jobId:string; jobTitle:string; company:string; date:string; status:"Dikirim"|"Ditinjau"|"Wawancara"|"Diterima"|"Ditolak"; note:string }
export type Session = { role:Role; name:string; email:string }
export type Event = { id: string; title: string; description: string; date: string; location: string; category: string; registered: boolean }

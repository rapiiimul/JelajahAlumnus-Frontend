import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useApp } from "@/components/app-provider"
import { updateProfileToBackend } from "@/lib/api-client"
import { User, Briefcase, GraduationCap, Mail, Phone, Globe, Linkedin, FileText, Plus, Trash2 } from "lucide-react"

export default function ProfilPage() {
  const { session } = useApp()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [experiences, setExperiences] = useState<any[]>([])
  const [showAddExperience, setShowAddExperience] = useState(false)
  const [newExperience, setNewExperience] = useState({
    company_name: "",
    position: "",
    description: "",
    start_date: "",
    end_date: "",
    is_current: false
  })

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch('/api/v1/profile')
        if (response.ok) {
          const data = await response.json()
          setProfile(data)

          // Initialize experiences if available
          if (data.experiences) {
            setExperiences(data.experiences)
          }
        }
      } catch (error) {
        console.error("Gagal memuat profil:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  const handleUpdateProfile = async () => {
    try {
      const payload = {
        phone_number: profile.phone_number,
        about_me: profile.about_me,
        skills: profile.skills || [],
        linkedin_url: profile.linkedin_url,
        portfolio_url: profile.portfolio_url
      }

      await updateProfileToBackend(payload)
      setEditing(false)
      alert("Profil berhasil diperbarui!")
    } catch (error) {
      alert("Gagal memperbarui profil. Silakan coba lagi.")
    }
  }

  const handleAddExperience = async () => {
    try {
      // In a real app, this would be an API call to add experience
      const newExp = {
        ...newExperience,
        id: Date.now().toString()
      }

      setExperiences([...experiences, newExp])
      setNewExperience({
        company_name: "",
        position: "",
        description: "",
        start_date: "",
        end_date: "",
        is_current: false
      })
      setShowAddExperience(false)

      alert("Pengalaman berhasil ditambahkan!")
    } catch (error) {
      alert("Gagal menambahkan pengalaman. Silakan coba lagi.")
    }
  }

  const handleDeleteExperience = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus pengalaman ini?")) {
      setExperiences(experiences.filter(exp => exp.id !== id))
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Memuat profil...</div>
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Profil Saya</h1>
          <p className="text-gray-600">
            Kelola informasi pribadi dan profesional Anda
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="flex flex-col items-center">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={profile?.avatar_url} alt={profile?.name} />
                    <AvatarFallback className="text-2xl">
                      {profile?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold mt-3">{profile?.name}</h2>
                  <p className="text-gray-600">{profile?.email}</p>
                  <p className="text-gray-600">{profile?.nisn}</p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <GraduationCap className="w-4 h-4 mr-2 text-gray-500" />
                    <span>{profile?.major_name} | {profile?.graduation_year}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Mail className="w-4 h-4 mr-2 text-gray-500" />
                    <span>{profile?.email}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="w-4 h-4 mr-2 text-gray-500" />
                    <span>{profile?.phone_number || "Belum diatur"}</span>
                  </div>
                  {profile?.linkedin_url && (
                    <div className="flex items-center text-sm">
                      <Linkedin className="w-4 h-4 mr-2 text-gray-500" />
                      <a href={profile?.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Profil LinkedIn
                      </a>
                    </div>
                  )}
                  {profile?.portfolio_url && (
                    <div className="flex items-center text-sm">
                      <Globe className="w-4 h-4 mr-2 text-gray-500" />
                      <a href={profile?.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Portfolio
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Informasi Dasar</CardTitle>
                  <Button variant="outline" onClick={() => setEditing(!editing)}>
                    {editing ? "Batal" : "Edit"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {editing ? (
                  <div className="space-y-4">
                    <div>
                      <Label>No. Telepon</Label>
                      <Input 
                        value={profile?.phone_number || ""} 
                        onChange={(e) => setProfile({...profile, phone_number: e.target.value})} 
                        placeholder="081234567890" 
                      />
                    </div>
                    <div>
                      <Label>Tentang Saya</Label>
                      <Textarea 
                        value={profile?.about_me || ""} 
                        onChange={(e) => setProfile({...profile, about_me: e.target.value})} 
                        placeholder="Ceritakan tentang diri Anda..." 
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Keahlian (pisahkan dengan koma)</Label>
                      <Input 
                        value={profile?.skills?.join(", ") || ""} 
                        onChange={(e) => setProfile({...profile, skills: e.target.value.split(",").map(s => s.trim())})} 
                        placeholder="React, Node.js, UI/UX Design" 
                      />
                    </div>
                    <div>
                      <Label>URL LinkedIn</Label>
                      <Input 
                        value={profile?.linkedin_url || ""} 
                        onChange={(e) => setProfile({...profile, linkedin_url: e.target.value})} 
                        placeholder="https://linkedin.com/in/username" 
                      />
                    </div>
                    <div>
                      <Label>URL Portfolio</Label>
                      <Input 
                        value={profile?.portfolio_url || ""} 
                        onChange={(e) => setProfile({...profile, portfolio_url: e.target.value})} 
                        placeholder="https://portfolio.com/username" 
                      />
                    </div>
                    <Button onClick={handleUpdateProfile}>Simpan Perubahan</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-1">Tentang Saya</h3>
                      <p className="text-gray-600">{profile?.about_me || "Belum ada informasi"}</p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Keahlian</h3>
                      <div className="flex flex-wrap gap-2">
                        {(profile?.skills || []).map((skill: string, index: number) => (
                          <Badge key={index} variant="secondary">{skill}</Badge>
                        ))}
                        {!profile?.skills?.length && (
                          <span className="text-gray-500">Belum ada keahlian yang ditambahkan</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Link Sosial</h3>
                      <div className="space-y-1">
                        {profile?.linkedin_url && (
                          <div className="flex items-center">
                            <Linkedin className="w-4 h-4 mr-2 text-blue-600" />
                            <a href={profile?.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              Profil LinkedIn
                            </a>
                          </div>
                        )}
                        {profile?.portfolio_url && (
                          <div className="flex items-center">
                            <Globe className="w-4 h-4 mr-2 text-blue-600" />
                            <a href={profile?.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              Portfolio
                            </a>
                          </div>
                        )}
                        {!profile?.linkedin_url && !profile?.portfolio_url && (
                          <span className="text-gray-500">Belum ada link sosial yang ditambahkan</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Experience */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Pengalaman Kerja</CardTitle>
                  <Button variant="outline" onClick={() => setShowAddExperience(!showAddExperience)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Pengalaman
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showAddExperience && (
                  <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                    <h3 className="font-medium mb-3">Tambah Pengalaman Baru</h3>
                    <div className="space-y-3">
                      <div>
                        <Label>Nama Perusahaan</Label>
                        <Input 
                          value={newExperience.company_name} 
                          onChange={(e) => setNewExperience({...newExperience, company_name: e.target.value})} 
                          placeholder="PT. Nusantara Digital" 
                        />
                      </div>
                      <div>
                        <Label>Jabatan</Label>
                        <Input 
                          value={newExperience.position} 
                          onChange={(e) => setNewExperience({...newExperience, position: e.target.value})} 
                          placeholder="Frontend Developer" 
                        />
                      </div>
                      <div>
                        <Label>Deskripsi</Label>
                        <Textarea 
                          value={newExperience.description} 
                          onChange={(e) => setNewExperience({...newExperience, description: e.target.value})} 
                          placeholder="Deskripsi tugas dan tanggung jawab..." 
                          rows={2}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Tanggal Mulai</Label>
                          <Input 
                            type="date" 
                            value={newExperience.start_date} 
                            onChange={(e) => setNewExperience({...newExperience, start_date: e.target.value})} 
                          />
                        </div>
                        <div>
                          <Label>Tanggal Selesai</Label>
                          <Input 
                            type="date" 
                            value={newExperience.end_date} 
                            onChange={(e) => setNewExperience({...newExperience, end_date: e.target.value})} 
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowAddExperience(false)}>
                          Batal
                        </Button>
                        <Button onClick={handleAddExperience}>
                          Simpan Pengalaman
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {experiences.length > 0 ? (
                  <div className="space-y-4">
                    {experiences.map((exp) => (
                      <div key={exp.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-medium">{exp.position}</h3>
                            <p className="text-gray-600">{exp.company_name}</p>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteExperience(exp.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {exp.start_date} - {exp.end_date || "Sekarang"}
                        </p>
                        {exp.description && (
                          <p className="mt-2 text-sm">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <Briefcase className="mx-auto w-12 h-12 mb-2" />
                    <p>Belum ada pengalaman kerja yang ditambahkan</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

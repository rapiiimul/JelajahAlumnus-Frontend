"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import {
  BriefcaseBusiness,
  CalendarDays,
  ChevronRight,
  CircleUserRound,
  ClipboardCheck,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  UserRound,
} from "lucide-react"

import { useAuth } from "@/components/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn, initials } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Beranda", icon: LayoutDashboard },
  { href: "/tracer-study", label: "Tracer Study", icon: ClipboardCheck },
  { href: "/lowongan", label: "Lowongan", icon: BriefcaseBusiness },
  { href: "/lamaran", label: "Lamaran Saya", icon: FileText },
  { href: "/kegiatan", label: "Kegiatan", icon: CalendarDays },
  { href: "/profil", label: "Profil Saya", icon: CircleUserRound },
] as const

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Beranda", subtitle: "Pantau aktivitas dan peluang terbaru untukmu." },
  "/tracer-study": { title: "Tracer Study", subtitle: "Perbarui aktivitasmu setelah lulus." },
  "/lowongan": { title: "Lowongan Kerja", subtitle: "Temukan peluang terbaik dari mitra industri sekolah." },
  "/lamaran": { title: "Lamaran Saya", subtitle: "Pantau proses rekrutmen dan perkembangan lamaranmu." },
  "/kegiatan": { title: "Kegiatan & Pelatihan", subtitle: "Agenda karier dan informasi terbaru untuk alumni." },
  "/profil": { title: "Profil Saya", subtitle: "Kelola informasi pribadi dan profesionalmu." },
}

function pageMeta(pathname: string): { title: string; subtitle: string } {
  const base = "/" + (pathname.split("/")[1] ?? "dashboard")
  return PAGE_META[base] ?? PAGE_META["/dashboard"]
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/dashboard" className="flex items-center gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <GraduationCap className="size-5" />
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="block font-bold">Lacak.app</span>
          <span className="block text-xs text-muted-foreground">Alumni · Capaian · Karier</span>
        </span>
      )}
    </Link>
  )
}

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  const section = "/" + (pathname.split("/")[1] ?? "dashboard")
  return (
    <nav aria-label="Menu utama" className="flex flex-col gap-1 p-3">
      {NAV_ITEMS.map((item) => {
        const active = section === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="size-4" aria-hidden />
            {item.label}
            {active && <ChevronRight className="ml-auto size-4" aria-hidden />}
          </Link>
        )
      })}
    </nav>
  )
}

function SidebarFooter() {
  const { user, logout } = useAuth()
  const router = useRouter()
  return (
    <div className="mt-auto flex flex-col gap-2 p-4">
      <div className="flex items-center gap-3 rounded-xl bg-muted p-3">
        <Avatar>
          <AvatarFallback>{initials(user?.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{user?.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user?.nisn ?? user?.email}</p>
        </div>
      </div>
      <Button
        variant="ghost"
        className="justify-start text-muted-foreground"
        onClick={() => {
          void logout()
          router.push("/login")
        }}
      >
        <LogOut data-icon="inline-start" />
        Keluar
      </Button>
    </div>
  )
}

function MobileNav({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false)
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="outline" size="icon" className="lg:hidden" aria-label="Buka menu navigasi" />
        }
      >
        <Menu />
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="sr-only">
          <SheetTitle>Navigasi</SheetTitle>
          <SheetDescription>Menu utama aplikasi</SheetDescription>
        </SheetHeader>
        <div className="flex h-16 items-center border-b px-5">
          <Brand />
        </div>
        <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
        <SidebarFooter />
      </SheetContent>
    </Sheet>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const { title, subtitle } = pageMeta(pathname)

  return (
    <div className="min-h-screen bg-muted/40">
      <aside className="fixed inset-y-0 hidden w-64 flex-col border-r bg-sidebar lg:flex">
        <div className="flex h-16 items-center border-b px-5">
          <Brand />
        </div>
        <NavLinks pathname={pathname} />
        <SidebarFooter />
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur md:px-6">
          <MobileNav pathname={pathname} />

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold md:text-xl">{title}</h1>
            <p className="hidden truncate text-xs text-muted-foreground md:block">{subtitle}</p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" className="gap-2 px-2" aria-label="Menu akun pengguna" />
              }
            >
              <Avatar size="sm">
                <AvatarImage src={user?.avatar ?? undefined} alt={user?.name ?? "Pengguna"} />
                <AvatarFallback>{initials(user?.name)}</AvatarFallback>
              </Avatar>
              <span className="hidden max-w-32 truncate text-sm font-medium sm:block">{user?.name}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <span className="block truncate font-semibold text-foreground">{user?.name}</span>
                <span className="block truncate text-xs font-normal text-muted-foreground">
                  {user?.nisn ?? user?.email}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem render={<Link href="/profil" />}>
                <UserRound />
                Profil Saya
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => {
                  void logout()
                  router.push("/login")
                }}
              >
                <LogOut />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="mx-auto w-full max-w-7xl p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}

"use client"

import Link from "next/link"
import { BriefcaseBusiness, CalendarDays, Clock3, UserRound } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import type { Job } from "@/lib/types"

interface JobCardProps {
  job: Job
  onApply: (job: Job) => void
}

export function JobCard({ job, onApply }: JobCardProps) {
  const image = job.images?.[0]

  return (
    <Card className="flex h-full flex-col">
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="h-36 w-full object-cover" loading="lazy" />
      )}
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BriefcaseBusiness className="size-5" aria-hidden />
          </div>
          <Badge variant={job.is_applied ? "secondary" : "default"}>
            {job.is_applied ? "Sudah dilamar" : "Masih dibuka"}
          </Badge>
        </div>
        <CardTitle className="pt-3 leading-snug">
          <Link href={`/lowongan/${job.id}`} className="hover:underline">
            {job.title}
          </Link>
        </CardTitle>
        <CardDescription className="font-medium">{job.company_name}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2 text-sm text-muted-foreground">
        <p className="line-clamp-3 text-sm leading-relaxed">{job.description}</p>
        <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-3 text-xs">
          {job.posted_by && (
            <span className="inline-flex items-center gap-1.5">
              <UserRound className="size-3.5" aria-hidden />
              {job.posted_by}
            </span>
          )}
          {job.posted_at && (
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="size-3.5" aria-hidden />
              Diposting {formatDate(job.posted_at)}
            </span>
          )}
          {job.expires_at && (
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5" aria-hidden />
              Batas {formatDate(job.expires_at)}
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex w-full gap-2">
          <Button variant="outline" className="flex-1" render={<Link href={`/lowongan/${job.id}`} />}>
            Detail
          </Button>
          <Button className="flex-1" disabled={job.is_applied} onClick={() => onApply(job)}>
            {job.is_applied ? "Sudah Dilamar" : "Lamar Pekerjaan"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

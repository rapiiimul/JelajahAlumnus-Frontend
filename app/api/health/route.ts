import { NextRequest, NextResponse } from "next/server"

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://202.155.18.120"

export async function GET(request: NextRequest) {
  const targetUrl = new URL(`${BACKEND_BASE_URL}/api/health${request.nextUrl.search}`)
  const response = await fetch(targetUrl, {
    method: "GET",
    headers: new Headers(request.headers),
  })

  const body = await response.arrayBuffer()
  const headers = new Headers(response.headers)
  headers.delete("content-length")

  return new NextResponse(body, {
    status: response.status,
    headers,
  })
}

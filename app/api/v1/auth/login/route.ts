import { NextRequest, NextResponse } from "next/server"

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://202.155.18.120"

export async function POST(request: NextRequest) {
  const targetUrl = new URL(`${BACKEND_BASE_URL}/api/v1/auth/login`)
  const body = await request.text()
  const headers = new Headers(request.headers)
  headers.delete("host")

  const response = await fetch(targetUrl, {
    method: "POST",
    headers,
    body,
  })

  const responseBody = await response.arrayBuffer()
  const responseHeaders = new Headers(response.headers)
  responseHeaders.delete("content-length")

  return new NextResponse(responseBody, {
    status: response.status,
    headers: responseHeaders,
  })
}

import { NextRequest, NextResponse } from "next/server"

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://202.155.18.120"

async function proxyRequest(request: NextRequest, pathSegments: string[]) {
  const endpointPath = pathSegments.join("/")
  const targetUrl = new URL(`${BACKEND_BASE_URL}/api/${endpointPath}${request.nextUrl.search}`)

  const headers = new Headers(request.headers)
  headers.delete("host")
  headers.delete("content-length")

  let body: BodyInit | undefined
  const method = request.method

  if (method !== "GET" && method !== "HEAD") {
    const contentType = request.headers.get("content-type") || ""
    if (contentType.includes("multipart/form-data")) {
      body = await request.formData()
    } else {
      const text = await request.text()
      body = text ? text : undefined
    }
  }

  // debug: log forwarded request info
  try {
    // eslint-disable-next-line no-console
    console.log("[proxy]", request.method, targetUrl.toString(), "content-type:", request.headers.get("content-type"))
  } catch (e) {
    // ignore
  }

  const response = await fetch(targetUrl, {
    method,
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

export async function GET(request: NextRequest, context: any) {
  const params = await context.params
  return proxyRequest(request, params?.path ?? [])
}

export async function POST(request: NextRequest, context: any) {
  const params = await context.params
  return proxyRequest(request, params?.path ?? [])
}

export async function PUT(request: NextRequest, context: any) {
  const params = await context.params
  return proxyRequest(request, params?.path ?? [])
}

export async function PATCH(request: NextRequest, context: any) {
  const params = await context.params
  return proxyRequest(request, params?.path ?? [])
}

export async function DELETE(request: NextRequest, context: any) {
  const params = await context.params
  return proxyRequest(request, params?.path ?? [])
}

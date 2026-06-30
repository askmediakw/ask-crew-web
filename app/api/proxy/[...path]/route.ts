import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://admin.askcrews.com/api/v1'

export async function GET(request: NextRequest) {
  return handleRequest(request, 'GET')
}

export async function POST(request: NextRequest) {
  return handleRequest(request, 'POST')
}

export async function PUT(request: NextRequest) {
  return handleRequest(request, 'PUT')
}

export async function PATCH(request: NextRequest) {
  return handleRequest(request, 'PATCH')
}

export async function DELETE(request: NextRequest) {
  return handleRequest(request, 'DELETE')
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

async function handleRequest(request: NextRequest, method: string) {
  const path = request.nextUrl.pathname.replace('/api/proxy', '')
  const searchParams = request.nextUrl.searchParams.toString()
  const url = `${BACKEND_URL}${path}${searchParams ? `?${searchParams}` : ''}`

  console.log('Proxying request:', { method, path, url })

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  const authHeader = request.headers.get('authorization')
  if (authHeader) {
    headers['Authorization'] = authHeader
  }

  let body: string | null = null
  if (method !== 'GET' && method !== 'DELETE') {
    try {
      body = await request.text()
    } catch {
      body = null
    }
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body,
    })

    console.log('Backend response status:', response.status)
    
    const data = await response.text()

    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  } catch (error) {
    console.error('Proxy error:', error)
    return new NextResponse(JSON.stringify({ error: 'فشل الاتصال بالخادم' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const formData = await request.formData();
  // Forward the request to the PHP backend (adjust host/port if needed)
  const backendResponse = await fetch('http://localhost:5000/api/quiz/upload', {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });
  const data = await backendResponse.json();
  return NextResponse.json(data, { status: backendResponse.status });
}

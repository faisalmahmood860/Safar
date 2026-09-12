import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  url.pathname = '/';
  return NextResponse.redirect(url, 307);
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  url.pathname = '/';
  return NextResponse.redirect(url, 307);
}

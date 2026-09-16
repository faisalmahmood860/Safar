import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

export async function GET(request: Request) {
  return NextResponse.json({ success: true, message: 'SafarLoad Platform' });
}

export async function POST(request: Request) {
  return NextResponse.json({ success: true, message: 'SafarLoad Platform' });
}

import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function POST(request: Request) {
  const { name } = await request.json();
  
  await sql`INSERT INTO message (name) VALUES (${name})`;
  
  return NextResponse.json({ success: true }, { status: 201 });
}
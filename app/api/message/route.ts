import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    const messages = await sql`SELECT id, name FROM message ORDER BY id DESC`;
    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    await sql`INSERT INTO message (name) VALUES (${name})`;
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
  }
}

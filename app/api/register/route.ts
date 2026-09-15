import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { name, username, password } = await request.json();

    if (!name || !username || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    await sql`INSERT INTO users (name, username, password) VALUES (${name}, ${username}, ${password})`;
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Registration failed or username exists' }, { status: 500 });
  }
}
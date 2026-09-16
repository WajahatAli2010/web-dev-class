import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { name, username, password } = await request.json();

    if (!name || !username || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // 1. Hash the password with a salt round of 10
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. Save the hashed password to the database
    await sql`INSERT INTO users (name, username, password) VALUES (${name}, ${username}, ${hashedPassword})`;

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Registration failed or username exists' }, { status: 500 });
  }
}
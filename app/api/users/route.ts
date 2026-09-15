import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    const users = await sql`SELECT id, name, username FROM users ORDER BY id DESC`;
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, username, password } = await request.json();
    await sql`INSERT INTO users (name, username, password) VALUES (${name}, ${username}, ${password || '123456'})`;
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, username } = await request.json();
    await sql`UPDATE users SET name = ${name}, username = ${username} WHERE id = ${id}`;
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to replace user' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, name, username } = await request.json();
    
    if (name && username) {
      await sql`UPDATE users SET name = ${name}, username = ${username} WHERE id = ${id}`;
    } else if (name) {
      await sql`UPDATE users SET name = ${name} WHERE id = ${id}`;
    } else if (username) {
      await sql`UPDATE users SET username = ${username} WHERE id = ${id}`;
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to patch user' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await sql`DELETE FROM users WHERE id = ${id}`;
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
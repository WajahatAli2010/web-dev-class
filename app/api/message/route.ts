import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    const messages = await sql`SELECT id, name, username FROM message ORDER BY id DESC`;
    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, username } = await request.json();
    await sql`INSERT INTO message (name, username) VALUES (${name}, ${username})`;
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, username } = await request.json();
    await sql`UPDATE message SET name = ${name}, username = ${username} WHERE id = ${id}`;
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to replace message' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, name, username } = await request.json();
    
    if (name && username) {
      await sql`UPDATE message SET name = ${name}, username = ${username} WHERE id = ${id}`;
    } else if (name) {
      await sql`UPDATE message SET name = ${name} WHERE id = ${id}`;
    } else if (username) {
      await sql`UPDATE message SET username = ${username} WHERE id = ${id}`;
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to patch message' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await sql`DELETE FROM message WHERE id = ${id}`;
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
  }
}
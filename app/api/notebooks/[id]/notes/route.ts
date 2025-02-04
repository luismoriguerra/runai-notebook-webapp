import { getSession } from '@auth0/nextjs-auth0/edge';
import { NextResponse } from 'next/server';
import { createNote, getNotes } from '@/server/domain/notes';

export const runtime = 'edge';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const notes = await getNotes(session.user.sub, params.id);
    return NextResponse.json(notes);
  } catch (error) {
    console.error('Error in GET /api/notebooks/[id]/notes:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { chatId, title, url, content } = await request.json();
    if (!chatId || !title || !url || !content) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const note = await createNote(session.user.sub, params.id, chatId, title, url, content);
    return NextResponse.json(note);
  } catch (error) {
    console.error('Error in POST /api/notebooks/[id]/notes:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 
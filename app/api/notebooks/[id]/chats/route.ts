import { getSession } from '@auth0/nextjs-auth0/edge';
import { NextResponse } from 'next/server';
import { createChat, getChats } from '@/server/domain/chats';

export const runtime = 'edge';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const chats = await getChats(session.user.sub, params.id);
    return NextResponse.json(chats);
  } catch (error) {
    console.error('Error in GET /api/chats:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (!params.id) {
      return new NextResponse('Missing notebook id', { status: 400 });
    }
    const notebook_id = params.id;
    
    const { llm_name, messages } = await request.json();
    if (!llm_name || !messages) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const chat = await createChat(session.user.sub, notebook_id, llm_name, messages);
    return NextResponse.json(chat);
  } catch (error) {
    console.error('Error in POST /api/chats:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 
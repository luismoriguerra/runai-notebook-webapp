import { getSession } from '@auth0/nextjs-auth0/edge';
import { NextResponse } from 'next/server';
import { createSource, getSources } from '@/server/domain/sources';

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

    const sources = await getSources(session.user.sub, params.id);
    return NextResponse.json(sources);
  } catch (error) {
    console.error('Error in GET /api/notebooks/[id]/sources:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { title, content, type, url } = await request.json();
    if (!title || !content || !type || !url) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const source = await createSource(session.user.sub, params.id, title, content, type, url);
    return NextResponse.json(source);
  } catch (error) {
    console.error('Error in POST /api/notebooks/[id]/sources:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 
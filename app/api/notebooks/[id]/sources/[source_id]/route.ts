import { getSession } from '@auth0/nextjs-auth0/edge';
import { NextResponse } from 'next/server';
import { deleteSource, getSource, updateSource } from '@/server/domain/sources';

export const runtime = 'edge';

export async function GET(
  request: Request,
  { params }: { params: { id: string, source_id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const source = await getSource(params.source_id, session.user.sub, params.id);
    if (!source) {
      return new NextResponse('Source not found', { status: 404 });
    }

    return NextResponse.json(source);
  } catch (error) {
    console.error('Error in GET /api/notebooks/[id]/sources/[source_id]:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string, source_id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { title, content, type, url } = await request.json();
    if (!title || !content || !type || !url) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const existingSource = await getSource(params.source_id, session.user.sub, params.id);
    if (!existingSource) {
      return new NextResponse('Source not found', { status: 404 });
    }

    const source = await updateSource(params.source_id, session.user.sub, params.id, title, content, type, url);
    return NextResponse.json(source);
  } catch (error) {
    console.error('Error in PUT /api/notebooks/[id]/sources/[source_id]:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string, source_id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const existingSource = await getSource(params.source_id, session.user.sub, params.id);
    if (!existingSource) {
      return new NextResponse('Source not found', { status: 404 });
    }

    await deleteSource(params.source_id, session.user.sub, params.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error in DELETE /api/notebooks/[id]/sources/[source_id]:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 
import { getSession } from '@auth0/nextjs-auth0/edge';
import { NextResponse } from 'next/server';
import { deleteNotebook, getNotebook, updateNotebook } from '@/server/domain/notebooks';

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

    const notebook = await getNotebook(params.id, session.user.sub);
    if (!notebook) {
      return new NextResponse('Notebook not found', { status: 404 });
    }

    return NextResponse.json(notebook);
  } catch (error) {
    console.error('Error in GET /api/notebooks/[id]:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { title, description, url, instructions } = await request.json();
   

    const existingNotebook = await getNotebook(params.id, session.user.sub);
    if (!existingNotebook) {
      return new NextResponse('Notebook not found', { status: 404 });
    }

    const notebook = await updateNotebook(params.id, session.user.sub, title, description, url, instructions);
    return NextResponse.json(notebook);
  } catch (error) {
    console.error('Error in PUT /api/notebooks/[id]:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const existingNotebook = await getNotebook(params.id, session.user.sub);
    if (!existingNotebook) {
      return new NextResponse('Notebook not found', { status: 404 });
    }

    await deleteNotebook(params.id, session.user.sub);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error in DELETE /api/notebooks/[id]:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 
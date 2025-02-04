import { getSession } from '@auth0/nextjs-auth0/edge';
import { NextResponse } from 'next/server';
import { deleteNote, getNote, updateNote } from '@/server/domain/notes';

export const runtime = 'edge';

export async function GET(
    request: Request,
    { params }: { params: { id: string, note_id: string } }
) {
    try {
        const session = await getSession();
        if (!session?.user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const note = await getNote(params.note_id, session.user.sub, params.id);
        return NextResponse.json(note);
    } catch (error) {
        console.error('Error in GET /api/notes/[id]:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string, note_id: string } }
) {
    try {
        const session = await getSession();
        if (!session?.user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { title, url, content } = await request.json();
        if (!title || !url || !content) {
            return new NextResponse('Missing required fields', { status: 400 });
        }

        const existingNote = await getNote(params.note_id, session.user.sub, params.id);
        if (!existingNote) {
            return new NextResponse('Note not found', { status: 404 });
        }

        const note = await updateNote(params.note_id, session.user.sub, params.id, title, url, content);
        return NextResponse.json(note);
    } catch (error) {
        console.error('Error in PUT /api/notes/[id]:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string, note_id: string } }
) {
    try {
        const session = await getSession();
        if (!session?.user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const existingNote = await getNote(params.note_id, session.user.sub, params.id);
        if (!existingNote) {
            return new NextResponse('Note not found', { status: 404 });
        }

        await deleteNote(params.note_id, session.user.sub, params.id);
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('Error in DELETE /api/notes/[id]:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
} 
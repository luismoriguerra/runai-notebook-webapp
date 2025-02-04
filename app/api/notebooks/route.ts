import { getSession } from '@auth0/nextjs-auth0/edge';
import { NextResponse } from 'next/server';
import { createNotebook, getNotebooks } from '@/server/domain/notebooks';
import { revalidatePath } from 'next/cache';

export const runtime = 'edge';

export async function GET() {
    try {
        const session = await getSession();
        if (!session?.user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const notebooks = await getNotebooks(session.user.sub);
        return NextResponse.json(notebooks);
    } catch (error) {
        console.error('Error in GET /api/notebooks:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session?.user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { title, description, url } = await request.json();
        if (!title || !description || !url) {
            return new NextResponse('Missing required fields', { status: 400 });
        }

        const notebook = await createNotebook(session.user.sub, title, description, url);
        revalidatePath('/');
        return NextResponse.json(notebook);
    } catch (error) {
        console.error('Error in POST /api/notebooks:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
} 
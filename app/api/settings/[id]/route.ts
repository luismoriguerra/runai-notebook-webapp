import { getSession } from '@auth0/nextjs-auth0/edge';
import { NextResponse } from 'next/server';
import { deleteSetting, getSetting, updateSetting } from '@/server/domain/settings';

export const runtime = 'edge';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { key, value } = await request.json();
    if (!key || !value) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const existingSetting = await getSetting(params.id, session.user.sub);
    if (!existingSetting) {
      return new NextResponse('Setting not found', { status: 404 });
    }

    const setting = await updateSetting(params.id, session.user.sub, key, value);
    return NextResponse.json(setting);
  } catch (error) {
    console.error('Error in PUT /api/settings/[id]:', error);
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

    const existingSetting = await getSetting(params.id, session.user.sub);
    if (!existingSetting) {
      return new NextResponse('Setting not found', { status: 404 });
    }

    await deleteSetting(params.id, session.user.sub);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error in DELETE /api/settings/[id]:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 
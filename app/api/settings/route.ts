import { getSession } from '@auth0/nextjs-auth0/edge';
import { NextResponse } from 'next/server';
import { createSetting, getSettings } from '@/server/domain/settings';

export const runtime = 'edge';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const settings = await getSettings(session.user.sub);
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error in GET /api/settings:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { key, value } = await request.json();
    if (!key || !value) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const setting = await createSetting(session.user.sub, key, value);
    return NextResponse.json(setting);
  } catch (error) {
    console.error('Error in POST /api/settings:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 
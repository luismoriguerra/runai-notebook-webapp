import { getSession } from '@auth0/nextjs-auth0/edge';

export const runtime = 'edge';

export async function GET() {
    const session = await getSession();
    return Response.json(session);
} 
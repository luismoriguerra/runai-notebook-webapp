import { getSession } from '@auth0/nextjs-auth0/edge';

export async function getUser() {
    const session = await getSession();
    const userId = session?.user.sub;

    if (!userId) {
        throw new Error('User not found');
    }

    return { userId, session };
} 
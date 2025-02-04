import { getSession } from '@auth0/nextjs-auth0/edge';
import { NextResponse } from 'next/server';
import { CoreMessage, generateText } from 'ai';
import { getProvider } from '@/server/infrastructure/ai/llm-providers';

export const runtime = 'edge';


export async function POST(request: Request) {
    try {
        const session = await getSession();
        const userId = session?.user.sub;

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }
        const { prompt, note_content, llm_name } = await request.json() as { prompt: string, note_content: string, llm_name: string };


        const provider = getProvider(llm_name);

        if (!provider) {
            return NextResponse.json(
                { error: `Unsupported model provider: ${llm_name}` },
                { status: 400 }
            );
        }

        const systemMessage = `
     You are an AI assistant that can help with your notes.
     You are given a note and a prompt.
     You must respond to the prompt based on the note. don't explain yourself. only return the response.
     `
        const UserMessageTemplate = `
<note>${note_content}</note>
<user>${prompt}</user>
     `

        const message: CoreMessage = { role: "user", content: UserMessageTemplate };
        const messages: CoreMessage[] = [message];
        const result = await generateText({
            model: provider,
            system: systemMessage,
            messages,
            maxTokens: 4000,
        });

        return NextResponse.json({ content: result.text });
    } catch (error) {
        console.error('Error in AI Assistant API:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
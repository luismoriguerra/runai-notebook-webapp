import { getSession } from '@auth0/nextjs-auth0/edge';
import { NextResponse } from 'next/server';
import { deleteChat, getChat, updateChat } from '@/server/domain/chats';
import { CoreMessage, LanguageModelV1, streamText } from 'ai';
import { getModelByCategory, modelByCategory } from '@/server/infrastructure/ai/llm-providers';

export const runtime = 'edge';

export async function GET(
  request: Request,
  { params }: { params: { id: string, chat_id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const chat = await getChat(params.chat_id, session.user.sub, params.id);
    if (!chat) {
      return new NextResponse('Chat not found', { status: 404 });
    }

    return NextResponse.json(chat);
  } catch (error) {
    console.error('Error in GET /api/chats/[id]:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string, chat_id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { llm_name, messages } = await request.json();
    if (!llm_name || !messages) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const existingChat = await getChat(params.chat_id, session.user.sub, params.id);
    if (!existingChat) {
      return new NextResponse('Chat not found', { status: 404 });
    }

    const chat = await updateChat(params.chat_id, session.user.sub, llm_name, messages);
    return NextResponse.json(chat);
  } catch (error) {
    console.error('Error in PUT /api/chats/[id]:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string, chat_id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const existingChat = await getChat(params.chat_id, session.user.sub, params.id);
    if (!existingChat) {
      return new NextResponse('Chat not found', { status: 404 });
    }

    await deleteChat(params.chat_id, session.user.sub);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error in DELETE /api/chats/[id]:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

interface IChatRequest {
  messages: CoreMessage[];
  llm_name: string; // this is category model now
}

export async function POST(
  request: Request,
  { params }: { params: { id: string, chat_id: string } }
) {

  // console.log('payload', request, params);

  if (!params.chat_id) {
    return NextResponse.json({ error: 'Missing chatId' }, { status: 400 });
  }
  const chatId = params.chat_id;

  const session = await getSession();
  const userId = session?.user.sub;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { messages, llm_name } = await request.json() as IChatRequest;


    // console.log('llm_name', llm_name);

    const provider = getModelByCategory(llm_name as keyof typeof modelByCategory);

    if (!provider) {
      return NextResponse.json(
        { error: `Unsupported model category: ${llm_name}` },
        { status: 400 }
      );
    }

    const stream = await streamText({
      model: provider as LanguageModelV1,
      messages,
      maxTokens: 8000,
      providerOptions: {
        openrouter: {
          includeReasoning: true,
        },
        // 'DeepInfra': {
        //   include_reasoning: true,
        // },
        // 'OpenRouter': {
        //   include_reasoning: true,
        // }
      },
      async onFinish({ text, finishReason, usage, response }) {

        console.log('on finish', JSON.stringify({ text, finishReason, usage, response }, null, 2));

        if (!text) {
          throw new Error('No text returned from the model');
        }

        const updatedMessages = [...messages, {
          role: 'assistant',
          content: text
        }];

        await updateChat(chatId, userId, llm_name, JSON.stringify(updatedMessages));
      }
    });

    return stream.toDataStreamResponse({
      sendUsage: true,
      sendReasoning: true,
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to process chat in the server' },
      { status: 500 }
    );
  }
}
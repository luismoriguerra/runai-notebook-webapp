'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { Chat } from "@/server/domain/chats";

interface ChatsSectionProps {
  notebookId: string;
  initialChats?: Chat[];
}

export default function ChatsSection({ notebookId, initialChats = [] }: ChatsSectionProps) {
  const router = useRouter();

  const createChat = async () => {
    try {
      const response = await fetch(`/api/notebooks/${notebookId}/chats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notebook_id: notebookId,
          llm_name: 'openai::gpt-4o-mini',
          messages: '[]'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create chat');
      }

      const chat = await response.json();
      router.push(`/notebooks/${notebookId}/chats/${chat.id}`);
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Chats</CardTitle>
        <Button onClick={createChat} className="gap-2">
          <MessageSquare size={16} />
          New Chat
        </Button>
      </CardHeader>
      <CardContent>
        {initialChats.length > 0 ? (
          <div className="space-y-2">
            {initialChats.map((chat) => (
              <Button
                key={chat.id}
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={() => router.push(`/notebooks/${notebookId}/chats/${chat.id}`)}
              >
                <MessageSquare size={16} />
                Chat from {new Date(chat.created_at).toLocaleDateString()}
              </Button>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No chats yet. Create your first chat to get started.</p>
        )}
      </CardContent>
    </Card>
  );
} 
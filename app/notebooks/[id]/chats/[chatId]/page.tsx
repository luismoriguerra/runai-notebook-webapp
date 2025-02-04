'use client';

export const runtime = 'edge';

import { useChat } from 'ai/react';
import { useState, useEffect, useRef } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Send, Loader2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { Textarea } from '@/components/ui/textarea';
import { models } from '@/server/infrastructure/ai/llm-providers';
import { SetBreadcrumb } from '@/components/set-breadcrumb';



interface LLMOption {
    value: string;
    label: string;
}

const llmOptions: LLMOption[] = [
    ...models.map((model) => ({ value: model, label: model })),
];

export default function ChatPage({ params }: { params: { id: string, chatId: string } }) {
    const router = useRouter();
    const [selectedModel, setSelectedModel] = useState(llmOptions[0].value);
    const [notebookId, setNotebookId] = useState(params.id);
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { messages, input, handleInputChange, handleSubmit, setMessages } = useChat({
        api: `/api/notebooks/${params.id}/chats/${params.chatId}`,
    });

    useEffect(() => {
        async function loadChatHistory() {
            try {
                const response = await fetch(`/api/notebooks/${params.id}/chats/${params.chatId}`);
                if (!response.ok) throw new Error('Failed to load chat history');

                const chatHistory = await response.json();
                // console.log('chatHistory', chatHistory);
                if (chatHistory.messages) {
                    const messages = JSON.parse(chatHistory.messages);
                    if (messages.length > 0) {
                        setMessages(messages);
                    }
                }
                if (chatHistory.llm_name) {
                    setSelectedModel(chatHistory.llm_name);
                }

                if (chatHistory.notebook_id) {
                    setNotebookId(chatHistory.notebook_id);
                }
            } catch (error) {
                console.error('Error loading chat history:', error);
            } finally {
                setIsLoading(false);
            }
        }

        loadChatHistory();
    }, [params.id, params.chatId, setMessages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
        handleSubmit(event, {
            body: {
                llm_name: selectedModel,
                id: params.chatId,
                notebook_id: notebookId
            }
        });
    }

    const handleDeleteChat = async () => {
        try {
            const response = await fetch(`/api/notebooks/${params.id}/chats/${params.chatId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete chat');

            if (notebookId) {
                router.push(`/notebooks/${notebookId}`);
            } else {
                router.push('/notebooks');
            }
        } catch (error) {
            console.error('Error deleting chat:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-5rem)]">
            <SetBreadcrumb
                breadcrumbs={[
                    { route: `/notebooks/${notebookId}`, label: 'Notebook' },
                    { route: `/notebooks/${notebookId}/chats/${params.chatId}`, label: 'Chat' }
                ]}
            />
            <div className="flex items-center justify-between p-4 border-b">
                <h1 className="text-xl font-semibold">Chat</h1>
                <div className="flex items-center gap-2">
                    <Select
                        value={selectedModel}
                        onValueChange={setSelectedModel}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select a model" />
                        </SelectTrigger>
                        <SelectContent>
                            {llmOptions.map((model) => (
                                <SelectItem key={model.value} value={model.value}>
                                    {model.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Chat</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to delete this chat? This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteChat}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'
                            }`}
                    >
                        <div
                            className={`max-w-[80%] rounded-lg p-4 ${message.role === 'user'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                }`}
                        >
                            <MarkdownRenderer content={message.content} />
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleFormSubmit} className="p-4 border-t">
                <div className="flex gap-2">
                    <Textarea
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Type your message..."
                        className="flex-1 min-h-[100px] resize-none"
                    />
                    <Button type="submit">
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </form>
        </div>
    );
} 
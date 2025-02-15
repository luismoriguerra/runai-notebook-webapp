"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Loader2 } from 'lucide-react'
import { useNotebookChat } from "@/app/providers/chat-provider"
import { useParams } from "next/navigation"
import { useChat } from 'ai/react'
import { useToast } from "@/hooks/use-toast"
import { modelCategories } from '@/server/infrastructure/ai/llm-providers'
import { encode } from "gpt-tokenizer"
import { AIProviderError } from './components/types'
import { ChatHeader } from './components/chat-header'
import { MessagesList } from './components/messages-list'
import { ChatInputForm } from './components/chat-input-form'

const llmCategories = modelCategories.map((model) => ({ value: model, label: model }));

export function ChatPanel() {
  const params = useParams();
  const notebookId = params.notebook_id as string;
  
  const [isLoading, setIsLoading] = useState(true)
  const [selectedModel, setSelectedModel] = useState(llmCategories[0].value)
  const [totalTokens, setTotalTokens] = useState(0)
  const { selectedChat } = useNotebookChat()
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const { messages, input, handleInputChange, handleSubmit, setMessages, isLoading: isGenerating, stop } = useChat({
    api: selectedChat ? `/api/notebooks/${notebookId}/chats/${selectedChat.id}` : undefined,
    onError: useCallback((error: Error) => {
      console.error('Error sending message:', error);

      if (error instanceof Error) {
        const errorData = error.cause as AIProviderError;

        if (errorData?.finishReason === 'error') {
          toast({
            variant: "destructive",
            title: "AI Provider Error",
            description: "The AI provider encountered an error. Please try again or switch to a different model.",
          });
          return;
        }

        if (errorData?.message?.includes('rate limit')) {
          toast({
            variant: "destructive",
            title: "Rate Limit Exceeded",
            description: "You've reached the rate limit. Please wait a moment before trying again.",
          });
          return;
        }
      }

      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message. Please try again.",
      });
    }, [toast])
  });

  useEffect(() => {
    async function loadChatHistory() {
      if (!selectedChat) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/notebooks/${notebookId}/chats/${selectedChat.id}`);
        if (!response.ok) throw new Error('Failed to load chat history');

        const chatHistory = await response.json();
        if (chatHistory.messages) {
          const messages = JSON.parse(chatHistory.messages);
          if (messages.length > 0) {
            setMessages(messages);
          }
        }
        if (chatHistory.llm_name) {
          setSelectedModel(chatHistory.llm_name);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load chat history. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadChatHistory();
  }, [selectedChat, notebookId, setMessages, toast]);

  useEffect(() => {
    const totalTokens = messages.reduce((acc, message) => {
      return acc + encode(message.content).length;
    }, 0);
    setTotalTokens(totalTokens);
  }, [messages]);

  const handleFormSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedChat) return;

    handleSubmit(event, {
      body: {
        id: selectedChat.id,
        notebook_id: notebookId,
        llm_name: selectedModel
      }
    });
  }, [selectedChat, handleSubmit, notebookId, selectedModel]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const formEvent = new Event('submit', { bubbles: true, cancelable: true }) as unknown as React.FormEvent<HTMLFormElement>;
      handleFormSubmit(formEvent);
    }
  }, [handleFormSubmit]);

  const handleDeleteChat = useCallback(async () => {
    if (!selectedChat) return;

    try {
      const response = await fetch(`/api/notebooks/${notebookId}/chats/${selectedChat.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete chat');
      }

      toast({
        title: "Success",
        description: "Chat deleted successfully",
      });

      window.location.reload();
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete chat. Please try again.",
      });
    }
  }, [selectedChat, notebookId, toast]);

  return (
    <div className="border-l border-border flex-1">
      <div className="flex h-full flex-col">
        <ChatHeader 
          totalTokens={totalTokens}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          onDeleteChat={handleDeleteChat}
          canDelete={!!selectedChat}
        />

        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 overscroll-none"
          style={{ overflowAnchor: 'none' }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No messages yet. Start a conversation!
            </div>
          ) : (
            <MessagesList
              messages={messages}
              isGenerating={isGenerating}
              messagesEndRef={messagesEndRef}
              notebookId={notebookId}
            />
          )}
        </div>

        <ChatInputForm
          input={input}
          onInputChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onSubmit={handleFormSubmit}
          isDisabled={!selectedChat || isGenerating}
          isGenerating={isGenerating}
          onStop={stop}
        />
      </div>
    </div>
  )
}


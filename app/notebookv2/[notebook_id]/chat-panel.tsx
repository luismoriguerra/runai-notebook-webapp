"use client"

import { useState, useEffect, useRef } from "react"
import { Send, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { ChatMessage } from "./chat-message"
import { useNotebookChat } from "@/app/providers/chat-provider"
import { useParams } from "next/navigation"
import { useChat } from 'ai/react'
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { modelCategories } from '@/server/infrastructure/ai/llm-providers'
import { EnhancedTextarea } from "@/components/enhanced-textarea"
import { encode } from "gpt-tokenizer"

interface AIProviderError {
  finishReason?: string;
  message?: string;
  usage?: {
    promptTokens: number | null;
    completionTokens: number | null;
  };
}

interface ChatMessageType {
  id?: string
  role: "user" | "assistant"
  content: string
  title?: string
  sourceCount?: number
}

const llmCategories = modelCategories.map((model) => ({ value: model, label: model }));

export function ChatPanel() {
  const [isLoading, setIsLoading] = useState(true)
  const [selectedModel, setSelectedModel] = useState(llmCategories[0].value)
  const [totalTokens, setTotalTokens] = useState(0)
  const { selectedChat } = useNotebookChat()
  const params = useParams()
  const notebookId = params.notebook_id as string
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const { messages, input, handleInputChange, handleSubmit, setMessages, isLoading: isGenerating } = useChat({
    api: selectedChat ? `/api/notebooks/${notebookId}/chats/${selectedChat.id}` : undefined,
    onError: (error) => {
      console.error('Error sending message:', error);

      // Handle specific AI provider errors
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

      // Default error message for other cases
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message. Please try again.",
      });
    }
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
    // Calculate total tokens whenever messages change
    const calculateTotalTokens = () => {
      const totalTokens = messages.reduce((acc, message) => {
        return acc + encode(message.content).length;
      }, 0);
      setTotalTokens(totalTokens);
    };

    calculateTotalTokens();
  }, [messages]);

  // Reset shouldAutoScroll when user sends a new message
  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedChat) return;

    handleSubmit(event, {
      body: {
        id: selectedChat.id,
        notebook_id: notebookId,
        llm_name: selectedModel
      }
    });
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const formEvent = new Event('submit', { bubbles: true, cancelable: true }) as unknown as React.FormEvent<HTMLFormElement>;
      handleFormSubmit(formEvent);
    }
  }

  return (
    <div className="border-l border-border flex-1">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-lg font-medium">Chat</h2>
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground mr-2">
              Total Tokens: {totalTokens}
            </div>
            <Select
              value={selectedModel}
              onValueChange={setSelectedModel}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {llmCategories.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    {model.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

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
            <div className="space-y-4">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message as ChatMessageType}
                  notebookId={notebookId}
                />
              ))}
              {isGenerating && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>AI is thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        {/* show ChatTokens */}

        <form onSubmit={handleFormSubmit} className="border-t border-border p-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <EnhancedTextarea
                placeholder="Type a message..."
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={!selectedChat || isGenerating}
                className="min-h-[60px] max-h-[200px]"
                rows={3}
              />
            </div>
            <Button
              type="submit"
              disabled={!input.trim() || !selectedChat || isGenerating}
              className="shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}


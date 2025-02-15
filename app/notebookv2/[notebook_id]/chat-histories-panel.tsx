"use client"

import { useState, useEffect, useCallback, useMemo, memo } from "react"
import { Plus, MessageSquare } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useParams } from "next/navigation"
import { useNotebookChat } from "@/app/providers/chat-provider"
import { cn } from "@/lib/utils"
import { defaultCategory } from "@/server/infrastructure/ai/llm-providers"

interface Chat {
  id: string
  user_id: string
  notebook_id: string
  llm_name: string
  messages: string
  created_at: string
  updated_at: string
}

interface ChatItemProps {
  chat: Chat
  isSelected: boolean
  onSelect: (chat: Chat) => void
}

const ChatItem = memo(({ chat, isSelected, onSelect }: ChatItemProps) => {
  const messages = useMemo(() => JSON.parse(chat.messages), [chat.messages])
  const lastMessage = useMemo(() => 
    messages[messages.length - 1]?.content || 'New chat'
  , [messages])

  const handleClick = useCallback(() => {
    onSelect(chat)
  }, [chat, onSelect])

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer",
        isSelected && "bg-muted"
      )}
      onClick={handleClick}
    >
      <MessageSquare className="h-5 w-5 mt-1 text-muted-foreground" />
      <div className="flex-1 overflow-hidden">
        <h3 className="font-medium text-sm truncate">
          {messages.length > 0 ? messages[0].content.slice(0, 30) + '...' : 'New Chat'}
        </h3>
        <p className="text-xs text-muted-foreground truncate">{lastMessage}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {new Date(chat.created_at).toLocaleDateString()}
        </p>
      </div>
    </div>
  )
})
ChatItem.displayName = 'ChatItem'

export const ChatHistoriesPanel = memo(function ChatHistoriesPanel() {
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)
  const params = useParams()
  const notebookId = params.notebook_id as string
  const { selectedChat, setSelectedChat } = useNotebookChat()

  const loadChats = useCallback(async () => {
    try {
      const response = await fetch(`/api/notebooks/${notebookId}/chats`)
      if (!response.ok) throw new Error('Failed to load chats')
      const data = await response.json()
      setChats(data)
      if (data.length > 0 && !selectedChat) {
        setSelectedChat(data[0])
      }
    } catch (error) {
      console.error('Error loading chats:', error)
    } finally {
      setLoading(false)
    }
  }, [notebookId, selectedChat, setSelectedChat])

  useEffect(() => {
    loadChats()
  }, [loadChats])

  const createNewChat = useCallback(async () => {
    try {
      const response = await fetch(`/api/notebooks/${notebookId}/chats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          llm_name: defaultCategory,
          messages: JSON.stringify([]),
        }),
      })
      if (!response.ok) throw new Error('Failed to create chat')
      const newChat = await response.json()
      setChats(prevChats => [newChat, ...prevChats])
      setSelectedChat(newChat)
    } catch (error) {
      console.error('Error creating chat:', error)
    }
  }, [notebookId, setSelectedChat])

  const handleChatSelect = useCallback((chat: Chat) => {
    setSelectedChat({ ...chat })
  }, [setSelectedChat])

  const renderedChats = useMemo(() => {
    if (loading) {
      return <div className="text-sm text-muted-foreground">Loading chats...</div>
    }

    if (chats.length === 0) {
      return <div className="text-sm text-muted-foreground">No chats yet</div>
    }

    return chats.map((chat) => (
      <ChatItem
        key={chat.id}
        chat={chat}
        isSelected={selectedChat?.id === chat.id}
        onSelect={handleChatSelect}
      />
    ))
  }, [chats, loading, selectedChat?.id, handleChatSelect])

  const buttonContent = useMemo(() => (
    <>
      <Plus className="h-4 w-4" />
      New Chat
    </>
  ), [])

  return (
    <div className="border-r border-border">
      <div className="p-4">
        <h2 className="text-lg font-medium">Chat Histories</h2>
      </div>
      <div className="p-4 pt-0">
        <Button
          variant="outline"
          className="w-full justify-start gap-2 mb-4"
          onClick={createNewChat}
        >
          {buttonContent}
        </Button>
        <div className="space-y-2">
          {renderedChats}
        </div>
      </div>
    </div>
  )
})


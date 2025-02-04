"use client"

import { useState, useEffect } from "react"
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

export function ChatHistoriesPanel() {
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)
  const params = useParams()
  const notebookId = params.notebook_id as string
  const { selectedChat, setSelectedChat } = useNotebookChat()

  useEffect(() => {
    const loadChats = async () => {
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
    }
    loadChats()
  }, [notebookId, selectedChat, setSelectedChat])

  const createNewChat = async () => {
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
      setChats([newChat, ...chats])
      setSelectedChat(newChat)
    } catch (error) {
      console.error('Error creating chat:', error)
    }
  }

  return (
    <div className="border-r border-border ">
      <div className="p-4">
        <h2 className="text-lg font-medium">Chat Histories</h2>
      </div>
      <div className="p-4 pt-0">
        <Button
          variant="outline"
          className="w-full justify-start gap-2 mb-4"
          onClick={createNewChat}
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
        <div className="space-y-2">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading chats...</div>
          ) : chats.length === 0 ? (
            <div className="text-sm text-muted-foreground">No chats yet</div>
          ) : (
            chats.map((chat) => {
              const messages = JSON.parse(chat.messages)
              const lastMessage = messages[messages.length - 1]?.content || 'New chat'
              const isSelected = selectedChat?.id === chat.id
              return (
                <div
                  key={chat.id}
                  className={cn(
                    "flex items-start gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer",
                    isSelected && "bg-muted"
                  )}
                  onClick={() => {
                    setSelectedChat({ ...chat })
                  }}
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
          )}
        </div>
      </div>
    </div>
  )
}


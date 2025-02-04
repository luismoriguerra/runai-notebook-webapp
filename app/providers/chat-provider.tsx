"use client"

import { createContext, useContext, useState, ReactNode } from 'react'

interface Chat {
  id: string
  user_id: string
  notebook_id: string
  llm_name: string
  messages: string
  created_at: string
  updated_at: string
}

interface ChatContextType {
  selectedChat: Chat | null
  setSelectedChat: (chat: Chat | null) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)

  return (
    <ChatContext.Provider value={{ selectedChat, setSelectedChat }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useNotebookChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
} 
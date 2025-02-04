"use client"

import { ReactNode } from 'react'
import { ChatProvider } from '@/app/providers/chat-provider'

export function NotebookClientWrapper({ children }: { children: ReactNode }) {
  return (
    <ChatProvider>
      {children}
    </ChatProvider>
  )
} 
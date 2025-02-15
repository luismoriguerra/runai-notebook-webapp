"use client"

import { Copy, Save } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import { nanoid } from 'nanoid'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import { CollapsibleDiv } from '@/components/ui/collapsible-div'

interface ChatMessageProps {
  message: {
    id?: string
    role: "user" | "assistant"
    content: string
    title?: string
    sourceCount?: number
    reasoning?: string
  }
  notebookId: string
}

export function ChatMessage({ message, notebookId }: ChatMessageProps) {
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const reasoningRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reasoningRef.current) {
      reasoningRef.current.scrollTop = reasoningRef.current.scrollHeight
    }
  }, [message.reasoning])

  const handleSaveNote = useCallback(async () => {
    if (!message.content) return
    setIsSaving(true)
    try {
      const response = await fetch(`/api/notebooks/${notebookId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notebookId,
          chatId: message.id || nanoid(),
          title: message.title || 'Untitled Note',
          url: `/notebooks/${notebookId}/notes/${nanoid()}`,
          content: message.content
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save note')
      }

      toast({
        title: "Success",
        description: "Note saved successfully",
      })
    } catch (error) {
      console.error('Error saving note:', error)
      toast({
        title: "Error",
        description: "Failed to save note",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }, [message.content, message.id, message.title, notebookId, toast])

  const handleCopy = useCallback(() => {
    if (!message.content) return
    navigator.clipboard.writeText(message.content)
    toast({
      title: "Success",
      description: "Copied to clipboard",
    })
  }, [message.content, toast])

  const userMessageContent = useMemo(() => {
    if (message.role === "user") {
      return (
        <div className="flex justify-end">
          <div className="rounded-lg px-4 py-2 max-w-[80%] ">
            <CollapsibleDiv variant="white">
              <div className="pr-5">
                {message.content}
              </div>
            </CollapsibleDiv>
          </div>
        </div>
      )
    }
    return null
  }, [message.role, message.content])

  const assistantMessageHeader = useMemo(() => {
    if (message.title) {
      return (
        <div className="flex items-center justify-between border-b border-border p-2">
          <h3 className="font-medium">{message.title}</h3>
          {message.sourceCount && (
            <span className="text-xs text-muted-foreground">
              {message.sourceCount} sources
            </span>
          )}
        </div>
      )
    }
    return null
  }, [message.title, message.sourceCount])

  const reasoningSection = useMemo(() => {
    if (message.reasoning) {
      return (
        <div className="border-b border-border bg-zinc-950/10 dark:bg-zinc-50/5 px-4 py-3">
          <div className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-blue-500"></div>
            Reasoning
          </div>
          <div 
            ref={reasoningRef}
            className="text-sm whitespace-pre-wrap text-secondary-foreground h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-secondary scrollbar-track-transparent pr-2 rounded-md bg-background/80 p-3 shadow-sm"
          >
            {message.reasoning}
          </div>
        </div>
      )
    }
    return null
  }, [message.reasoning])

  const actionButtons = useMemo(() => (
    <div className="flex items-center gap-2 border-t border-border p-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSaveNote}
        disabled={isSaving}
      >
        <Save className="h-4 w-4 mr-2" />
        {isSaving ? 'Saving...' : 'Save as Note'}
      </Button>
      <Button variant="ghost" size="sm" onClick={handleCopy}>
        <Copy className="h-4 w-4 mr-2" />
        Copy
      </Button>
    </div>
  ), [handleSaveNote, handleCopy, isSaving])

  if (message.role === "user") {
    return userMessageContent
  }

  return (
    <div className="flex flex-col rounded-lg bg-muted max-w-[80%]">
      <CollapsibleDiv>
        {assistantMessageHeader}
        {reasoningSection}
        <div className="p-4">
          <MarkdownRenderer content={message.content} />
        </div>
        {actionButtons}
      </CollapsibleDiv>
    </div>
  )
}


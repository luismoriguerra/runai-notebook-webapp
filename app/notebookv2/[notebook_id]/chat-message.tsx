"use client"

import { Copy, Save } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useState } from "react"
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

  const handleSaveNote = async () => {
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
  }

  const handleCopy = () => {
    if (!message.content) return
    navigator.clipboard.writeText(message.content)
    toast({
      title: "Success",
      description: "Copied to clipboard",
    })
  }

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

  return (
    <div className="flex flex-col rounded-lg bg-muted max-w-[80%]">
      <CollapsibleDiv>
        {message.title && (
          <div className="flex items-center justify-between border-b border-border p-2">
            <h3 className="font-medium">{message.title}</h3>
            {message.sourceCount && (
              <span className="text-xs text-muted-foreground">
                {message.sourceCount} sources
              </span>
            )}
          </div>
        )}
        {message.reasoning && <pre>{message.reasoning}</pre>}
        <div className="p-4">
          {/* <p className="whitespace-pre-wrap">{message.content}</p> */}
          <MarkdownRenderer content={message.content} />
        </div>
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
      </CollapsibleDiv>
    </div>
  )
}


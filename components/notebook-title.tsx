"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

interface NotebookTitleProps {
  initialTitle?: string
  notebookId: string
  description?: string
  url?: string
}

export function NotebookTitle({ initialTitle = "Untitled notebook", notebookId, description = "", url = "" }: NotebookTitleProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [title, setTitle] = React.useState(initialTitle)
  const [isUpdating, setIsUpdating] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleClick = () => {
    setIsEditing(true)
    // Focus the input on next render
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const updateTitle = async (newTitle: string) => {
    if (newTitle === initialTitle) return
    
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/notebooks/${notebookId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTitle,
          description,
          url,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update notebook title")
      }

      router.refresh()
    } catch (error) {
      console.error("Error updating notebook title:", error)
      setTitle(initialTitle)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleBlur = () => {
    setIsEditing(false)
    updateTitle(title)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setIsEditing(false)
      updateTitle(title)
    }
    if (e.key === "Escape") {
      setIsEditing(false)
      setTitle(initialTitle)
    }
  }

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="max-w-[300px] h-8 text-lg font-medium"
        disabled={isUpdating}
      />
    )
  }

  return (
    <h1 
      onClick={handleClick} 
      className="text-lg font-medium cursor-pointer hover:text-muted-foreground transition-colors"
    >
      {title}
    </h1>
  )
} 
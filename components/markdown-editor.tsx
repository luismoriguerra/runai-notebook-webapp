"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import "@uiw/react-md-editor/markdown-editor.css"
import "@uiw/react-markdown-preview/markdown.css"
import { encode } from "gpt-tokenizer"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false }
)

interface MarkdownEditorProps {
  content: string
  onChange: (content: string) => void
  className?: string
  showCounts?: boolean
}

export function MarkdownEditor({
  content,
  onChange,
  className,
  showCounts = true,
}: MarkdownEditorProps) {
  const [mounted, setMounted] = useState(false)
  const [charCount, setCharCount] = useState(0)
  const [tokenCount, setTokenCount] = useState(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setCharCount(content.length)
    setTokenCount(encode(content).length)
  }, [content])

  if (!mounted) {
    return null
  }

  return (
    <div className="space-y-2">
      <div data-color-mode="dark" className={className}>
        <MDEditor
          value={content}
          onChange={(value) => onChange(value || "")}
          preview="edit"
          height={500}
        />
      </div>
      {showCounts && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-xs text-muted-foreground text-right">
                {charCount} / {tokenCount}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{charCount} characters / {tokenCount} tokens</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
} 
"use client"

import * as React from "react"
import { encode } from "gpt-tokenizer"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface EnhancedTextareaProps extends React.ComponentProps<"textarea"> {
  onKeyDown?: (e: React.KeyboardEvent) => void
  showTokenCount?: boolean
}

export function EnhancedTextarea({ 
  className,
  value,
  onChange,
  onKeyDown,
  showTokenCount = true,
  ...props 
}: EnhancedTextareaProps) {
  const [tokenCount, setTokenCount] = React.useState(0)
  const [charCount, setCharCount] = React.useState(0)

  React.useEffect(() => {
    if (typeof value === 'string') {
      setCharCount(value.length)
      setTokenCount(encode(value).length)
    }
  }, [value])

  return (
    <div className="relative">
      <Textarea
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        className={cn("pr-20", className)}
        {...props}
      />
      {showTokenCount && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute bottom-2 right-2 text-xs text-muted-foreground pr-5">
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
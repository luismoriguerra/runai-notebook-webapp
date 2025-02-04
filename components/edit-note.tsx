"use client"

import { useState, useEffect } from "react"
import { X, Trash2, Sparkles, Plus, Wand2, Tags, Split, FileText, History, ChevronDown, List, Pen, Minimize2, TimerIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MarkdownEditor } from "@/components/markdown-editor"
import { useToast } from "@/hooks/use-toast"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { models } from "@/server/infrastructure/ai/llm-providers"
import { useTimer } from "@/hooks/use-timer"

interface Note {
  id: string
  title: string
  content: string
  url: string
  type?: "study" | "briefing" | "faq" | "timeline"
  created_at: string
  updated_at: string
}

interface ContentHistory {
  content: string
  timestamp: number
  action: AIAction
}

type AIAction = (typeof AI_ACTIONS)[number]['id'] | 'custom' | 'initial' | null;

interface EditNoteProps {
  notebookId: string
  note?: Note | null
  onClose: () => void
  onSave: (note: Note) => void
  onDelete?: () => void
}

const AI_ACTIONS = [
  {
    id: 'bulletPoints',
    label: 'To Bullet Points',
    loadingLabel: 'Converting...',
    icon: List,
    prompt: "convert this content into a well-structured bullet point format, maintaining the hierarchy and relationships between ideas"
  },
  {
    id: 'optimizeTokens',
    label: 'Optimize Tokens',
    loadingLabel: 'Optimizing...',
    icon: Minimize2,
    prompt: "rewrite this content to be more concise and token-efficient while preserving all key information. Remove redundancies and use precise language."
  },
  {
    id: 'metadata',
    label: 'Generate Metadata',
    loadingLabel: 'Generating...',
    icon: Tags,
    prompt: "analyze this content and generate relevant metadata including key topics, summary, and tags"
  },
  {
    id: 'improveWriting',
    label: 'Improve Writing',
    loadingLabel: 'Improving...',
    icon: Pen,
    prompt: "improve the writing style, grammar, and clarity while maintaining the original meaning. Make it more professional and engaging."
  },
  {
    id: 'simplify',
    label: 'Simplify Note',
    loadingLabel: 'Simplifying...',
    icon: Wand2,
    prompt: "simplify this content and make it easier to understand while keeping the main points"
  },
  {
    id: 'increment',
    label: 'Augment Content',
    loadingLabel: 'Incrementing...',
    icon: Plus,
    prompt: "augment the content of the note with additional relevant information"
  },
  {
    id: 'improve',
    label: 'Improve Note',
    loadingLabel: 'Improving...',
    icon: Sparkles,
    prompt: "improve this content by making it more comprehensive and well-structured"
  },
  {
    id: 'summarize',
    label: 'Summarize Note',
    loadingLabel: 'Summarizing...',
    icon: FileText,
    prompt: "summarize the note"
  },
  {
    id: 'splitNote',
    label: 'Split Note',
    loadingLabel: 'Splitting...',
    icon: Split,
    prompt: "split the note into multiple notes based on the content"
  },
] as const;

export function EditNote({
  notebookId,
  note,
  onClose,
  onSave,
  onDelete
}: EditNoteProps) {
  const { toast } = useToast()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [saving, setSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState<AIAction>(null)
  const [contentHistory, setContentHistory] = useState<ContentHistory[]>([])
  const [canUndo, setCanUndo] = useState(false)
  const [selectedModel, setSelectedModel] = useState(models[0])
  const [customPrompt, setCustomPrompt] = useState("")
  const elapsedTime = useTimer(aiLoading !== null)

  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setContent(note.content)
      setContentHistory([{
        content: note.content,
        timestamp: Date.now(),
        action: 'initial'
      }])
      setCanUndo(false)
    } else {
      setTitle("")
      setContent("")
      setContentHistory([])
      setCanUndo(false)
    }
  }, [note])

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Error",
        description: "Title and content are required",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)
      if (note) {
        const response = await fetch(`/api/notebooks/${notebookId}/notes/${note.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            content,
            url: `/notebooks/${notebookId}/notes/${note.id}`,
          }),
        })
        if (!response.ok) throw new Error('Failed to update note')

        const updatedNote = await response.json()
        onSave(updatedNote)
        toast({
          title: "Success",
          description: "Note updated successfully",
        })
      } else {
        const response = await fetch(`/api/notebooks/${notebookId}/notes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            notebookId,
            chatId: "default",
            title,
            content,
            url: `/notebooks/${notebookId}/notes/new`,
          }),
        })
        if (!response.ok) throw new Error('Failed to create note')

        const newNote = await response.json()
        onSave(newNote)
        toast({
          title: "Success",
          description: "Note created successfully",
        })
      }
      onClose()
    } catch {
      toast({
        title: "Error",
        description: note ? "Failed to update note" : "Failed to create note",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleUndo = () => {
    if (contentHistory.length > 1) {
      const previousState = contentHistory[contentHistory.length - 2]
      setContent(previousState.content)
      setContentHistory(prev => prev.slice(0, -1))
      setCanUndo(contentHistory.length > 2)

      toast({
        title: "Success",
        description: "Successfully undid last AI action",
      })
    }
  }

  const handleAiAction = async (action: AIAction) => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Note content is required for AI actions",
        variant: "destructive",
      })
      return
    }

    if (action === 'custom' || action === null) return;

    const actionConfig = AI_ACTIONS.find(a => a.id === action);
    if (!actionConfig) return;

    try {
      setAiLoading(action)

      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          llm_name: selectedModel,
          prompt: actionConfig.prompt,
          note_content: content
        }),
      })

      if (!response.ok) {
        throw new Error('AI request failed')
      }

      const result = await response.json()

      setContentHistory(prev => [...prev, {
        content,
        timestamp: Date.now(),
        action
      }])

      const newContent = `${content}\n\n### AI ${actionConfig.label} Response:\n${result.content}`
      setContent(newContent)
      setCanUndo(true)

      toast({
        title: "Success",
        description: `Successfully applied ${actionConfig.label.toLowerCase()}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to apply ${actionConfig.label.toLowerCase()}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
    } finally {
      setAiLoading(null)
    }
  }

  const handleCustomAiAction = async () => {
    if (!selectedModel || !customPrompt.trim()) {
      toast({
        title: "Error",
        description: "Please select a model and enter a custom prompt",
        variant: "destructive",
      })
      return
    }

    try {
      setAiLoading('custom')

      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          llm_name: selectedModel,
          prompt: customPrompt,
          note_content: content
        }),
      })

      if (!response.ok) {
        throw new Error('AI request failed')
      }

      const result = await response.json()

      setContentHistory(prev => [...prev, {
        content,
        timestamp: Date.now(),
        action: 'custom'
      }])

      const newContent = `${content}\n\n### AI Custom Prompt Response:\n${result.content}`
      setContent(newContent)
      setCanUndo(true)

      toast({
        title: "Success",
        description: "Custom AI prompt sent successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to send custom AI prompt: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
    } finally {
      setAiLoading(null)
    }
  }

  return (
    <div className="absolute inset-0 z-10 bg-background">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-medium">{note ? 'Edit Note' : 'New Note'}</h2>
        <div className="flex items-center gap-2">
          {note && onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Custom note action */}
      <div className="p-4 border-b">
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="flex w-full justify-between">
              <span>Customize AI Action ({selectedModel})</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            <Select
              onValueChange={(value) => setSelectedModel(value)}
              defaultValue={selectedModel || models[0]}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select LLM model" />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Enter your custom prompt..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="min-h-[100px]"
            />
            <Button
              className="w-full"
              onClick={handleCustomAiAction}
              disabled={!selectedModel || !customPrompt.trim() || aiLoading !== null}
            >
              {aiLoading === 'custom' ? 'Processing...' : 'Send Custom Prompt'}
            </Button>
          </CollapsibleContent>
        </Collapsible>
      </div>


      {/* Note AI actions */}
      <div className="p-4 border-b">
        <div className="flex flex-wrap gap-2">
          {AI_ACTIONS.map(({ id, label, loadingLabel, icon: Icon }) => (
            <Button
              key={id}
              variant="secondary"
              onClick={() => handleAiAction(id)}
              disabled={aiLoading !== null}
              className="relative"
            >
              <Icon className="mr-2 h-4 w-4" />
              {aiLoading === id ? (
                <span className="flex items-center gap-2">
                  {loadingLabel}
                  <span className="flex items-center text-xs opacity-70">
                    <TimerIcon className="mr-1 h-3 w-3" />
                    {elapsedTime}s
                  </span>
                </span>
              ) : (
                label
              )}
            </Button>
          ))}
          <Button
            variant="secondary"
            onClick={handleUndo}
            disabled={!canUndo || aiLoading !== null}
          >
            <History className="mr-2 h-4 w-4" />
            Undo AI Action
          </Button>
        </div>
        {/*  */}
      </div>


      <div className="p-4 space-y-4">
        <Input
          placeholder="Note title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <MarkdownEditor
          content={content}
          onChange={setContent}
          className="min-h-[400px]"
        />
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  )
} 
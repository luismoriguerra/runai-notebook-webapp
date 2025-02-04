"use client"

import * as React from "react"
import { Trash2, FileText } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useParams } from "next/navigation"
import { MarkdownEditor } from "@/components/markdown-editor"

interface NoteEditorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialTitle?: string
  initialContent?: string
  onSave: (data: { title: string; content: string }) => void
  onDelete?: () => void
}

export function NoteEditorDialog({
  open,
  onOpenChange,
  initialTitle = "",
  initialContent = "",
  onSave,
  onDelete
}: NoteEditorDialogProps) {
  const [title, setTitle] = React.useState(initialTitle)
  const [content, setContent] = React.useState(initialContent)
  const { toast } = useToast()
  const params = useParams()
  const notebookId = params.notebook_id as string

  React.useEffect(() => {
    setTitle(initialTitle)
    setContent(initialContent)
  }, [initialTitle, initialContent])

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Error",
        description: "Title and content are required",
        variant: "destructive",
      })
      return
    }
    onSave({ title, content })
  }

  const handleConvertToSource = async () => {
    try {
      const response = await fetch(`/api/notebooks/${notebookId}/sources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          type: 'doc',
          url: `/notebooks/${notebookId}/sources/${title.toLowerCase().replace(/\s+/g, '-')}`,
        }),
      })

      if (!response.ok) throw new Error('Failed to convert note to source')

      toast({
        title: "Success",
        description: "Note converted to source successfully",
      })

      onOpenChange(false)

      if (onDelete) {
        onDelete()
      }
    } catch (error: unknown) {
      console.error('Failed to convert note to source:', error)
      toast({
        title: "Error",
        description: "Failed to convert note to source",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog 
      open={open} 
      onOpenChange={onOpenChange}
    >
      <DialogContent 
        className="sm:max-w-3xl overflow-y-auto max-h-[90vh]"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Edit Note</DialogTitle>
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white"
                onClick={() => onDelete()}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Input
              placeholder="Note title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <MarkdownEditor
            content={content}
            onChange={setContent}
            className="min-h-[400px]"
          />
          <div className="flex justify-between">
            <Button variant="secondary" className="gap-2" onClick={handleConvertToSource}>
              <FileText className="h-4 w-4" />
              Convert to source
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


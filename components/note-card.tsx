"use client"

import { Note } from "@/server/domain/notes"
import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog"
import { Copy, MoreVertical, Trash, ChevronDown, ChevronUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { MarkdownRenderer } from "./MarkdownRenderer"
import { cn } from "@/lib/utils"

interface NoteCardProps {
  note: Note
  onClick: (note: Note) => void
  onDelete: (note: Note) => void
}

export function NoteCard({ note, onClick, onDelete }: NoteCardProps) {
  const { toast } = useToast()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(note.content)
      toast({
        description: "Content copied to clipboard",
      })
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        description: "Failed to copy content" + error,
      })
    }
  }

  const handleCopyAsContext = async () => {
    try {
      const contentWithTags = `<context>${note.content}</context>`
      await navigator.clipboard.writeText(contentWithTags)
      toast({
        description: "Content copied as context to clipboard",
      })
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        description: "Failed to copy content as context" + error,
      })
    }
  }

  const handleDelete = async () => {
    try {
      onDelete(note)
      toast({
        description: "Note deleted successfully",
      })
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        description: "Failed to delete note" + error,
      })
    }
  }

  return (
    <>
      <div className="rounded-lg bg-gray-800/50 p-4 cursor-pointer hover:bg-gray-800 transition-colors group">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-medium mb-1">{note.title}</h3>
            <div className={cn("relative", !isExpanded && "max-h-[3em] overflow-hidden")}>
              <MarkdownRenderer content={note.content} className="text-sm text-gray-400" />
              {!isExpanded && (
                <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-gray-800/50 to-transparent" />
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 h-6 text-xs text-gray-400 hover:text-gray-300"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  Show more
                </>
              )}
            </Button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onClick(note)}>
                <Copy className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopy}>
                <Copy className="mr-2 h-4 w-4" />
                Copy content
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyAsContext}>
                <Copy className="mr-2 h-4 w-4" />
                Copy as context
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)}>
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this note?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the note.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 
"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Plus, MoreVertical } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useParams } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { NoteCard } from "@/components/note-card"
import { EditNote } from "@/components/edit-note"
import { memo } from 'react'

interface Note {
  id: string
  title: string
  content: string
  url: string
  type?: "study" | "briefing" | "faq" | "timeline"
  created_at: string
  updated_at: string
}

// Memoized NoteCard component
const MemoizedNoteCard = memo(NoteCard)
// Memoized EditNote component
const MemoizedEditNote = memo(EditNote)

export function NotesPanel() {
  const { toast } = useToast()
  const params = useParams()
  const notebookId = params.notebook_id as string
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/notebooks/${notebookId}/notes`)
      if (!response.ok) throw new Error('Failed to fetch notes')
      const data = await response.json()
      setNotes(data)
    } catch {
      toast({
        title: "Error",
        description: "Failed to load notes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [notebookId, toast])

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  const handleAddNote = useCallback(() => {
    setEditingNote(null)
    setEditorOpen(true)
  }, [])

  const handleEditNote = useCallback((note: Note) => {
    setEditingNote(note)
    setEditorOpen(true)
  }, [])

  const handleCloseEditor = useCallback(() => {
    setEditorOpen(false)
    setEditingNote(null)
  }, [])

  const handleSaveNote = useCallback((savedNote: Note) => {
    setNotes(prevNotes => {
      if (editingNote) {
        return prevNotes.map(note =>
          note.id === editingNote.id ? savedNote : note
        )
      }
      return [savedNote, ...prevNotes]
    })
  }, [editingNote])

  const handleDeleteClick = useCallback(() => {
    setDeleteDialogOpen(true)
  }, [])

  const handleDeleteNote = useCallback(async (note: Note) => {
    try {
      const response = await fetch(`/api/notebooks/${notebookId}/notes/${note.id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete note')

      setNotes(prevNotes => prevNotes.filter(n => n.id !== note.id))
      toast({
        description: "Note deleted successfully",
      })
    } catch {
      toast({
        description: "Failed to delete note",
        variant: "destructive",
      })
    }
  }, [notebookId, toast])

  const handleDeleteConfirm = useCallback(async () => {
    if (!editingNote) return
    await handleDeleteNote(editingNote)
    setEditorOpen(false)
    setDeleteDialogOpen(false)
  }, [editingNote, handleDeleteNote])

  // Memoize the notes list rendering
  const notesList = useMemo(() => {
    if (loading) {
      return <div className="text-center py-4 text-sm text-gray-500">Loading notes...</div>
    }
    if (notes.length === 0) {
      return <div className="text-center py-4 text-sm text-gray-500">No notes yet</div>
    }
    return notes.map((note) => (
      <MemoizedNoteCard
        key={note.id}
        note={note}
        onClick={handleEditNote}
        onDelete={handleDeleteNote}
      />
    ))
  }, [notes, loading, handleEditNote, handleDeleteNote])

  return (
    <>
      <div className="relative">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-medium">Studio</h2>
        </div>
        {editorOpen ? (
          <MemoizedEditNote
            notebookId={notebookId}
            note={editingNote}
            onClose={handleCloseEditor}
            onSave={handleSaveNote}
            onDelete={handleDeleteClick}
          />
        ) : (
          <div className="p-4 pt-0">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">Notes</h2>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={fetchNotes}
                    disabled={loading}
                  >
                    <svg
                      className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={handleAddNote}
                >
                  <Plus className="h-4 w-4" />
                  Add note
                </Button>
              </div>
              <div className="mt-4 space-y-2">
                {notesList}
              </div>
            </div>
          </div>
        )}
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
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}


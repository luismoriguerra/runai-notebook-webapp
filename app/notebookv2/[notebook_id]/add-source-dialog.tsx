"use client"

import * as React from "react"
import { Upload, X, FileText, Youtube, Globe, Copy, HardDriveIcon as Drive } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface AddSourceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddSourceDialog({ open, onOpenChange }: AddSourceDialogProps) {
  const [dragActive, setDragActive] = React.useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    // Handle file drop
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-background border-border">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gray-800" />
              <span className="text-xl font-semibold">NotebookLM</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogTitle className="text-2xl font-semibold">Add sources</DialogTitle>
          <DialogDescription className="text-gray-400">
            Sources let NotebookLM base its responses on the information that matters most to you.
            <br />
            (Examples: marketing plans, course reading, research notes, meeting transcripts, sales documents, etc.)
          </DialogDescription>
        </DialogHeader>
        <div
          className={`
            mt-4 border-2 border-dashed rounded-lg p-8
            ${dragActive ? 'border-primary' : 'border-border'}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center text-center">
            <Upload className="h-12 w-12 mb-4 text-blue-500" />
            <h3 className="text-xl font-semibold mb-2">Upload sources</h3>
            <p className="text-gray-400 mb-4">
              Drag & drop or{" "}
              <button className="text-blue-500 hover:underline">choose file</button>{" "}
              to upload
            </p>
            <p className="text-sm text-gray-500">
              Supported file types: PDF, .txt, Markdown, Audio (e.g. mp3)
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Drive className="h-5 w-5" />
              <span className="font-medium">Google Drive</span>
            </div>
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <FileText className="h-4 w-4" />
                Google Docs
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <FileText className="h-4 w-4" />
                Google Slides
              </Button>
            </div>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-5 w-5" />
              <span className="font-medium">Link</span>
            </div>
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Globe className="h-4 w-4" />
                Website
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Youtube className="h-4 w-4" />
                YouTube
              </Button>
            </div>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5" />
              <span className="font-medium">Paste text</span>
            </div>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Copy className="h-4 w-4" />
              Copied text
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-4">
          <FileText className="h-5 w-5 text-gray-400" />
          <div className="flex-1">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-400">Source limit</span>
              <span className="text-gray-400">3 / 50</span>
            </div>
            <Progress value={6} className="h-1" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


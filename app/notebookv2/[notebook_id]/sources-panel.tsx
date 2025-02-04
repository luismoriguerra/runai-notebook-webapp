"use client"

import { useState } from "react"
import { Plus, ChevronLeft, ChevronRight, FileText, Layout, Link2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { AddSourceDialog } from "./add-source-dialog"

interface Source {
  id: string
  name: string
  checked: boolean
  type: 'doc' | 'app' | 'link'
  icon: React.ReactNode
}

export function SourcesPanel() {
  const [sources, setSources] = useState<Source[]>([
    {
      id: '1',
      name: 'Milvus Deployment Options',
      checked: true,
      type: 'doc',
      icon: <FileText className="h-4 w-4 text-blue-400" />
    },
    {
      id: '2',
      name: 'Sizing apps',
      checked: true,
      type: 'app',
      icon: <Layout className="h-4 w-4 text-green-400" />
    },
    {
      id: '3',
      name: 'https://milvus.io/docs/install-o...',
      checked: true,
      type: 'link',
      icon: <Link2 className="h-4 w-4 text-purple-400" />
    }
  ])
  const [collapsed, setCollapsed] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  const toggleSource = (id: string) => {
    setSources(sources.map(source =>
      source.id === id ? { ...source, checked: !source.checked } : source
    ))
  }

  const toggleAll = (checked: boolean) => {
    setSources(sources.map(source => ({ ...source, checked })))
  }

  return (
    <>
      <div className={`border-r border-border transition-all ${collapsed ? "w-12" : "w-full md:w-[250px]"
        } ${collapsed ? "hidden md:block" : ""
        }`}>
        <div className="flex items-center justify-between p-4">
          {!collapsed && <h2 className="text-lg font-medium">Sources</h2>}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
        {!collapsed && (
          <div className="p-4 pt-0">
            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => setDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Add source
              </Button>
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-2">
                  <Checkbox
                    checked={sources.every(s => s.checked)}
                    onCheckedChange={(checked) => toggleAll(!!checked)}
                  />
                  <span className="text-sm text-gray-400">Select all sources</span>
                </div>
                {sources.map((source) => (
                  <div key={source.id} className="flex items-center gap-2 px-2">
                    <Checkbox
                      checked={source.checked}
                      onCheckedChange={() => toggleSource(source.id)}
                    />
                    <span className="text-sm flex items-center gap-2">
                      {source.icon}
                      {source.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <AddSourceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  )
}


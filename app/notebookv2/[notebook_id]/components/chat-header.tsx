import { memo } from 'react'
import { Trash2 } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { modelCategories } from '@/server/infrastructure/ai/llm-providers'

const llmCategories = modelCategories.map((model) => ({ value: model, label: model }));

interface ChatHeaderProps {
  totalTokens: number;
  selectedModel: string;
  onModelChange: (value: string) => void;
  onDeleteChat?: () => void;
  canDelete?: boolean;
}

export const ChatHeader = memo(({ totalTokens, selectedModel, onModelChange, onDeleteChat, canDelete = false }: ChatHeaderProps) => (
  <div className="flex items-center justify-between border-b border-border p-4">
    <h2 className="text-lg font-medium">Chat</h2>
    <div className="flex items-center gap-2">
      <div className="text-sm text-muted-foreground mr-2">
        Total Tokens: {totalTokens}
      </div>
      <Select value={selectedModel} onValueChange={onModelChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
        <SelectContent>
          {llmCategories.map((model) => (
            <SelectItem key={model.value} value={model.value}>
              {model.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {canDelete && onDeleteChat && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Chat</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this chat? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDeleteChat}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  </div>
));

ChatHeader.displayName = 'ChatHeader'; 
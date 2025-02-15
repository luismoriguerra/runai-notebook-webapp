import { memo } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { modelCategories } from '@/server/infrastructure/ai/llm-providers'

const llmCategories = modelCategories.map((model) => ({ value: model, label: model }));

interface ChatHeaderProps {
  totalTokens: number;
  selectedModel: string;
  onModelChange: (value: string) => void;
}

export const ChatHeader = memo(({ totalTokens, selectedModel, onModelChange }: ChatHeaderProps) => (
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
    </div>
  </div>
));

ChatHeader.displayName = 'ChatHeader'; 
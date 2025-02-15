import { memo } from 'react'
import { Send } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { EnhancedTextarea } from "@/components/enhanced-textarea"

interface ChatInputFormProps {
  input: string;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isDisabled: boolean;
  isGenerating: boolean;
  onStop: () => void;
}

export const ChatInputForm = memo(({ 
  input, 
  onInputChange, 
  onKeyDown, 
  onSubmit, 
  isDisabled,
  isGenerating,
  onStop
}: ChatInputFormProps) => (
  <form onSubmit={onSubmit} className="border-t border-border p-4">
    <div className="flex gap-2">
      <div className="flex-1">
        <EnhancedTextarea
          placeholder="Type a message..."
          value={input}
          onChange={onInputChange}
          onKeyDown={onKeyDown}
          disabled={isDisabled}
          className="min-h-[60px] max-h-[200px]"
          rows={3}
        />
      </div>
      {isGenerating ? (
        <Button
          type="button"
          variant="destructive"
          onClick={onStop}
          className="shrink-0"
        >
          Stop
        </Button>
      ) : (
        <Button
          type="submit"
          disabled={!input.trim() || isDisabled}
          className="shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      )}
    </div>
  </form>
));

ChatInputForm.displayName = 'ChatInputForm'; 
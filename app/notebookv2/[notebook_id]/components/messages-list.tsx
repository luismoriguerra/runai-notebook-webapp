import { memo } from 'react'
import { Message } from 'ai'
import { Loader2 } from 'lucide-react'
import { ChatMessage } from '../chat-message'
import { ChatMessageType } from './types'

interface MessagesListProps {
  messages: Message[];
  isGenerating: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  notebookId: string;
}

export const MessagesList = memo(({ messages, isGenerating, messagesEndRef, notebookId }: MessagesListProps) => (
  <div className="space-y-4">
    {messages.map((message) => (
      <ChatMessage
        key={message.id}
        message={message as ChatMessageType}
        notebookId={notebookId}
      />
    ))}
    {isGenerating && (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>AI is thinking...</span>
      </div>
    )}
    <div ref={messagesEndRef} />
  </div>
));

MessagesList.displayName = 'MessagesList'; 
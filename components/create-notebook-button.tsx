'use client';

import { Button } from "@/components/ui/button";
import { defaultCategory } from "@/server/infrastructure/ai/llm-providers";
import { Plus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreateNotebookButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateNotebook = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/notebooks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'untitled notebook',
          description: ' no description',
          url: 'no link',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create notebook');
      }

      const notebook = await response.json();
      
      // Create initial chat for the notebook
      const chatResponse = await fetch(`/api/notebooks/${notebook.id}/chats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notebook_id: notebook.id,
          llm_name: defaultCategory,
          messages: '[]'
        }),
      });

      if (!chatResponse.ok) {
        throw new Error('Failed to create initial chat');
      }

      router.push(`/notebookv2/${notebook.id}`);
    } catch (error) {
      console.error('Error creating notebook:', error);
      setIsLoading(false);
    }
  };

  return (
    <Button className="gap-2" onClick={handleCreateNotebook} disabled={isLoading}>
      {isLoading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Plus size={16} />
      )}
      {isLoading ? "Creating..." : "Create new"}
    </Button>
  );
} 
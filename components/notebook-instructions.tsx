'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NotebookInstructionsProps {
  notebookId: string;
  initialInstructions?: string;
}

export function NotebookInstructions({ notebookId, initialInstructions = '' }: NotebookInstructionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [instructions, setInstructions] = useState(initialInstructions);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/notebooks/${notebookId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instructions }),
      });

      if (!response.ok) {
        throw new Error('Failed to update instructions');
      }

      toast({
        title: "Success",
        description: "Instructions updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update instructions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <div className="flex items-center justify-between">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            Instructions
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="space-y-2">
        <Textarea
          placeholder="Add instructions for this notebook..."
          className="min-h-[100px] w-full"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
        />
        <Button 
          onClick={handleSave} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Saving...' : 'Save Instructions'}
        </Button>
      </CollapsibleContent>
    </Collapsible>
  );
} 
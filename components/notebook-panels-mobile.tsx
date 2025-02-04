'use client'

import { ChatHistoriesPanel } from "@/app/notebookv2/[notebook_id]/chat-histories-panel";
import { ChatPanel } from "@/app/notebookv2/[notebook_id]/chat-panel";
import { NotesPanel } from "@/app/notebookv2/[notebook_id]/notes-panel";
import { useNotebookChat } from "@/app/providers/chat-provider";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { MessageSquare, Columns, StickyNote } from "lucide-react";
import { useEffect, useState } from "react";

export function NotebookPanelsMobile() {
    const [activeTab, setActiveTab] = useState("chat");
    const isMobile = useIsMobile();
    const { selectedChat } = useNotebookChat();

    useEffect(() => {
        if (selectedChat) {
            setActiveTab("chat");
        }
        // console.log('selectedChat?.id', selectedChat?.id);
    }, [selectedChat?.id]);

    if (isMobile) {
        return (
            <div className="flex flex-col h-full">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="history" className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            History
                        </TabsTrigger>
                        <TabsTrigger value="chat" className="flex items-center gap-2">
                            <Columns className="h-4 w-4" />
                            Chat
                        </TabsTrigger>
                        <TabsTrigger value="notes" className="flex items-center gap-2">
                            <StickyNote className="h-4 w-4" />
                            Notes
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="history" className="flex-1 overflow-y-auto m-0">
                        <ChatHistoriesPanel />
                    </TabsContent>
                    <TabsContent value="chat" className="flex-1 overflow-y-auto m-0">
                        <ChatPanel />
                    </TabsContent>
                    <TabsContent value="notes" className="flex-1 overflow-y-auto m-0">
                        <NotesPanel />
                    </TabsContent>
                </Tabs>
            </div>
        );
    }

    return null;
}
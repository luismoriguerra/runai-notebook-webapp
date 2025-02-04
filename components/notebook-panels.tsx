'use client';

import { ChatHistoriesPanel } from "@/app/notebookv2/[notebook_id]/chat-histories-panel";
import { ChatPanel } from "@/app/notebookv2/[notebook_id]/chat-panel";
import { NotesPanel } from "@/app/notebookv2/[notebook_id]/notes-panel";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "./ui/resizable";
import { ImperativePanelHandle } from "react-resizable-panels";
import { Button } from "./ui/button";
import { useRef, useState } from "react";
import { Columns, MessageSquare, StickyNote } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

import { NotebookPanelsMobile } from "./notebook-panels-mobile";

export function NotebookPanels() {
    const isMobile = useIsMobile();
    const historyPanelRef = useRef<ImperativePanelHandle>(null);
    const chatPanelRef = useRef<ImperativePanelHandle>(null);
    const notesPanelRef = useRef<ImperativePanelHandle>(null);

    const [isHistoryVisible, setIsHistoryVisible] = useState(true);
    const [isChatVisible, setIsChatVisible] = useState(true);
    const [isNotesVisible, setIsNotesVisible] = useState(true);

    const togglePanel = (ref: React.RefObject<ImperativePanelHandle>, isVisible: boolean, setVisible: (value: boolean) => void) => {
        const panel = ref.current;
        if (panel) {
            if (isVisible) {
                panel.collapse();
            } else {
                panel.expand();
            }
            setVisible(!isVisible);
        }
    };

    if (isMobile) {
        return (
            <NotebookPanelsMobile />
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex gap-2 p-2 border-b">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => togglePanel(historyPanelRef, isHistoryVisible, setIsHistoryVisible)}
                    className={!isHistoryVisible ? "opacity-50" : ""}
                >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    History
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => togglePanel(chatPanelRef, isChatVisible, setIsChatVisible)}
                    className={!isChatVisible ? "opacity-50" : ""}
                >
                    <Columns className="h-4 w-4 mr-1" />
                    Chat
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => togglePanel(notesPanelRef, isNotesVisible, setIsNotesVisible)}
                    className={!isNotesVisible ? "opacity-50" : ""}
                >
                    <StickyNote className="h-4 w-4 mr-1" />
                    Notes
                </Button>
            </div>

            <ResizablePanelGroup direction="horizontal" className="flex-1">
                <ResizablePanel
                    ref={historyPanelRef}
                    collapsible={true}
                    defaultSize={12}
                    minSize={12}
                    className="h-full"
                    onCollapse={() => setIsHistoryVisible(false)}
                    onExpand={() => setIsHistoryVisible(true)}
                >
                    <div className="h-full overflow-y-auto">
                        <ChatHistoriesPanel />
                    </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel
                    ref={chatPanelRef}
                    collapsible={true}
                    defaultSize={50}
                    minSize={30}
                    className="h-full"
                    onCollapse={() => setIsChatVisible(false)}
                    onExpand={() => setIsChatVisible(true)}
                >
                    <div className="h-full overflow-y-auto">
                        <ChatPanel />
                    </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel
                    ref={notesPanelRef}
                    collapsible={true}
                    defaultSize={30}
                    minSize={20}
                    className="h-full"
                    onCollapse={() => setIsNotesVisible(false)}
                    onExpand={() => setIsNotesVisible(true)}
                >
                    <div className="h-full overflow-y-auto">
                        <NotesPanel />
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    )
}
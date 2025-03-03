
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, PlusCircle } from "lucide-react";
import { ConversationThread } from "@/types/conversation";

interface ConversationThreadsProps {
  threads: ConversationThread[];
  activeThreadId: string | null;
  setActiveThreadId: (id: string | null) => void;
  isCreatingThread: boolean;
  setIsCreatingThread: (creating: boolean) => void;
  newThreadTitle: string;
  setNewThreadTitle: (title: string) => void;
  createNewThread: (title: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function ConversationThreads({
  threads,
  activeThreadId,
  setActiveThreadId,
  isCreatingThread,
  setIsCreatingThread,
  newThreadTitle,
  setNewThreadTitle,
  createNewThread,
  searchQuery,
  setSearchQuery
}: ConversationThreadsProps) {
  const filteredThreads = threads.filter(thread => 
    thread.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[600px] flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-medium">Conversation Threads</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsCreatingThread(true)}
          className="h-8 w-8 p-0"
        >
          <PlusCircle className="h-4 w-4" />
          <span className="sr-only">New Thread</span>
        </Button>
      </div>
      <div className="p-4 border-b">
        <Input
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-8"
        />
      </div>
      <ScrollArea className="flex-1">
        {isCreatingThread ? (
          <div className="p-4">
            <div className="space-y-2">
              <Input
                placeholder="Thread title..."
                value={newThreadTitle}
                onChange={(e) => setNewThreadTitle(e.target.value)}
                autoFocus
              />
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => createNewThread(newThreadTitle)}
                  disabled={!newThreadTitle.trim()}
                >
                  Create
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setIsCreatingThread(false);
                    setNewThreadTitle("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        ) : filteredThreads.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No conversation threads found
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredThreads.map(thread => (
              <Button
                key={thread.id}
                variant={thread.id === activeThreadId ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveThreadId(thread.id)}
              >
                <div className="flex items-center w-full overflow-hidden">
                  <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{thread.title}</span>
                  <span className="ml-auto text-xs text-muted-foreground flex-shrink-0">
                    {new Date(thread.lastMessageAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </Button>
            ))}
          </div>
        )}
      </ScrollArea>
      <div className="p-4 border-t">
        <Tabs defaultValue="all">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}

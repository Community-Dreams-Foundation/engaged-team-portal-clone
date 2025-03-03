
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Bot, Folder, PlusCircle } from "lucide-react";
import { ConversationThread, ThreadMessage } from "@/types/conversation";

interface ConversationContentProps {
  activeThread: ConversationThread | undefined;
  newMessage: string;
  setNewMessage: (message: string) => void;
  sendMessage: () => void;
  setIsCreatingThread: (creating: boolean) => void;
}

export function ConversationContent({
  activeThread,
  newMessage,
  setNewMessage,
  sendMessage,
  setIsCreatingThread
}: ConversationContentProps) {
  if (!activeThread) {
    return (
      <div className="h-[600px] flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Bot className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-medium">No Active Conversation</h3>
            <p className="text-muted-foreground max-w-md">
              Select an existing conversation or create a new one to start chatting with your CoS agent.
            </p>
            <Button 
              onClick={() => setIsCreatingThread(true)}
              className="mx-auto"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              New Conversation
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[600px] flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-medium">
          {activeThread.title}
        </h3>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {activeThread.messages?.length || 0} messages
          </Badge>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Folder className="h-4 w-4" />
                <span className="sr-only">Thread Options</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56" align="end">
              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start text-sm">
                  Rename Thread
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm">
                  Archive Thread
                </Button>
                <Button variant="ghost" className="w-full justify-start text-destructive text-sm">
                  Delete Thread
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {activeThread?.messages?.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`rounded-lg p-3 max-w-[80%] ${
                  message.sender === 'user'
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p>{message.content}</p>
                <span className="text-xs opacity-70 mt-1 inline-block">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-2"
        >
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <Button type="submit" disabled={!newMessage.trim()}>
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}

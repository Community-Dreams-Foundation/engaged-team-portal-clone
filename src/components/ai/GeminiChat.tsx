
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { Send, Bot, User, RefreshCcw } from "lucide-react";
import { useGemini } from "@/hooks/useGemini";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

export function GeminiChat() {
  const [inputMessage, setInputMessage] = useState('');
  const {
    isLoading,
    conversation,
    chatWithGemini,
    resetConversation,
  } = useGemini();

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    const message = inputMessage;
    setInputMessage('');
    
    await chatWithGemini(message);
  };

  return (
    <Card className="flex flex-col h-[500px]">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Gemini Assistant</h3>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={resetConversation}
          title="Reset conversation"
        >
          <RefreshCcw className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {conversation.length === 0 && (
            <div className="text-center text-muted-foreground p-4">
              <p>Start a conversation with Gemini</p>
            </div>
          )}
          
          {conversation.map((message, index) => (
            <div
              key={index}
              className={`flex gap-2 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role !== 'user' && message.role !== 'system' && (
                <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                  <Bot className="h-5 w-5" />
                </Avatar>
              )}
              
              <div
                className={`rounded-lg p-3 max-w-[80%] ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : message.role === 'system'
                    ? 'bg-muted border border-border italic'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
              
              {message.role === 'user' && (
                <Avatar className="h-8 w-8 bg-secondary">
                  <User className="h-5 w-5" />
                </Avatar>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-2 justify-start">
              <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                <Bot className="h-5 w-5" />
              </Avatar>
              <div className="space-y-2 max-w-[80%]">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex gap-2"
        >
          <Textarea
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="min-h-[60px] max-h-[120px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading || !inputMessage.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
}

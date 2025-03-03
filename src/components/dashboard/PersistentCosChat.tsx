
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDown, ChevronUp, MessageSquare, Send, X } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { useCosRecommendations } from "@/hooks/useCosRecommendations"
import { cn } from "@/lib/utils"

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: number;
}

interface PersistentCosChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PersistentCosChat({ isOpen, onClose }: PersistentCosChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const { recommendations } = useCosRecommendations();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome-msg",
          content: "Hello! I'm your CoS agent. How can I help you today?",
          sender: 'bot',
          timestamp: Date.now()
        }
      ]);
    }
  }, [messages.length]);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
    
    // Focus input when chat opens
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [messages, isOpen]);

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !currentUser) return;

    const newUserMessage: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content: inputMessage,
      sender: 'user',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content: `I've received your message: "${inputMessage}". How else can I assist you?`,
        sender: 'bot',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const handleRecommendationClick = (content: string) => {
    setInputMessage(content);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={cn(
        "fixed bottom-0 right-0 w-80 bg-card border rounded-tl-md shadow-lg flex flex-col transition-all duration-200 z-50",
        isExpanded ? "h-96" : "h-12"
      )}
      style={{ maxHeight: 'calc(100vh - 4rem)' }}
    >
      {/* Chat header */}
      <div className="p-3 border-b flex items-center justify-between bg-muted/50">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          <h3 className="font-medium text-sm">CoS Assistant</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {isExpanded && (
        <>
          {/* Chat messages */}
          <ScrollArea className="flex-1 p-3" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={cn(
                      "rounded-lg p-3 max-w-[90%] text-sm",
                      message.sender === 'user'
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
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
          
          {/* Quick suggestions based on recommendations */}
          {recommendations.length > 0 && (
            <div className="p-2 border-t bg-muted/30">
              <p className="text-xs text-muted-foreground mb-2">Suggestions:</p>
              <div className="flex flex-wrap gap-1">
                {recommendations.slice(0, 2).map((rec) => (
                  <Button
                    key={rec.id}
                    variant="outline"
                    size="sm"
                    className="text-xs py-0 h-6 truncate max-w-full"
                    onClick={() => handleRecommendationClick(rec.content)}
                  >
                    {rec.content.length > 30 
                      ? rec.content.substring(0, 30) + '...' 
                      : rec.content}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          {/* Input area */}
          <div className="p-3 border-t">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-2"
            >
              <Input
                ref={inputRef}
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="text-sm h-8"
              />
              <Button type="submit" size="sm" className="h-8 w-8 p-0">
                <Send className="h-3 w-3" />
              </Button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

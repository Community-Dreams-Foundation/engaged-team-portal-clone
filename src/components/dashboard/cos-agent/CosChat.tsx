
import { useState, useRef, useEffect } from "react"
import { Bot, Send, Paperclip, X, Maximize2, Minimize2, Image, Mic, MoreVertical, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'cos';
  timestamp: Date;
  threadId: string;
  attachments?: {
    type: 'image' | 'file';
    url: string;
    name: string;
  }[];
  isProcessing?: boolean;
}

interface Thread {
  id: string;
  title: string;
  lastActive: Date;
  unread: number;
}

export function CosChat({ 
  minimized = false, 
  onMinimize,
  onMaximize 
}: { 
  minimized?: boolean; 
  onMinimize?: () => void;
  onMaximize?: () => void;
}) {
  const [message, setMessage] = useState("")
  const [threads, setThreads] = useState<Thread[]>([
    {
      id: "general",
      title: "General Assistance",
      lastActive: new Date(),
      unread: 0
    },
    {
      id: "tasks",
      title: "Task Planning",
      lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000),
      unread: 2
    }
  ])
  const [activeThread, setActiveThread] = useState("general")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hi there! I'm your CoS agent. How can I assist you today?",
      sender: "cos",
      timestamp: new Date(),
      threadId: "general"
    }
  ])
  const [recording, setRecording] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { currentUser } = useAuth()

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleSendMessage = () => {
    if (!message.trim()) return

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: message,
      sender: "user",
      timestamp: new Date(),
      threadId: activeThread
    }
    
    setMessages(prev => [...prev, userMessage])
    setMessage("")
    
    // Simulate CoS response
    const cosMessage: Message = {
      id: `cos-${Date.now()}`,
      content: "I'm processing your request...",
      sender: "cos",
      timestamp: new Date(),
      threadId: activeThread,
      isProcessing: true
    }
    
    setMessages(prev => [...prev, cosMessage])
    
    // Simulate response delay
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === cosMessage.id 
            ? {
                ...msg,
                content: `I understand you're asking about "${message}". Here's what I can tell you...`,
                isProcessing: false
              } 
            : msg
        )
      )
      
      // Update thread
      setThreads(prev => 
        prev.map(thread => 
          thread.id === activeThread 
            ? {...thread, lastActive: new Date()} 
            : thread
        )
      )
    }, 1500)
  }

  const createNewThread = () => {
    const newThreadId = `thread-${Date.now()}`
    const newThread: Thread = {
      id: newThreadId,
      title: `New Thread ${threads.length + 1}`,
      lastActive: new Date(),
      unread: 0
    }
    
    setThreads(prev => [...prev, newThread])
    setActiveThread(newThreadId)
    
    // Add initial message to the thread
    const initialMessage: Message = {
      id: `cos-${Date.now()}`,
      content: "This is a new conversation thread. How can I help you?",
      sender: "cos",
      timestamp: new Date(),
      threadId: newThreadId
    }
    
    setMessages(prev => [...prev, initialMessage])
  }

  const toggleRecording = () => {
    setRecording(!recording)
    
    if (!recording) {
      // Would implement actual recording logic here
      console.log("Started recording")
    } else {
      console.log("Stopped recording")
      // Simulate voice transcription after stopping
      setTimeout(() => {
        setMessage(prev => prev + " (Voice transcription: what tasks are due today?)")
      }, 500)
    }
  }

  if (minimized) {
    return (
      <Button 
        onClick={onMaximize} 
        className="flex items-center gap-2 bg-primary text-primary-foreground rounded-full p-3 shadow-lg"
        variant="default"
      >
        <Bot className="h-5 w-5" />
        <span className="sr-only">Open CoS Chat</span>
      </Button>
    )
  }

  return (
    <div className="flex flex-col h-full border rounded-md shadow-md bg-background">
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <Avatar>
            <Bot className="text-primary h-5 w-5" />
          </Avatar>
          <div>
            <h3 className="font-medium text-sm">CoS Assistant</h3>
            <p className="text-xs text-muted-foreground">Always ready to help</p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={onMinimize}
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={onMaximize}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="chat" className="flex flex-col flex-1">
        <TabsList className="mx-2 mt-2 grid grid-cols-2">
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="threads">Threads</TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat" className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 p-3">
            <div className="space-y-4">
              {messages
                .filter(msg => msg.threadId === activeThread)
                .map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.sender === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary'
                      }`}
                    >
                      {msg.isProcessing ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-pulse h-2 w-2 bg-current rounded-full"></div>
                          <div className="animate-pulse animation-delay-200 h-2 w-2 bg-current rounded-full"></div>
                          <div className="animate-pulse animation-delay-400 h-2 w-2 bg-current rounded-full"></div>
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      )}
                      <p className="text-xs opacity-70 mt-1">
                        {msg.timestamp.toLocaleTimeString()}
                      </p>
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {msg.attachments.map((attachment, i) => (
                            <div key={i} className="text-xs flex items-center gap-1 p-1 bg-background/50 rounded">
                              {attachment.type === 'image' ? <Image className="h-3 w-3" /> : <Paperclip className="h-3 w-3" />}
                              <span>{attachment.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
          
          <div className="p-3 border-t">
            <div className="flex gap-2">
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="h-9 w-9"
                onClick={() => {}}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              
              <Button
                type="button"
                size="icon"
                variant={recording ? "destructive" : "outline"}
                className="h-9 w-9"
                onClick={toggleRecording}
              >
                <Mic className="h-4 w-4" />
              </Button>
              
              <Input
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                className="h-9"
              />
              
              <Button
                type="button"
                size="icon"
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="h-9 w-9"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="threads" className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 p-3">
            <div className="space-y-1">
              {threads.map((thread) => (
                <Button
                  key={thread.id}
                  variant={activeThread === thread.id ? "secondary" : "ghost"}
                  className="w-full justify-start h-auto py-2"
                  onClick={() => setActiveThread(thread.id)}
                >
                  <div className="flex flex-1 items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      <span>{thread.title}</span>
                    </div>
                    {thread.unread > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {thread.unread}
                      </Badge>
                    )}
                  </div>
                </Button>
              ))}
            </div>
            
            <Button 
              onClick={createNewThread}
              variant="outline" 
              className="w-full mt-4"
            >
              New Thread
            </Button>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}

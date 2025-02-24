
import { useState, useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { MessageSquare, Filter, Bell, ListChecks, Code, Quote, Bold, Italic } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { 
  getDatabase, 
  ref, 
  push, 
  onValue, 
  off,
  serverTimestamp,
  query,
  orderByChild 
} from "firebase/database"

interface MessageFormat {
  bold?: boolean
  italic?: boolean
  code?: boolean
  quote?: boolean
}

interface Message {
  id: string
  userId: string
  userName: string
  content: string
  timestamp: string
  threadId?: string
  isRead: boolean
  format?: MessageFormat
}

const fetchMessages = async (): Promise<Message[]> => {
  return new Promise((resolve, reject) => {
    const db = getDatabase()
    const messagesRef = query(ref(db, 'messages'), orderByChild('timestamp'))

    onValue(messagesRef, (snapshot) => {
      const messages: Message[] = []
      snapshot.forEach((childSnapshot) => {
        const message = childSnapshot.val()
        messages.push({
          id: childSnapshot.key || '',
          ...message,
          timestamp: message.timestamp || new Date().toISOString()
        })
      })
      resolve(messages.reverse())
    }, (error) => {
      console.error("Error fetching messages:", error)
      reject(error)
    })
  })
}

export function CommunicationFeed() {
  const [newMessage, setNewMessage] = useState("")
  const [filter, setFilter] = useState<"all" | "unread">("all")
  const [messageFormat, setMessageFormat] = useState<MessageFormat>({
    bold: false,
    italic: false,
    code: false,
    quote: false
  })
  const { toast } = useToast()
  const { currentUser } = useAuth()
  const queryClient = useQueryClient()

  const { data: messages = [] } = useQuery({
    queryKey: ["messages"],
    queryFn: fetchMessages,
    refetchOnWindowFocus: false
  })

  useEffect(() => {
    const db = getDatabase()
    const messagesRef = ref(db, 'messages')

    const unsubscribe = onValue(messagesRef, () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] })
    })

    return () => {
      off(messagesRef)
      unsubscribe()
    }
  }, [queryClient])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return

    const db = getDatabase()
    const messagesRef = ref(db, 'messages')

    try {
      await push(messagesRef, {
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Anonymous',
        content: newMessage,
        timestamp: serverTimestamp(),
        isRead: false,
        format: messageFormat
      })

      toast({
        title: "Message sent",
        description: "Your message has been sent successfully."
      })
      
      setNewMessage("")
      setMessageFormat({
        bold: false,
        italic: false,
        code: false,
        quote: false
      })
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message. Please try again."
      })
    }
  }

  const toggleFormat = (type: keyof MessageFormat) => {
    setMessageFormat(prev => ({
      ...prev,
      [type]: !prev[type]
    }))
  }

  const renderMessageContent = (message: Message) => {
    let content = message.content

    if (message.format?.code) {
      return (
        <pre className="bg-muted p-2 rounded-md font-mono text-sm overflow-x-auto">
          <code>{content}</code>
        </pre>
      )
    }

    if (message.format?.quote) {
      return (
        <blockquote className="border-l-4 border-primary/50 pl-4 italic">
          {content}
        </blockquote>
      )
    }

    return (
      <p className={`text-sm ${message.format?.bold ? 'font-bold' : ''} ${message.format?.italic ? 'italic' : ''}`}>
        {content}
      </p>
    )
  }

  const filteredMessages = messages.filter(msg => 
    filter === "all" || (filter === "unread" && !msg.isRead)
  )

  const groupedMessages = filteredMessages.reduce((acc, message) => {
    if (message.threadId) {
      if (!acc[message.threadId]) {
        acc[message.threadId] = []
      }
      acc[message.threadId].push(message)
    } else {
      if (!acc.standalone) {
        acc.standalone = []
      }
      acc.standalone.push(message)
    }
    return acc
  }, {} as Record<string, Message[]>)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Internal Communication Feed</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilter(filter === "all" ? "unread" : "all")}
          >
            <Filter className="h-4 w-4" />
            {filter === "all" ? "Show Unread" : "Show All"}
          </Button>
          
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4" />
            <Badge variant="secondary" className="ml-1">
              {messages.filter(m => !m.isRead).length}
            </Badge>
          </Button>
        </div>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto">
        {Object.entries(groupedMessages).map(([threadId, threadMessages]) => (
          <Card key={threadId} className="p-4">
            {threadId !== "standalone" && (
              <div className="flex items-center gap-2 mb-2">
                <ListChecks className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Thread</span>
              </div>
            )}
            
            <div className="space-y-3">
              {threadMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    !message.isRead ? "bg-muted/50 p-2 rounded-lg" : ""
                  }`}
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    {message.userName[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">
                        {message.userName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    {renderMessageContent(message)}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => toggleFormat('bold')}
            className={messageFormat.bold ? 'bg-primary text-primary-foreground' : ''}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => toggleFormat('italic')}
            className={messageFormat.italic ? 'bg-primary text-primary-foreground' : ''}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => toggleFormat('code')}
            className={messageFormat.code ? 'bg-primary text-primary-foreground' : ''}
          >
            <Code className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => toggleFormat('quote')}
            className={messageFormat.quote ? 'bg-primary text-primary-foreground' : ''}
          >
            <Quote className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message here..."
            className="resize-none"
          />
          <Button onClick={handleSendMessage} disabled={!currentUser}>
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}

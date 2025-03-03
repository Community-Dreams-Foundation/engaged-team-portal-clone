import { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { CosAgent } from "@/components/dashboard/CosAgent"
import { useAuth } from "@/contexts/AuthContext"
import { getDatabase, ref, get, update, push, onValue, off } from "firebase/database"
import { Button } from "@/components/ui/button"
import { Bot, ArrowRight, Check, Plus, MessageSquare, Clock, Folder, PlusCircle } from "lucide-react"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Card } from "@/components/ui/card"
import { useCosData } from "@/hooks/useCosData"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface ConversationThread {
  id: string;
  title: string;
  createdAt: number;
  lastMessageAt: number;
  messages: ThreadMessage[];
  category?: string;
}

interface ThreadMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: number;
}

export default function CosAgentPage() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [hasAgent, setHasAgent] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showTutorial, setShowTutorial] = useState(false)
  const [tutorialStep, setTutorialStep] = useState(1)
  const { preferences, agents } = useCosData()
  const agentName = agents?.[0]?.name || "CoS Agent"
  
  const [threads, setThreads] = useState<ConversationThread[]>([])
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null)
  const [newThreadTitle, setNewThreadTitle] = useState("")
  const [newMessage, setNewMessage] = useState("")
  const [isCreatingThread, setIsCreatingThread] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    async function checkAgentStatus() {
      if (!currentUser) return

      try {
        const db = getDatabase()
        const prefsRef = ref(db, `users/${currentUser.uid}/cosPreferences`)
        const snapshot = await get(prefsRef)
        
        const exists = snapshot.exists()
        setHasAgent(exists)
        
        if (exists) {
          const prefs = snapshot.val()
          if (prefs.hasCompletedOnboarding === false) {
            setShowTutorial(true)
            update(prefsRef, { hasCompletedOnboarding: true })
          }
        }
        
        setIsLoading(false)
      } catch (error) {
        console.error("Error checking agent status:", error)
        setIsLoading(false)
      }
    }

    checkAgentStatus()
  }, [currentUser])

  useEffect(() => {
    if (!currentUser?.uid || !hasAgent) return

    const db = getDatabase()
    const threadsRef = ref(db, `users/${currentUser.uid}/conversationThreads`)
    
    const unsubscribe = onValue(threadsRef, (snapshot) => {
      if (!snapshot.exists()) {
        createNewThread("General Discussion", true)
        return
      }
      
      const threadData = snapshot.val()
      const threadList: ConversationThread[] = []
      
      Object.keys(threadData).forEach(key => {
        const thread = threadData[key]
        const messagesArray = thread.messages ? 
          Object.keys(thread.messages).map(msgKey => ({
            id: msgKey,
            ...thread.messages[msgKey]
          })) : []
        
        messagesArray.sort((a, b) => a.timestamp - b.timestamp)
        
        threadList.push({
          id: key,
          title: thread.title,
          createdAt: thread.createdAt,
          lastMessageAt: thread.lastMessageAt,
          messages: messagesArray,
          category: thread.category
        })
      })
      
      threadList.sort((a, b) => b.lastMessageAt - a.lastMessageAt)
      
      setThreads(threadList)
      
      if (!activeThreadId && threadList.length > 0) {
        setActiveThreadId(threadList[0].id)
      }
    })
    
    return () => {
      off(threadsRef)
      unsubscribe()
    }
  }, [currentUser?.uid, hasAgent, activeThreadId])

  const handleCreateAgent = () => {
    navigate("/intake")
  }
  
  const handleNextTutorialStep = () => {
    if (tutorialStep < 3) {
      setTutorialStep(prev => prev + 1)
    } else {
      setShowTutorial(false)
    }
  }
  
  const tutorialSteps = [
    {
      title: `Welcome to your new ${agentName}!`,
      description: "I'll be your AI assistant to help you be more productive and manage your tasks efficiently.",
      action: "Next"
    },
    {
      title: "Get Started with Tasks",
      description: "Create and manage your tasks in the Task Dashboard. I'll help you prioritize and stay on track.",
      action: "Next"
    },
    {
      title: "Check Recommendations",
      description: "I'll make personalized recommendations based on your preferences and work style. Check them regularly for productivity tips!",
      action: "Start Using My CoS Agent"
    }
  ]

  const createNewThread = async (title: string, isDefault = false) => {
    if (!currentUser?.uid || (!isDefault && (!title.trim() || !hasAgent))) return
    
    try {
      const db = getDatabase()
      const threadsRef = ref(db, `users/${currentUser.uid}/conversationThreads`)
      const newThreadRef = push(threadsRef)
      
      const now = Date.now()
      const threadData = {
        title: title.trim(),
        createdAt: now,
        lastMessageAt: now,
      }
      
      await update(newThreadRef, threadData)
      
      const messagesRef = ref(db, `users/${currentUser.uid}/conversationThreads/${newThreadRef.key}/messages`)
      const welcomeMessageRef = push(messagesRef)
      await update(welcomeMessageRef, {
        content: `Welcome to your "${title.trim()}" conversation! How can I help you today?`,
        sender: 'bot',
        timestamp: now
      })
      
      setActiveThreadId(newThreadRef.key)
      setNewThreadTitle("")
      setIsCreatingThread(false)
    } catch (error) {
      console.error("Error creating new thread:", error)
    }
  }

  const sendMessage = async () => {
    if (!currentUser?.uid || !activeThreadId || !newMessage.trim()) return
    
    try {
      const db = getDatabase()
      const messagesRef = ref(db, `users/${currentUser.uid}/conversationThreads/${activeThreadId}/messages`)
      const threadRef = ref(db, `users/${currentUser.uid}/conversationThreads/${activeThreadId}`)
      
      const now = Date.now()
      
      const newMessageRef = push(messagesRef)
      await update(newMessageRef, {
        content: newMessage.trim(),
        sender: 'user',
        timestamp: now
      })
      
      await update(threadRef, {
        lastMessageAt: now
      })
      
      setNewMessage("")
      
      setTimeout(async () => {
        const botMessageRef = push(messagesRef)
        const botResponse = `I've received your message: "${newMessage.trim()}". How else can I assist you with this topic?`
        
        await update(botMessageRef, {
          content: botResponse,
          sender: 'bot',
          timestamp: Date.now()
        })
        
        await update(threadRef, {
          lastMessageAt: Date.now()
        })
      }, 1000)
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const getActiveThread = () => {
    return threads.find(thread => thread.id === activeThreadId)
  }

  const filteredThreads = threads.filter(thread => 
    thread.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold tracking-tight">CoS Agent</h1>
          <div className="flex gap-4">
            <Button asChild variant="outline" size="sm">
              <Link to="/submit-idea">
                <Plus className="mr-2 h-4 w-4" />
                Submit Project Idea
              </Link>
            </Button>
            <p className="text-muted-foreground">
              Your AI-powered productivity assistant
            </p>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse flex flex-col items-center">
              <Bot className="h-12 w-12 text-primary mb-4" />
              <p>Loading your CoS agent...</p>
            </div>
          </div>
        ) : showTutorial ? (
          <Card className="p-6 border-primary/20">
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{tutorialSteps[tutorialStep - 1].title}</h2>
                  <p className="text-muted-foreground">{tutorialSteps[tutorialStep - 1].description}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <Progress value={(tutorialStep / 3) * 100} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Getting Started</span>
                  <span>Step {tutorialStep} of 3</span>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleNextTutorialStep}>
                  {tutorialSteps[tutorialStep - 1].action}
                  {tutorialStep < 3 ? <ArrowRight className="ml-2 h-4 w-4" /> : <Check className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </div>
          </Card>
        ) : hasAgent ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Card className="h-[600px] flex flex-col">
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
                              setIsCreatingThread(false)
                              setNewThreadTitle("")
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
              </Card>
            </div>
            
            <div className="md:col-span-2">
              <Card className="h-[600px] flex flex-col">
                {activeThreadId ? (
                  <>
                    <div className="p-4 border-b flex items-center justify-between">
                      <h3 className="font-medium">
                        {getActiveThread()?.title || "Conversation"}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {getActiveThread()?.messages?.length || 0} messages
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
                        {getActiveThread()?.messages?.map((message) => (
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
                          e.preventDefault()
                          sendMessage()
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
                  </>
                ) : (
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
                )}
              </Card>
            </div>
            
            <div className="md:col-span-3">
              <CosAgent />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            <Alert className="bg-card">
              <Bot className="h-5 w-5 text-primary" />
              <AlertTitle>No CoS Agent Found</AlertTitle>
              <AlertDescription className="space-y-4">
                <p>You haven't set up your AI Chief of Staff yet. Create one now to boost your productivity.</p>
                <Button onClick={handleCreateAgent}>
                  Create CoS Agent <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}


import { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { CosAgent } from "@/components/dashboard/CosAgent"
import { useAuth } from "@/contexts/AuthContext"
import { getDatabase, ref, get, update, push, onValue, off } from "firebase/database"
import { Button } from "@/components/ui/button"
import { Bot, ArrowRight, Plus, MessageSquare } from "lucide-react"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Card } from "@/components/ui/card"
import { useCosData } from "@/hooks/useCosData"
import { ConversationThreads } from "@/components/dashboard/cos-agent/ConversationThreads"
import { ConversationContent } from "@/components/dashboard/cos-agent/ConversationContent"
import { CosTutorial } from "@/components/dashboard/cos-agent/CosTutorial"
import type { ConversationThread } from "@/types/conversation"

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
          <CosTutorial 
            tutorialStep={tutorialStep} 
            agentName={agentName} 
            handleNextTutorialStep={handleNextTutorialStep} 
          />
        ) : hasAgent ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Card>
                <ConversationThreads 
                  threads={threads}
                  activeThreadId={activeThreadId}
                  setActiveThreadId={setActiveThreadId}
                  isCreatingThread={isCreatingThread}
                  setIsCreatingThread={setIsCreatingThread}
                  newThreadTitle={newThreadTitle}
                  setNewThreadTitle={setNewThreadTitle}
                  createNewThread={createNewThread}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                />
              </Card>
            </div>
            
            <div className="md:col-span-2">
              <Card>
                <ConversationContent 
                  activeThread={getActiveThread()}
                  newMessage={newMessage}
                  setNewMessage={setNewMessage}
                  sendMessage={sendMessage}
                  setIsCreatingThread={setIsCreatingThread}
                />
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

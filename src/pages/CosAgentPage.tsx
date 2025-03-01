
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { CosAgent } from "@/components/dashboard/CosAgent"
import { useAuth } from "@/contexts/AuthContext"
import { getDatabase, ref, get, update } from "firebase/database"
import { Button } from "@/components/ui/button"
import { Bot, ArrowRight, Check } from "lucide-react"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Card } from "@/components/ui/card"
import { useCosData } from "@/hooks/useCosData"
import { Progress } from "@/components/ui/progress"

export default function CosAgentPage() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [hasAgent, setHasAgent] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showTutorial, setShowTutorial] = useState(false)
  const [tutorialStep, setTutorialStep] = useState(1)
  const { preferences, agents } = useCosData()
  const agentName = agents?.[0]?.name || "CoS Agent"

  useEffect(() => {
    async function checkAgentStatus() {
      if (!currentUser) return

      try {
        const db = getDatabase()
        const prefsRef = ref(db, `users/${currentUser.uid}/cosPreferences`)
        const snapshot = await get(prefsRef)
        
        const exists = snapshot.exists()
        setHasAgent(exists)
        
        // Check if this is the first time after onboarding
        if (exists) {
          const prefs = snapshot.val()
          if (prefs.hasCompletedOnboarding === false) {
            setShowTutorial(true)
            // Mark as completed after showing tutorial
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

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold tracking-tight">CoS Agent</h1>
          <p className="text-muted-foreground">
            Your AI-powered productivity assistant
          </p>
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
          <div className="grid grid-cols-1 gap-6">
            <CosAgent />
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

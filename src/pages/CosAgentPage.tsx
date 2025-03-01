
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { CosAgent } from "@/components/dashboard/CosAgent"
import { useAuth } from "@/contexts/AuthContext"
import { getDatabase, ref, get } from "firebase/database"
import { Button } from "@/components/ui/button"
import { Bot, ArrowRight } from "lucide-react"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

export default function CosAgentPage() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [hasAgent, setHasAgent] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function checkAgentStatus() {
      if (!currentUser) return

      try {
        const db = getDatabase()
        const prefsRef = ref(db, `users/${currentUser.uid}/cosPreferences`)
        const snapshot = await get(prefsRef)
        
        setHasAgent(snapshot.exists())
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

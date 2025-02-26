
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { getDatabase, ref, push, get, update } from "firebase/database"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import type { LeadershipTier, LeadershipProfile, PromotionRequest } from "@/types/leadership"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

const TIER_REQUIREMENTS = {
  captain: {
    minimumScore: 70,
    minimumTasks: 50,
    minimumEfficiency: 0.7
  },
  "team-lead": {
    minimumScore: 80,
    minimumTasks: 100,
    minimumEfficiency: 0.8
  },
  "product-owner": {
    minimumScore: 85,
    minimumTasks: 200,
    minimumEfficiency: 0.85
  },
  executive: {
    minimumScore: 90,
    minimumTasks: 500,
    minimumEfficiency: 0.9
  }
}

const TIER_ORDER: LeadershipTier[] = ["emerging", "captain", "team-lead", "product-owner", "executive"]

export function PromotionWorkflow() {
  const { currentUser } = useAuth()
  const [justification, setJustification] = useState("")

  const { data: profile } = useQuery({
    queryKey: ['leadershipProfile', currentUser?.uid],
    queryFn: async () => {
      if (!currentUser?.uid) return null
      const db = getDatabase()
      const profileRef = ref(db, `users/${currentUser.uid}/leadership`)
      const snapshot = await get(profileRef)
      return snapshot.exists() ? snapshot.val() as LeadershipProfile : null
    },
    enabled: !!currentUser
  })

  const { data: activeRequest } = useQuery({
    queryKey: ['promotionRequest', currentUser?.uid],
    queryFn: async () => {
      if (!currentUser?.uid) return null
      const db = getDatabase()
      const requestRef = ref(db, `promotionRequests/${currentUser.uid}`)
      const snapshot = await get(requestRef)
      if (!snapshot.exists()) return null
      const requests = Object.values(snapshot.val()) as PromotionRequest[]
      return requests.find(r => r.status === "pending")
    },
    enabled: !!currentUser
  })

  const nextTier = profile ? TIER_ORDER[TIER_ORDER.indexOf(profile.currentTier) + 1] : null
  const requirements = nextTier ? TIER_REQUIREMENTS[nextTier as keyof typeof TIER_REQUIREMENTS] : null

  const isEligible = profile && requirements && (
    profile.metrics.overallScore >= requirements.minimumScore &&
    profile.assessments.reduce((sum, a) => sum + a.metrics.tasksCompleted, 0) >= requirements.minimumTasks &&
    profile.metrics.projectDeliveryRate >= requirements.minimumEfficiency
  )

  const handlePromotionRequest = async () => {
    if (!currentUser?.uid || !profile || !nextTier || !isEligible) return

    try {
      const db = getDatabase()
      const newRequest: PromotionRequest = {
        id: `pr-${Date.now()}`,
        userId: currentUser.uid,
        currentTier: profile.currentTier,
        requestedTier: nextTier,
        metrics: profile.assessments[profile.assessments.length - 1].metrics,
        status: "pending",
        submittedAt: Date.now(),
        feedback: "",
        requirements: {
          trainingModules: [],
          minimumMetrics: requirements,
          timeInCurrentTier: Date.now() - profile.joinedAt,
          mentorshipRequired: nextTier === "team-lead" || nextTier === "product-owner"
        }
      }

      await push(ref(db, `promotionRequests/${currentUser.uid}`), newRequest)
      
      toast({
        title: "Promotion Request Submitted",
        description: "Your request will be reviewed by leadership.",
      })
    } catch (error) {
      console.error("Error submitting promotion request:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit promotion request. Please try again.",
      })
    }
  }

  if (!profile || !nextTier || !requirements) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leadership Promotion</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Current Tier</p>
            <Badge className="mt-1">{profile.currentTier}</Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Next Tier</p>
            <Badge variant="outline" className="mt-1">{nextTier}</Badge>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm">
              <span>Overall Score</span>
              <span>{profile.metrics.overallScore}/{requirements.minimumScore}</span>
            </div>
            <Progress
              value={(profile.metrics.overallScore / requirements.minimumScore) * 100}
              className="mt-2"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm">
              <span>Tasks Completed</span>
              <span>
                {profile.assessments.reduce((sum, a) => sum + a.metrics.tasksCompleted, 0)}/
                {requirements.minimumTasks}
              </span>
            </div>
            <Progress
              value={(profile.assessments.reduce((sum, a) => sum + a.metrics.tasksCompleted, 0) / requirements.minimumTasks) * 100}
              className="mt-2"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm">
              <span>Project Delivery Rate</span>
              <span>{(profile.metrics.projectDeliveryRate * 100).toFixed(0)}%/{(requirements.minimumEfficiency * 100).toFixed(0)}%</span>
            </div>
            <Progress
              value={(profile.metrics.projectDeliveryRate / requirements.minimumEfficiency) * 100}
              className="mt-2"
            />
          </div>
        </div>

        {!activeRequest && (
          <div className="space-y-4">
            <Textarea
              placeholder="Why do you think you deserve this promotion? (Optional)"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              className="min-h-[100px]"
            />

            <Button 
              className="w-full"
              onClick={handlePromotionRequest}
              disabled={!isEligible}
            >
              Request Promotion to {nextTier}
            </Button>

            {!isEligible && (
              <p className="text-sm text-muted-foreground text-center">
                You need to meet all the minimum requirements to request a promotion
              </p>
            )}
          </div>
        )}

        {activeRequest && (
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Your promotion request is currently under review
            </p>
            <p className="text-xs text-muted-foreground">
              Submitted on {new Date(activeRequest.submittedAt).toLocaleDateString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

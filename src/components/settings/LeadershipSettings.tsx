
import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getDatabase, ref, update } from "firebase/database"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { 
  LeadershipDomain, 
  LeadershipProfile,
  LeadershipTier
} from "@/types/leadership"
import { PromotionRequestForm } from "./PromotionRequestForm"
import { LeadershipMetricsOverview } from "./LeadershipMetricsOverview"

const formSchema = z.object({
  domain: z.enum(["strategy", "product-design", "data-engineering", "software-development", "engagement"] as const),
  specializations: z.array(z.enum(["strategy", "product-design", "data-engineering", "software-development", "engagement"] as const)),
  mentorshipPreferences: z.object({
    availableAsMentor: z.boolean(),
    seekingMentor: z.boolean(),
    preferredMentorshipAreas: z.array(z.string())
  }),
  displayAchievements: z.boolean(),
  displayLeadershipMetrics: z.boolean()
})

type FormValues = z.infer<typeof formSchema>

export function LeadershipSettings() {
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)

  // Fetch the user's leadership profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['leadershipProfile', currentUser?.uid],
    queryFn: async () => {
      if (!currentUser?.uid) return null
      const db = getDatabase()
      const profileRef = ref(db, `users/${currentUser.uid}/leadership`)
      try {
        // Simulate fetching the leadership profile
        // In a real app, you would use get() from firebase/database
        const mockProfile: LeadershipProfile = {
          userId: currentUser.uid,
          currentTier: "emerging" as LeadershipTier,
          domain: "software-development" as LeadershipDomain,
          joinedAt: Date.now(),
          assessments: [],
          trainingCompleted: [],
          metrics: {
            overallScore: 75,
            leaderboardRank: 15
          },
          achievements: [],
          mentors: [],
          mentees: [],
          specializations: ["software-development"] as LeadershipDomain[],
          mentorshipPreferences: {
            availableAsMentor: false,
            seekingMentor: true,
            preferredMentorshipAreas: ["technical-skills", "career-growth"]
          },
          displaySettings: {
            showAchievements: true,
            showMetrics: true
          }
        };
        return mockProfile;
      } catch (error) {
        console.error("Error fetching leadership profile:", error)
        return null
      }
    },
    enabled: !!currentUser
  })

  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      domain: profile?.domain || "software-development",
      specializations: profile?.specializations || ["software-development"],
      mentorshipPreferences: {
        availableAsMentor: profile?.mentorshipPreferences?.availableAsMentor || false,
        seekingMentor: profile?.mentorshipPreferences?.seekingMentor || true,
        preferredMentorshipAreas: profile?.mentorshipPreferences?.preferredMentorshipAreas || []
      },
      displayAchievements: profile?.displaySettings?.showAchievements || true,
      displayLeadershipMetrics: profile?.displaySettings?.showMetrics || true
    }
  })

  // Update default values when profile data is loaded
  useEffect(() => {
    if (profile) {
      form.reset({
        domain: profile.domain || "software-development",
        specializations: profile.specializations || ["software-development"],
        mentorshipPreferences: {
          availableAsMentor: profile.mentorshipPreferences?.availableAsMentor || false,
          seekingMentor: profile.mentorshipPreferences?.seekingMentor || true,
          preferredMentorshipAreas: profile.mentorshipPreferences?.preferredMentorshipAreas || []
        },
        displayAchievements: profile.displaySettings?.showAchievements || true,
        displayLeadershipMetrics: profile.displaySettings?.showMetrics || true
      })
    }
  }, [profile, form])

  // Update leadership settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (!currentUser?.uid) throw new Error("User not authenticated")
      
      const db = getDatabase()
      const profileRef = ref(db, `users/${currentUser.uid}/leadership`)
      
      // Update the leadership profile
      return update(profileRef, {
        domain: values.domain,
        specializations: values.specializations,
        'mentorshipPreferences/availableAsMentor': values.mentorshipPreferences.availableAsMentor,
        'mentorshipPreferences/seekingMentor': values.mentorshipPreferences.seekingMentor,
        'mentorshipPreferences/preferredMentorshipAreas': values.mentorshipPreferences.preferredMentorshipAreas,
        'displaySettings/showAchievements': values.displayAchievements,
        'displaySettings/showMetrics': values.displayLeadershipMetrics
      })
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Your leadership preferences have been saved.",
      })
      queryClient.invalidateQueries({ queryKey: ['leadershipProfile', currentUser?.uid] })
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update leadership settings. Please try again.",
      })
      console.error("Error updating leadership settings:", error)
    }
  })

  const onSubmit = (values: FormValues) => {
    updateSettingsMutation.mutate(values)
  }

  if (profileLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Leadership Settings</CardTitle>
          <CardDescription>Loading your leadership profile...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {profile && <LeadershipMetricsOverview profile={profile} />}
      
      <Card>
        <CardHeader>
          <CardTitle>Leadership Settings</CardTitle>
          <CardDescription>
            Configure your leadership domain, specializations, and mentorship preferences.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="domain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Leadership Domain</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your primary domain" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="strategy">Strategy</SelectItem>
                          <SelectItem value="product-design">Product Design</SelectItem>
                          <SelectItem value="data-engineering">Data Engineering</SelectItem>
                          <SelectItem value="software-development">Software Development</SelectItem>
                          <SelectItem value="engagement">Engagement</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        This is your primary area of leadership focus.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Separator className="my-4" />
                
                <div>
                  <h3 className="text-lg font-medium">Mentorship Preferences</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Configure your mentorship involvement settings.
                  </p>
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="mentorshipPreferences.availableAsMentor"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Available as Mentor</FormLabel>
                            <FormDescription>
                              Allow others to find you as a mentor
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="mentorshipPreferences.seekingMentor"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Seeking Mentor</FormLabel>
                            <FormDescription>
                              Indicate that you're looking for mentorship
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div>
                  <h3 className="text-lg font-medium">Display Preferences</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Control visibility of your leadership information.
                  </p>
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="displayAchievements"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Show Achievements</FormLabel>
                            <FormDescription>
                              Display your leadership achievements on your profile
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="displayLeadershipMetrics"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Show Leadership Metrics</FormLabel>
                            <FormDescription>
                              Display your leadership metrics and statistics
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
              
              <Button 
                type="submit"
                disabled={isLoading || updateSettingsMutation.isPending}
              >
                {updateSettingsMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {profile && (
        <PromotionRequestForm 
          currentTier={profile.currentTier} 
          onRequestSubmitted={() => {
            queryClient.invalidateQueries({ queryKey: ['leadershipProfile', currentUser?.uid] })
          }}
        />
      )}
    </div>
  )
}


import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage 
} from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import { ArrowRight, BadgeCheck, Award, Users } from "lucide-react"
import { LeadershipProfile, LeadershipDomain, LeadershipTier } from "@/types/leadership"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { LeadershipApi } from "@/api/gateway"

// Form schema for leadership settings
const leadershipFormSchema = z.object({
  domain: z.string(),
  specializations: z.array(z.string()),
  mentorshipPreferences: z.object({
    availableAsMentor: z.boolean(),
    seekingMentor: z.boolean(),
    preferredMentorshipAreas: z.array(z.string())
  }),
  displaySettings: z.object({
    showAchievements: z.boolean(),
    showMetrics: z.boolean()
  })
})

type LeadershipFormValues = z.infer<typeof leadershipFormSchema>

export function LeadershipSettings() {
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const [leadershipProfile, setLeadershipProfile] = useState<LeadershipProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("preferences")
  const [saving, setSaving] = useState(false)

  // Initialize form with default values
  const form = useForm<LeadershipFormValues>({
    resolver: zodResolver(leadershipFormSchema),
    defaultValues: {
      domain: "",
      specializations: [],
      mentorshipPreferences: {
        availableAsMentor: false,
        seekingMentor: false,
        preferredMentorshipAreas: []
      },
      displaySettings: {
        showAchievements: true,
        showMetrics: true
      }
    }
  })

  // Fetch leadership profile data
  useEffect(() => {
    async function fetchLeadershipProfile() {
      if (!currentUser) return
      
      setLoading(true)
      try {
        // We'll create a mock profile for now, but in a real app we'd use LeadershipApi
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
            preferredMentorshipAreas: ["Technical Skills", "Career Growth"]
          },
          displaySettings: {
            showAchievements: true,
            showMetrics: true
          }
        };
        
        // In production, replace with:
        // const profile = await LeadershipApi.fetchProfile(currentUser.uid);
        const profile = mockProfile;
        
        setLeadershipProfile(profile)
        
        // Update form values with profile data
        form.reset({
          domain: profile.domain || "",
          specializations: profile.specializations || [],
          mentorshipPreferences: {
            availableAsMentor: profile.mentorshipPreferences?.availableAsMentor || false,
            seekingMentor: profile.mentorshipPreferences?.seekingMentor || false,
            preferredMentorshipAreas: profile.mentorshipPreferences?.preferredMentorshipAreas || []
          },
          displaySettings: {
            showAchievements: profile.displaySettings?.showAchievements || true,
            showMetrics: profile.displaySettings?.showMetrics || true
          }
        })
      } catch (error) {
        console.error("Error fetching leadership profile:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load leadership profile data"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchLeadershipProfile()
  }, [currentUser, form, toast])

  // Handle form submission
  const onSubmit = async (data: LeadershipFormValues) => {
    if (!currentUser || !leadershipProfile) return
    
    setSaving(true)
    try {
      // In a real app, you would update the database
      // await LeadershipApi.updateProfile({
      //   userId: currentUser.uid,
      //   ...data
      // })
      
      // Update local state
      setLeadershipProfile({
        ...leadershipProfile,
        domain: data.domain as LeadershipDomain,
        specializations: data.specializations as LeadershipDomain[],
        mentorshipPreferences: data.mentorshipPreferences,
        displaySettings: data.displaySettings
      })
      
      toast({
        title: "Settings updated",
        description: "Your leadership preferences have been saved"
      })
    } catch (error) {
      console.error("Error updating leadership profile:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update leadership settings"
      })
    } finally {
      setSaving(false)
    }
  }

  // Available leadership domains
  const leadershipDomains: { value: LeadershipDomain; label: string }[] = [
    { value: "strategy", label: "Strategy" },
    { value: "product-design", label: "Product Design" },
    { value: "data-engineering", label: "Data Engineering" },
    { value: "software-development", label: "Software Development" },
    { value: "engagement", label: "Engagement" }
  ]

  // Mentorship areas
  const mentorshipAreas = [
    "Technical Skills", 
    "Leadership", 
    "Career Growth", 
    "Communication", 
    "Project Management", 
    "Innovation"
  ]

  if (loading) {
    return (
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p>Loading leadership profile...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!leadershipProfile) {
    return (
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p>No leadership profile data available. Please contact support.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Leadership Settings</CardTitle>
        <CardDescription>
          Manage your leadership profile, preferences, and promotion requests
        </CardDescription>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <CardContent>
          <TabsList className="mb-6">
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="promotion">Promotion</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="preferences">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <Badge 
                  variant="outline" 
                  className="py-1.5 px-2.5 text-sm bg-primary/5 border-primary/20"
                >
                  {leadershipProfile.currentTier.split('-').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </Badge>
                <div>
                  <p className="text-sm font-medium">Current Leadership Tier</p>
                  <p className="text-sm text-muted-foreground">
                    Your current leadership level determines responsibilities and growth opportunities
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                            {leadershipDomains.map((domain) => (
                              <SelectItem key={domain.value} value={domain.value}>
                                {domain.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          This is your main area of leadership expertise
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-4">
                    <FormLabel>Mentorship Preferences</FormLabel>
                    <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name="mentorshipPreferences.availableAsMentor"
                        render={({ field }) => (
                          <FormItem className="flex items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1">
                              <FormLabel>Available as a Mentor</FormLabel>
                              <FormDescription>
                                Indicate if you're available to mentor other team members
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="mentorshipPreferences.seekingMentor"
                        render={({ field }) => (
                          <FormItem className="flex items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1">
                              <FormLabel>Seeking a Mentor</FormLabel>
                              <FormDescription>
                                Indicate if you're looking for mentorship
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <FormLabel>Profile Display Settings</FormLabel>
                    <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name="displaySettings.showAchievements"
                        render={({ field }) => (
                          <FormItem className="flex items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1">
                              <FormLabel>Show Achievements</FormLabel>
                              <FormDescription>
                                Display your leadership achievements on your profile
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="displaySettings.showMetrics"
                        render={({ field }) => (
                          <FormItem className="flex items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1">
                              <FormLabel>Show Performance Metrics</FormLabel>
                              <FormDescription>
                                Display your leadership metrics on your profile
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <Button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </Form>
            </div>
          </TabsContent>
          
          <TabsContent value="promotion">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Leadership Promotion</h3>
                  <p className="text-sm text-muted-foreground">
                    Request a promotion to the next leadership tier
                  </p>
                </div>
                <Button className="gap-2">
                  <ArrowRight className="h-4 w-4" />
                  Request Promotion
                </Button>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h4 className="font-medium">Current Tier Requirements</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="h-5 w-5 text-primary" />
                      <span className="font-medium">Performance Metrics</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Maintain an overall score of 75 or higher
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BadgeCheck className="h-5 w-5 text-primary" />
                      <span className="font-medium">Training Modules</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Complete all required training modules for your tier
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-primary" />
                      <span className="font-medium">Mentorship</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Mentor at least one team member
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="metrics">
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Leadership Metrics</h3>
              <p className="text-muted-foreground">
                View your current leadership performance metrics
              </p>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Overall Score</p>
                  <p className="text-2xl font-bold">
                    {leadershipProfile.metrics.overallScore || 0}
                  </p>
                </div>
                
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Leaderboard Rank</p>
                  <p className="text-2xl font-bold">
                    #{leadershipProfile.metrics.leaderboardRank || 0}
                  </p>
                </div>
                
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Team Members</p>
                  <p className="text-2xl font-bold">
                    {leadershipProfile.mentees?.length || 0}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
      
      <CardFooter className="border-t mt-6 pt-6 flex justify-between">
        <p className="text-sm text-muted-foreground">
          Leadership tier: <span className="font-medium">{leadershipProfile.currentTier}</span>
        </p>
        <p className="text-sm text-muted-foreground">
          Joined: {new Date(leadershipProfile.joinedAt).toLocaleDateString()}
        </p>
      </CardFooter>
    </Card>
  )
}


import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useQuery } from "@tanstack/react-query"
import { getDatabase, ref, get, set } from "firebase/database"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  Trophy, 
  Users, 
  Star, 
  Award, 
  Target,
  UserRoundCheck,
  Medal,
  Handshake
} from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { 
  LeadershipDomain, 
  LeadershipTier, 
  LeadershipProfile 
} from "@/types/leadership"

const leadershipPreferencesSchema = z.object({
  preferredDomains: z.array(z.string()).min(1, "Select at least one domain"),
  mentorshipPreference: z.enum(["mentor", "mentee", "both", "none"]),
  visibilitySettings: z.object({
    showAchievements: z.boolean().default(true),
    showMetrics: z.boolean().default(true),
    showLeaderboardRank: z.boolean().default(true),
  }),
  notificationPreferences: z.object({
    promotionOpportunities: z.boolean().default(true),
    newChallenges: z.boolean().default(true),
    mentorshipRequests: z.boolean().default(true),
    assessmentReminders: z.boolean().default(true),
  }),
  careerGoals: z.object({
    targetTier: z.string(),
    timeframe: z.enum(["3months", "6months", "1year", "longer"]),
  }),
})

type LeadershipPreferences = z.infer<typeof leadershipPreferencesSchema>

const defaultPreferences: LeadershipPreferences = {
  preferredDomains: ["strategy"],
  mentorshipPreference: "both",
  visibilitySettings: {
    showAchievements: true,
    showMetrics: true,
    showLeaderboardRank: true,
  },
  notificationPreferences: {
    promotionOpportunities: true,
    newChallenges: true,
    mentorshipRequests: true,
    assessmentReminders: true,
  },
  careerGoals: {
    targetTier: "team-lead",
    timeframe: "6months",
  },
}

const tierNames: Record<LeadershipTier, string> = {
  emerging: "Emerging Leader",
  captain: "Captain",
  "team-lead": "Team Lead",
  "product-owner": "Product Owner",
  executive: "Executive"
}

const domainNames: Record<LeadershipDomain, string> = {
  strategy: "Strategy",
  "product-design": "Product Design",
  "data-engineering": "Data Engineering",
  "software-development": "Software Development",
  engagement: "Engagement"
}

const tierColors: Record<LeadershipTier, string> = {
  emerging: "bg-blue-500",
  captain: "bg-green-500",
  "team-lead": "bg-purple-500",
  "product-owner": "bg-orange-500",
  executive: "bg-red-500"
}

export function LeadershipSettings() {
  const { currentUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
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

  const { data: preferences, isLoading: isLoadingPreferences } = useQuery({
    queryKey: ['leadershipPreferences', currentUser?.uid],
    queryFn: async () => {
      if (!currentUser?.uid) return null
      const db = getDatabase()
      const preferencesRef = ref(db, `users/${currentUser.uid}/leadershipPreferences`)
      const snapshot = await get(preferencesRef)
      return snapshot.exists() ? snapshot.val() as LeadershipPreferences : null
    },
    enabled: !!currentUser
  })

  const form = useForm<LeadershipPreferences>({
    resolver: zodResolver(leadershipPreferencesSchema),
    defaultValues: defaultPreferences,
  })

  useEffect(() => {
    if (preferences && !isLoadingPreferences) {
      form.reset(preferences)
      setInitializing(false)
    } else if (!isLoadingPreferences) {
      setInitializing(false)
    }
  }, [preferences, isLoadingPreferences, form])

  const onSubmit = async (data: LeadershipPreferences) => {
    if (!currentUser) {
      toast.error("You must be logged in to save preferences")
      return
    }

    try {
      setLoading(true)
      const db = getDatabase()
      const preferencesRef = ref(db, `users/${currentUser.uid}/leadershipPreferences`)
      await set(preferencesRef, data)
      toast.success("Leadership preferences saved successfully")
    } catch (error) {
      console.error("Error saving leadership preferences:", error)
      toast.error("Failed to save leadership preferences")
    } finally {
      setLoading(false)
    }
  }

  const resetToDefaults = () => {
    form.reset(defaultPreferences)
  }

  if (!currentUser) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Leadership Settings</CardTitle>
          <CardDescription>
            Manage your leadership preferences and career goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <p className="text-muted-foreground">
              Please sign in to manage your leadership settings
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (initializing || isLoadingProfile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Leadership Settings</CardTitle>
          <CardDescription>Loading your leadership information...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Leadership Settings
            </CardTitle>
            <CardDescription>
              Manage your leadership preferences and career goals
            </CardDescription>
          </div>
          {profile && (
            <Badge className={`${tierColors[profile.currentTier]} text-white`}>
              {tierNames[profile.currentTier]}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="preferences" className="space-y-4">
          <TabsList>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <UserRoundCheck className="h-4 w-4" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="mentorship" className="flex items-center gap-2">
              <Handshake className="h-4 w-4" />
              Mentorship
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Career Goals
            </TabsTrigger>
            <TabsTrigger value="visibility" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Visibility
            </TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <TabsContent value="preferences" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Domain Preferences</h3>
                    <p className="text-sm text-muted-foreground">
                      Select the leadership domains you're most interested in
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Object.entries(domainNames).map(([value, label]) => (
                      <div key={value} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`domain-${value}`}
                          value={value}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          {...form.register("preferredDomains")}
                          defaultChecked={form.getValues().preferredDomains.includes(value)}
                        />
                        <label
                          htmlFor={`domain-${value}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Notification Preferences</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose what leadership notifications you want to receive
                    </p>
                  </div>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="notificationPreferences.promotionOpportunities"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Promotion Opportunities</FormLabel>
                            <FormDescription>
                              Receive notifications about promotion eligibility and opportunities
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
                      name="notificationPreferences.newChallenges"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>New Challenges</FormLabel>
                            <FormDescription>
                              Get notified when new leadership challenges are available
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
                      name="notificationPreferences.mentorshipRequests"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Mentorship Requests</FormLabel>
                            <FormDescription>
                              Receive mentorship-related notifications and requests
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
                      name="notificationPreferences.assessmentReminders"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Assessment Reminders</FormLabel>
                            <FormDescription>
                              Get reminded about upcoming leadership assessments
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
              </TabsContent>

              <TabsContent value="mentorship" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Mentorship Preferences</h3>
                    <p className="text-sm text-muted-foreground">
                      Set your mentorship role and preferences
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="mentorshipPreference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mentorship Role</FormLabel>
                        <FormDescription>
                          Choose your preferred role in mentorship relationships
                        </FormDescription>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your mentorship preference" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="mentor">
                              <div className="flex items-center">
                                <Medal className="mr-2 h-4 w-4 text-blue-500" />
                                Mentor Others
                              </div>
                            </SelectItem>
                            <SelectItem value="mentee">
                              <div className="flex items-center">
                                <Users className="mr-2 h-4 w-4 text-green-500" />
                                Be Mentored
                              </div>
                            </SelectItem>
                            <SelectItem value="both">
                              <div className="flex items-center">
                                <Handshake className="mr-2 h-4 w-4 text-purple-500" />
                                Both Mentor and Mentee
                              </div>
                            </SelectItem>
                            <SelectItem value="none">
                              <div className="flex items-center">
                                Not Interested in Mentorship
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {profile && (
                    <div className="space-y-4 mt-6">
                      <h4 className="font-medium">Current Mentorship Status</h4>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center">
                              <Medal className="mr-2 h-4 w-4 text-blue-500" />
                              Mentors
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {profile.mentors.length > 0 ? (
                              <ul className="space-y-1">
                                {profile.mentors.map((mentorId) => (
                                  <li key={mentorId} className="text-sm">
                                    Mentor ID: {mentorId}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-muted-foreground">No mentors assigned</p>
                            )}
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center">
                              <Users className="mr-2 h-4 w-4 text-green-500" />
                              Mentees
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {profile.mentees.length > 0 ? (
                              <ul className="space-y-1">
                                {profile.mentees.map((menteeId) => (
                                  <li key={menteeId} className="text-sm">
                                    Mentee ID: {menteeId}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-muted-foreground">No mentees assigned</p>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="goals" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Career Goals</h3>
                    <p className="text-sm text-muted-foreground">
                      Set your leadership career goals and timeframe
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="careerGoals.targetTier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Leadership Level</FormLabel>
                          <FormDescription>
                            Which leadership level do you aspire to reach?
                          </FormDescription>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select target tier" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(tierNames).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="careerGoals.timeframe"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Goal Timeframe</FormLabel>
                          <FormDescription>
                            When do you aim to reach this level?
                          </FormDescription>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select timeframe" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="3months">3 Months</SelectItem>
                              <SelectItem value="6months">6 Months</SelectItem>
                              <SelectItem value="1year">1 Year</SelectItem>
                              <SelectItem value="longer">Longer Term</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {profile && (
                    <div className="mt-6 space-y-4">
                      <h4 className="font-medium">Promotion History</h4>
                      {profile.promotionHistory && profile.promotionHistory.length > 0 ? (
                        <div className="space-y-3">
                          {profile.promotionHistory.map((promotion, index) => (
                            <div key={index} className="rounded-lg border p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <Award className="h-4 w-4 text-primary" />
                                  <span>
                                    Promoted from {tierNames[promotion.fromTier]} to {tierNames[promotion.toTier]}
                                  </span>
                                </div>
                                <Badge variant="outline">
                                  {new Date(promotion.timestamp).toLocaleDateString()}
                                </Badge>
                              </div>
                              {promotion.approvedBy && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  Approved by: {promotion.approvedBy}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No promotion history available</p>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="visibility" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Profile Visibility</h3>
                    <p className="text-sm text-muted-foreground">
                      Control what leadership information is visible to others
                    </p>
                  </div>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="visibilitySettings.showAchievements"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Show Achievements</FormLabel>
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
                      name="visibilitySettings.showMetrics"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Show Performance Metrics</FormLabel>
                            <FormDescription>
                              Display your leadership performance metrics
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
                      name="visibilitySettings.showLeaderboardRank"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Show Leaderboard Rank</FormLabel>
                            <FormDescription>
                              Display your position on the leadership leaderboard
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
              </TabsContent>

              <div className="flex items-center justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetToDefaults}
                >
                  Reset to Defaults
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                      Saving...
                    </>
                  ) : (
                    "Save Preferences"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </Tabs>
      </CardContent>
    </Card>
  )
}

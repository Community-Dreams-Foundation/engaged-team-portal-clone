
import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { LeadershipDomain, LeadershipTier } from "@/types/leadership"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/components/ui/use-toast"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { updateLeadershipSettings } from "@/utils/leadership/userLeadershipSettings"

// Schema for the leadership settings form
const leadershipFormSchema = z.object({
  preferredDomain: z.string().optional(),
  careerGoal: z.string().optional(),
  mentorshipEnabled: z.boolean().default(false),
  careerStatement: z.string().max(500, "Career statement must be less than 500 characters").optional(),
  visibilityPreference: z.boolean().default(true),
})

type LeadershipFormValues = z.infer<typeof leadershipFormSchema>

export function LeadershipSettings() {
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // Default form values - would be populated from user profile in production
  const defaultValues: LeadershipFormValues = {
    preferredDomain: "software-development",
    careerGoal: "team-lead",
    mentorshipEnabled: false,
    careerStatement: "",
    visibilityPreference: true,
  }

  const form = useForm<LeadershipFormValues>({
    resolver: zodResolver(leadershipFormSchema),
    defaultValues,
  })

  const onSubmit = async (data: LeadershipFormValues) => {
    if (!currentUser) return

    setIsLoading(true)
    try {
      // In a real implementation, this would save to a database
      await updateLeadershipSettings(currentUser.uid, data)
      toast({
        title: "Leadership settings updated",
        description: "Your leadership preferences have been saved successfully.",
      })
    } catch (error) {
      console.error("Error updating leadership settings:", error)
      toast({
        variant: "destructive",
        title: "Failed to update settings",
        description: "Please try again later.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leadership Development</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="preferredDomain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Leadership Domain</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a domain" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="strategy">Strategy</SelectItem>
                        <SelectItem value="product-design">Product Design</SelectItem>
                        <SelectItem value="data-engineering">Data Engineering</SelectItem>
                        <SelectItem value="software-development">Software Development</SelectItem>
                        <SelectItem value="engagement">Team Engagement</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      This domain will be your primary focus for leadership development.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="careerGoal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Career Goal (Leadership Tier)</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a leadership tier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="emerging">Emerging Leader</SelectItem>
                        <SelectItem value="captain">Team Captain</SelectItem>
                        <SelectItem value="team-lead">Team Lead</SelectItem>
                        <SelectItem value="product-owner">Product Owner</SelectItem>
                        <SelectItem value="executive">Executive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Your target leadership level to achieve.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mentorshipEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Mentorship Program</FormLabel>
                      <FormDescription>
                        Enable to participate in the mentorship program.
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
                name="careerStatement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Leadership Statement</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share your leadership philosophy and goals..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This will be visible to your mentors and team members.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="visibilityPreference"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Public Leadership Profile</FormLabel>
                      <FormDescription>
                        Make your leadership metrics and achievements visible to the community.
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

            <Separator />

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Leadership Settings"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

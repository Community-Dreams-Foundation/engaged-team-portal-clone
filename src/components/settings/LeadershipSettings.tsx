
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormDescription, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeadershipProfile, LeadershipDomain, LeadershipTier } from "@/types/leadership";
import { LeadershipApi } from "@/api/gateway";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type LeadershipFormValues = {
  mentorshipPreferences: {
    availableAsMentor: boolean;
    seekingMentor: boolean;
    preferredMentorshipAreas: string[];
  };
  displaySettings: {
    showAchievements: boolean;
    showMetrics: boolean;
  };
  specializations: LeadershipDomain[];
};

const domainOptions: { value: LeadershipDomain; label: string }[] = [
  { value: "strategy", label: "Strategy" },
  { value: "product-design", label: "Product Design" },
  { value: "data-engineering", label: "Data Engineering" },
  { value: "software-development", label: "Software Development" },
  { value: "engagement", label: "Engagement" },
];

export function LeadershipSettings() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<LeadershipProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize form with default values
  const form = useForm<LeadershipFormValues>({
    defaultValues: {
      mentorshipPreferences: {
        availableAsMentor: false,
        seekingMentor: false,
        preferredMentorshipAreas: [],
      },
      displaySettings: {
        showAchievements: true,
        showMetrics: true,
      },
      specializations: [],
    },
  });

  useEffect(() => {
    const fetchLeadershipProfile = async () => {
      if (!currentUser?.uid) return;
      
      try {
        setIsLoading(true);
        const profileData = await LeadershipApi.fetchProfile(currentUser.uid);
        setProfile(profileData);
        
        // Populate form with existing data if available
        if (profileData) {
          form.reset({
            mentorshipPreferences: {
              availableAsMentor: profileData.mentorshipPreferences?.availableAsMentor || false,
              seekingMentor: profileData.mentorshipPreferences?.seekingMentor || false,
              preferredMentorshipAreas: profileData.mentorshipPreferences?.preferredMentorshipAreas || [],
            },
            displaySettings: {
              showAchievements: profileData.displaySettings?.showAchievements || true,
              showMetrics: profileData.displaySettings?.showMetrics || true,
            },
            specializations: profileData.specializations || [],
          });
        }
      } catch (error) {
        console.error("Error fetching leadership profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeadershipProfile();
  }, [currentUser, form]);

  const onSubmit = async (data: LeadershipFormValues) => {
    if (!currentUser?.uid) return;
    
    try {
      // If no profile exists, create a basic one with the form data
      const profileToUpdate = profile || {
        userId: currentUser.uid,
        currentTier: "emerging" as LeadershipTier,
        joinedAt: Date.now(),
        assessments: [],
        trainingCompleted: [],
        metrics: {
          overallScore: 0,
          leaderboardRank: 0,
        },
        achievements: [],
        mentors: [],
        mentees: [],
      };
      
      // Update with form data
      const updatedProfile = {
        ...profileToUpdate,
        mentorshipPreferences: data.mentorshipPreferences,
        displaySettings: data.displaySettings,
        specializations: data.specializations,
      };
      
      await LeadershipApi.updateProfile(updatedProfile);
      setProfile(updatedProfile as LeadershipProfile);
      
      toast.success("Leadership settings saved successfully");
    } catch (error) {
      console.error("Error saving leadership settings:", error);
      toast.error("Failed to save settings. Please try again.");
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-bold">Leadership Settings</h3>
          <p className="text-muted-foreground">
            Configure your leadership preferences and visibility settings
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-6">
            <p>Loading leadership settings...</p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="mentorship" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="mentorship">Mentorship</TabsTrigger>
                  <TabsTrigger value="specializations">Specializations</TabsTrigger>
                  <TabsTrigger value="visibility">Visibility</TabsTrigger>
                </TabsList>
                
                <TabsContent value="mentorship" className="space-y-4 pt-4">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="mentorshipPreferences.availableAsMentor"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Available as Mentor</FormLabel>
                            <FormDescription>
                              Make yourself available to mentor other team members
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="mentorshipPreferences.seekingMentor"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Seeking Mentor</FormLabel>
                            <FormDescription>
                              Indicate that you're looking for a mentor
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="mentorshipPreferences.preferredMentorshipAreas"
                      render={() => (
                        <FormItem>
                          <FormLabel>Preferred Mentorship Areas</FormLabel>
                          <FormDescription>
                            Select the areas where you'd like to mentor others or receive mentorship
                          </FormDescription>
                          <div className="mt-2">
                            {domainOptions.map((option) => (
                              <FormField
                                key={option.value}
                                control={form.control}
                                name="mentorshipPreferences.preferredMentorshipAreas"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={option.value}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(option.value)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, option.value])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== option.value
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        {option.label}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="specializations" className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="specializations"
                    render={() => (
                      <FormItem>
                        <FormLabel>Leadership Specializations</FormLabel>
                        <FormDescription>
                          Select your leadership domains of expertise
                        </FormDescription>
                        <div className="mt-2">
                          {domainOptions.map((option) => (
                            <FormField
                              key={option.value}
                              control={form.control}
                              name="specializations"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={option.value}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(option.value)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, option.value])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== option.value
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {option.label}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
                
                <TabsContent value="visibility" className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="displaySettings.showAchievements"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
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
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Show Metrics</FormLabel>
                          <FormDescription>
                            Make your leadership metrics visible to team members
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>
              
              <Button type="submit" className="mt-6">
                Save Settings
              </Button>
            </form>
          </Form>
        )}
      </div>
    </Card>
  );
}

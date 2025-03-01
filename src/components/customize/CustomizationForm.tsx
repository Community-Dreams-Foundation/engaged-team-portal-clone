
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { CosCustomizationData, cosCustomizationSchema } from "./types";

export function CustomizationForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<CosCustomizationData>({
    resolver: zodResolver(cosCustomizationSchema),
    defaultValues: {
      tone: "casual",
      communicationStyle: "casual",
      notificationFrequency: "medium",
      agentInteractionLevel: "medium",
      workloadThreshold: 40,
      delegationPreference: "balanced",
      trainingFocus: ["time-management", "leadership", "delegation"],
      aiFeatures: {
        autoLearning: true,
        proactiveAssistance: true,
        contextAwareness: true
      }
    },
  });

  async function onSubmit(values: CosCustomizationData) {
    try {
      setIsSubmitting(true);
      
      // Store form data in localStorage for use in next steps
      localStorage.setItem("cosCustomizationData", JSON.stringify(values));
      
      toast({
        title: "CoS preferences saved!",
        description: "Let's see your AI Chief of Staff in action.",
      });
      
      // Navigate to the simulation page
      navigate("/simulate");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem saving your preferences.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-card rounded-lg shadow-sm">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Communication Preferences</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tone</label>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant={form.watch("tone") === "formal" ? "default" : "outline"}
                        onClick={() => form.setValue("tone", "formal")}
                        className="flex-1"
                      >
                        Formal
                      </Button>
                      <Button
                        type="button"
                        variant={form.watch("tone") === "casual" ? "default" : "outline"}
                        onClick={() => form.setValue("tone", "casual")}
                        className="flex-1"
                      >
                        Casual
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Communication Style</label>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant={form.watch("communicationStyle") === "formal" ? "default" : "outline"}
                        onClick={() => form.setValue("communicationStyle", "formal")}
                        className="flex-1"
                      >
                        Formal
                      </Button>
                      <Button
                        type="button"
                        variant={form.watch("communicationStyle") === "casual" ? "default" : "outline"}
                        onClick={() => form.setValue("communicationStyle", "casual")}
                        className="flex-1"
                      >
                        Casual
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Notification Frequency</label>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant={form.watch("notificationFrequency") === "low" ? "default" : "outline"}
                        onClick={() => form.setValue("notificationFrequency", "low")}
                        className="flex-1"
                      >
                        Low
                      </Button>
                      <Button
                        type="button"
                        variant={form.watch("notificationFrequency") === "medium" ? "default" : "outline"}
                        onClick={() => form.setValue("notificationFrequency", "medium")}
                        className="flex-1"
                      >
                        Medium
                      </Button>
                      <Button
                        type="button"
                        variant={form.watch("notificationFrequency") === "high" ? "default" : "outline"}
                        onClick={() => form.setValue("notificationFrequency", "high")}
                        className="flex-1"
                      >
                        High
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Workload Management</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Agent Interaction Level</label>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant={form.watch("agentInteractionLevel") === "low" ? "default" : "outline"}
                        onClick={() => form.setValue("agentInteractionLevel", "low")}
                        className="flex-1"
                      >
                        Low
                      </Button>
                      <Button
                        type="button"
                        variant={form.watch("agentInteractionLevel") === "medium" ? "default" : "outline"}
                        onClick={() => form.setValue("agentInteractionLevel", "medium")}
                        className="flex-1"
                      >
                        Medium
                      </Button>
                      <Button
                        type="button"
                        variant={form.watch("agentInteractionLevel") === "high" ? "default" : "outline"}
                        onClick={() => form.setValue("agentInteractionLevel", "high")}
                        className="flex-1"
                      >
                        High
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Workload Threshold (hours/week)</label>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant={form.watch("workloadThreshold") === 20 ? "default" : "outline"}
                        onClick={() => form.setValue("workloadThreshold", 20)}
                        className="flex-1"
                      >
                        20h
                      </Button>
                      <Button
                        type="button"
                        variant={form.watch("workloadThreshold") === 40 ? "default" : "outline"}
                        onClick={() => form.setValue("workloadThreshold", 40)}
                        className="flex-1"
                      >
                        40h
                      </Button>
                      <Button
                        type="button"
                        variant={form.watch("workloadThreshold") === 60 ? "default" : "outline"}
                        onClick={() => form.setValue("workloadThreshold", 60)}
                        className="flex-1"
                      >
                        60h
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Delegation Preference</label>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant={form.watch("delegationPreference") === "conservative" ? "default" : "outline"}
                        onClick={() => form.setValue("delegationPreference", "conservative")}
                        className="flex-1 text-xs"
                      >
                        Conservative
                      </Button>
                      <Button
                        type="button"
                        variant={form.watch("delegationPreference") === "balanced" ? "default" : "outline"}
                        onClick={() => form.setValue("delegationPreference", "balanced")}
                        className="flex-1 text-xs"
                      >
                        Balanced
                      </Button>
                      <Button
                        type="button"
                        variant={form.watch("delegationPreference") === "aggressive" ? "default" : "outline"}
                        onClick={() => form.setValue("delegationPreference", "aggressive")}
                        className="flex-1 text-xs"
                      >
                        Aggressive
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Training Focus</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "time-management",
                  "leadership",
                  "delegation",
                  "communication",
                  "project-management",
                  "decision-making",
                  "conflict-resolution",
                  "strategic-planning"
                ].map((focus) => (
                  <Button
                    key={focus}
                    type="button"
                    variant={form.watch("trainingFocus")?.includes(focus) ? "default" : "outline"}
                    onClick={() => {
                      const currentFocus = form.watch("trainingFocus") || [];
                      if (currentFocus.includes(focus)) {
                        form.setValue(
                          "trainingFocus",
                          currentFocus.filter((f) => f !== focus)
                        );
                      } else {
                        form.setValue("trainingFocus", [...currentFocus, focus]);
                      }
                    }}
                    className="text-xs"
                  >
                    {focus.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">AI Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  type="button"
                  variant={form.watch("aiFeatures.autoLearning") ? "default" : "outline"}
                  onClick={() => form.setValue("aiFeatures.autoLearning", !form.watch("aiFeatures.autoLearning"))}
                  className="justify-start"
                >
                  Auto-Learning
                </Button>
                <Button
                  type="button"
                  variant={form.watch("aiFeatures.proactiveAssistance") ? "default" : "outline"}
                  onClick={() => form.setValue("aiFeatures.proactiveAssistance", !form.watch("aiFeatures.proactiveAssistance"))}
                  className="justify-start"
                >
                  Proactive Assistance
                </Button>
                <Button
                  type="button"
                  variant={form.watch("aiFeatures.contextAwareness") ? "default" : "outline"}
                  onClick={() => form.setValue("aiFeatures.contextAwareness", !form.watch("aiFeatures.contextAwareness"))}
                  className="justify-start"
                >
                  Context Awareness
                </Button>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Continue to Simulation"}
          </Button>
        </form>
      </Form>
    </div>
  );
}


import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { cosCustomizationSchema, type CosCustomizationData } from "./types";

export function CustomizationForm() {
  const navigate = useNavigate();
  const form = useForm<CosCustomizationData>({
    resolver: zodResolver(cosCustomizationSchema),
    defaultValues: {
      communicationStyle: "Collaborative",
      primaryFocus: "Strategic Planning",
      decisionStyle: "Balanced",
      feedbackPreference: "As-needed",
      specialInstructions: "",
    },
  });

  async function onSubmit(values: CosCustomizationData) {
    try {
      // Store customization data in localStorage
      localStorage.setItem("cosCustomization", JSON.stringify(values));
      
      toast({
        title: "Preferences saved!",
        description: "Let's proceed to the simulation.",
      });
      
      // Navigate to the next step (simulation page - to be implemented)
      navigate("/simulation");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem saving your preferences.",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="communicationStyle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Communication Style</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a communication style" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Direct">Direct</SelectItem>
                  <SelectItem value="Collaborative">Collaborative</SelectItem>
                  <SelectItem value="Diplomatic">Diplomatic</SelectItem>
                  <SelectItem value="Analytical">Analytical</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                How would you like your AI CoS to communicate with you?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="primaryFocus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Primary Focus</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a primary focus" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Strategic Planning">Strategic Planning</SelectItem>
                  <SelectItem value="Project Management">Project Management</SelectItem>
                  <SelectItem value="Team Coordination">Team Coordination</SelectItem>
                  <SelectItem value="Resource Optimization">Resource Optimization</SelectItem>
                  <SelectItem value="Process Improvement">Process Improvement</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                What should be the main focus area for your AI CoS?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="decisionStyle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Decision-Making Style</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a decision-making style" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Data-Driven">Data-Driven</SelectItem>
                  <SelectItem value="Intuitive">Intuitive</SelectItem>
                  <SelectItem value="Balanced">Balanced</SelectItem>
                  <SelectItem value="Consultative">Consultative</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                How should your AI CoS approach decision-making?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="feedbackPreference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Feedback Preference</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a feedback preference" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Real-time">Real-time</SelectItem>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="As-needed">As-needed</SelectItem>
                  <SelectItem value="Milestone-based">Milestone-based</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                How often would you like to receive feedback?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specialInstructions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Special Instructions</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any specific instructions or preferences for your AI CoS..."
                  className="h-32 resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Optional: Add any additional preferences or instructions (max 500 characters)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Continue to Simulation
        </Button>
      </form>
    </Form>
  );
}

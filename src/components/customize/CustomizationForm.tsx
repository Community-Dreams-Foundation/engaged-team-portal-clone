
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
import { cosCustomizationSchema, type CosCustomizationData } from "./types";

export const CustomizationForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
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

  const onSubmit = (data: CosCustomizationData) => {
    localStorage.setItem("cosCustomizationData", JSON.stringify(data));
    toast({
      title: "Preferences Saved",
      description: "Your CoS has been customized successfully.",
    });
    navigate("/simulate-cos");
  };

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
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="decisionStyle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Decision Making Style</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a decision making style" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Data-Driven">Data-Driven</SelectItem>
                  <SelectItem value="Intuitive">Intuitive</SelectItem>
                  <SelectItem value="Balanced">Balanced</SelectItem>
                  <SelectItem value="Consultative">Consultative</SelectItem>
                </SelectContent>
              </Select>
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
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specialInstructions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Special Instructions (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any specific instructions or preferences..."
                  {...field}
                />
              </FormControl>
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
};

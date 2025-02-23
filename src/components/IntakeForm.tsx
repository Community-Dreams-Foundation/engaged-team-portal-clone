
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { PersonalInfoFields } from "./intake/PersonalInfoFields";
import { AvailabilityField } from "./intake/AvailabilityField";
import { DreamerStatement } from "./intake/DreamerStatement";
import { ResumeUpload } from "./intake/ResumeUpload";
import { intakeFormSchema, type IntakeFormData } from "./intake/types";

export function IntakeForm() {
  const navigate = useNavigate();
  const form = useForm<IntakeFormData>({
    resolver: zodResolver(intakeFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      position: "",
      availability: 0,
      dreamerStatement: "",
    },
  });

  async function onSubmit(values: IntakeFormData) {
    try {
      // Here you would typically send the data to your backend
      console.log(values);
      
      toast({
        title: "Success!",
        description: "Your intake form has been submitted.",
      });
      
      // Redirect to dashboard or home page after successful submission
      navigate("/");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem submitting your form.",
      });
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">DreamStream Fellowship Intake Form</h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <PersonalInfoFields form={form} />
          <AvailabilityField form={form} />
          <DreamerStatement form={form} />
          <ResumeUpload form={form} />

          <Button type="submit" className="w-full">
            Submit
          </Button>
        </form>
      </Form>
    </div>
  );
}


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
import { DocumentAgreement } from "./intake/DocumentAgreement";
import { intakeFormSchema, type IntakeFormData } from "./intake/types";
import { useState } from "react";

export function IntakeForm() {
  const navigate = useNavigate();
  const [hasAgreedToTerms, setHasAgreedToTerms] = useState(false);
  
  const form = useForm<IntakeFormData>({
    resolver: zodResolver(intakeFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      position: "",
      availability: 40,
      dreamerStatement: "",
    },
  });

  async function onSubmit(values: IntakeFormData) {
    try {
      if (!hasAgreedToTerms) {
        toast({
          variant: "destructive",
          title: "Document Submission Required",
          description: "You must review, sign, and agree to all onboarding documents before proceeding.",
        });
        return;
      }
      
      // Store form data in localStorage for use in next steps
      localStorage.setItem("intakeFormData", JSON.stringify(values));
      
      toast({
        title: "Profile saved!",
        description: "Let's customize your AI Chief of Staff.",
      });
      
      // Navigate to the CoS customization page - using correct URL
      navigate("/customize-cos");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem saving your profile.",
      });
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <PersonalInfoFields form={form} />
          <AvailabilityField form={form} />
          <DreamerStatement form={form} />
          <ResumeUpload form={form} />
          <DocumentAgreement onAgreementChange={setHasAgreedToTerms} agreed={hasAgreedToTerms} />

          <Button type="submit" className="w-full" disabled={!hasAgreedToTerms}>
            Continue to CoS Customization
          </Button>
        </form>
      </Form>
    </div>
  );
}


import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DocumentAgreement } from "@/components/intake/DocumentAgreement";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft, ArrowRight } from "lucide-react";

const OnboardingDocuments = () => {
  const navigate = useNavigate();
  const [hasAgreedToTerms, setHasAgreedToTerms] = useState(false);

  const handleBackClick = () => {
    navigate("/intake");
  };

  const handleContinueClick = () => {
    if (!hasAgreedToTerms) {
      toast({
        variant: "destructive",
        title: "Document Submission Required",
        description: "You must review, sign, and agree to all onboarding documents before proceeding.",
      });
      return;
    }

    // Navigate to the CoS customization page
    navigate("/customize-cos");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Onboarding Documents</h1>
            <p className="text-muted-foreground mt-2">
              Step 2 of 4: Review and sign your onboarding documents
            </p>
          </div>
          
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-in-out"
              style={{ width: "50%" }}
            />
          </div>

          <div className="max-w-3xl mx-auto p-6">
            <p className="text-muted-foreground mb-6">
              Before proceeding to customize your AI Chief of Staff, please review and sign all of the following documents. 
              These documents outline our working relationship and are essential for your onboarding process.
            </p>
            
            <DocumentAgreement onAgreementChange={setHasAgreedToTerms} agreed={hasAgreedToTerms} />
            
            <div className="flex justify-between mt-8">
              <Button 
                variant="outline" 
                onClick={handleBackClick}
                className="flex items-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Profile
              </Button>
              
              <Button 
                onClick={handleContinueClick}
                className="flex items-center"
                disabled={!hasAgreedToTerms}
              >
                Continue to CoS Customization
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingDocuments;

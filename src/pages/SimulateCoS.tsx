
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { CosCustomizationData } from "@/components/customize/types";
import type { IntakeFormData } from "@/components/intake/types";

const SimulateCoS = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user completed previous steps
    const intakeData = localStorage.getItem("intakeFormData");
    const customizationData = localStorage.getItem("cosCustomizationData");

    if (!intakeData || !customizationData) {
      toast({
        title: "Missing Information",
        description: "Please complete the previous steps first.",
        variant: "destructive",
      });
      navigate("/intake");
      return;
    }

    const userData: IntakeFormData = JSON.parse(intakeData);
    const cosData: CosCustomizationData = JSON.parse(customizationData);
    console.log("User data for simulation:", { userData, cosData });
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Interactive CoS Simulation</h1>
            <p className="text-muted-foreground mt-2">
              Step 3 of 4: Let's simulate working with your AI Chief of Staff
            </p>
          </div>
          
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-in-out"
              style={{ width: "75%" }}
            />
          </div>

          <div className="bg-card rounded-lg shadow-sm p-6 space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-semibold">Welcome to the Simulation</h2>
              <p className="text-muted-foreground">
                Experience working with your customized AI Chief of Staff through a series of 
                interactive scenarios. This will help you understand how your CoS will assist 
                you in real-world situations.
              </p>
            </div>

            <div className="grid gap-6">
              <div className="bg-muted/50 p-4 rounded-md">
                <h3 className="font-medium mb-2">Scenario 1: Morning Briefing</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your AI Chief of Staff prepares your daily brief, highlighting key priorities 
                  and upcoming commitments.
                </p>
                <Button variant="secondary" className="w-full">
                  Start Scenario
                </Button>
              </div>

              <div className="bg-muted/50 p-4 rounded-md opacity-70">
                <h3 className="font-medium mb-2">Scenario 2: Project Planning</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Work with your CoS to plan and organize a new project initiative.
                </p>
                <Button variant="secondary" className="w-full" disabled>
                  Coming Soon
                </Button>
              </div>

              <div className="bg-muted/50 p-4 rounded-md opacity-70">
                <h3 className="font-medium mb-2">Scenario 3: Team Coordination</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  See how your CoS helps manage team communications and assignments.
                </p>
                <Button variant="secondary" className="w-full" disabled>
                  Coming Soon
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulateCoS;

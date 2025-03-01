
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getDatabase, ref, set } from "firebase/database";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, Check, Bot } from "lucide-react";
import type { IntakeFormData } from "@/components/intake/types";
import type { CosCustomizationData } from "@/components/customize/types";
import type { CoSPreferences } from "@/types/agent";

const FinalizeCoS = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isDeploying, setIsDeploying] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [userData, setUserData] = useState<IntakeFormData | null>(null);
  const [cosData, setCosData] = useState<CosCustomizationData | null>(null);

  useEffect(() => {
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

    const parsedUserData: IntakeFormData = JSON.parse(intakeData);
    const parsedCosData: CosCustomizationData = JSON.parse(customizationData);
    setUserData(parsedUserData);
    setCosData(parsedCosData);
  }, [navigate]);

  const handleDeployAgent = async () => {
    if (!currentUser || !cosData) return;
    
    setIsDeploying(true);
    
    try {
      // Create CoS preferences object from form data
      const preferences: CoSPreferences = {
        // Map communication style to tone (formal or casual)
        tone: cosData.communicationStyle === "Analytical" || cosData.communicationStyle === "Diplomatic" ? "formal" : "casual",
        // Map feedback preference to notification frequency
        notificationFrequency: cosData.feedbackPreference === "Real-time" ? "high" : 
                              cosData.feedbackPreference === "Scheduled" ? "medium" : "low",
        // Convert primaryFocus to lowercase with hyphens for trainingFocus
        trainingFocus: [cosData.primaryFocus.toLowerCase().replace(/ /g, "-")],
        workloadThreshold: 40, // Default value
        // Map decision style to delegation preference
        delegationPreference: cosData.decisionStyle === "Data-Driven" ? "conservative" : 
                             cosData.decisionStyle === "Intuitive" ? "aggressive" : "balanced",
        // Map communication style to formal/casual string
        communicationStyle: cosData.communicationStyle === "Analytical" || cosData.communicationStyle === "Diplomatic" ? "formal" : "casual",
        // Map feedback preference to interaction level
        agentInteractionLevel: cosData.feedbackPreference === "Real-time" ? "high" : 
                              cosData.feedbackPreference === "Scheduled" ? "medium" : "low",
        aiFeatures: {
          autoLearning: true,
          proactiveAssistance: true,
          contextAwareness: true
        }
      };
      
      // Create initial agent
      const db = getDatabase();
      await set(ref(db, `users/${currentUser.uid}/cosPreferences`), preferences);
      
      // Create a default agent
      const defaultAgent = {
        id: `agent-${Date.now()}`,
        type: "general",
        name: "Primary CoS Agent",
        skills: preferences.trainingFocus,
        currentLoad: 0,
        assignedTasks: [],
        performance: {
          successRate: 100,
          averageTaskTime: 0,
          tasksCompleted: 0
        },
        createdAt: Date.now(),
        lastActive: Date.now(),
        status: "active",
        specializationScore: {
          "leadership": preferences.trainingFocus.includes("leadership") ? 80 : 50,
          "time-management": preferences.trainingFocus.includes("time-management") ? 80 : 50,
          "project-management": preferences.trainingFocus.includes("project-management") ? 80 : 50,
        }
      };
      
      await set(ref(db, `users/${currentUser.uid}/agents/${defaultAgent.id}`), defaultAgent);
      
      // Success! Mark as complete
      setIsComplete(true);
      
      // Clear the setup data from localStorage since we've stored it in the database
      localStorage.removeItem("intakeFormData");
      localStorage.removeItem("cosCustomizationData");
      
      toast({
        title: "CoS Agent Deployed!",
        description: "Your AI Chief of Staff is now ready to assist you.",
      });
      
      // Wait 2 seconds before navigating to the dashboard
      setTimeout(() => {
        navigate("/cos-agent");
      }, 2000);
      
    } catch (error) {
      console.error("Error deploying CoS agent:", error);
      toast({
        variant: "destructive",
        title: "Deployment Failed",
        description: "There was an error deploying your CoS agent. Please try again.",
      });
      setIsDeploying(false);
    }
  };

  // Helper functions to display human-readable values
  const getCommunicationStyleDisplay = (style?: string) => {
    return style || "Collaborative";
  };

  const getNotificationFrequencyDisplay = (freq?: string) => {
    return freq || "As-needed";
  };

  const getDecisionStyleDisplay = (style?: string) => {
    return style || "Balanced";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Deploy Your AI Chief of Staff</h1>
            <p className="text-muted-foreground mt-2">
              Step 4 of 4: Ready to deploy your personalized CoS agent
            </p>
          </div>
          
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-in-out"
              style={{ width: "100%" }}
            />
          </div>

          <div className="bg-card rounded-lg shadow-sm p-8 space-y-8">
            <div className="text-center space-y-2">
              <Bot className="h-16 w-16 mx-auto text-primary" />
              <h2 className="text-2xl font-semibold">Your CoS Agent is Ready</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                You've completed all the setup steps. Your AI Chief of Staff has been
                customized based on your preferences and is ready to be deployed.
              </p>
            </div>

            {userData && cosData && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Profile</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{userData.fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Role:</span>
                      <span className="font-medium">{userData.position}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Availability:</span>
                      <span className="font-medium">{userData.availability} hours/week</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Agent Preferences</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Communication:</span>
                      <span className="font-medium capitalize">{getCommunicationStyleDisplay(cosData.communicationStyle)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Notification Frequency:</span>
                      <span className="font-medium capitalize">{getNotificationFrequencyDisplay(cosData.feedbackPreference)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Decision Style:</span>
                      <span className="font-medium capitalize">{getDecisionStyleDisplay(cosData.decisionStyle)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4">
              {isComplete ? (
                <div className="flex items-center justify-center space-x-2 text-green-500">
                  <Check className="h-5 w-5" />
                  <span>CoS Agent successfully deployed!</span>
                </div>
              ) : (
                <Button 
                  onClick={handleDeployAgent} 
                  disabled={isDeploying}
                  className="w-full"
                  size="lg"
                >
                  {isDeploying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deploying CoS Agent...
                    </>
                  ) : (
                    "Deploy My CoS Agent"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalizeCoS;


import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { CosCustomizationData } from "@/components/customize/types";
import type { IntakeFormData } from "@/components/intake/types";
import { Card } from "@/components/ui/card";

const SimulateCoS = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userData, setUserData] = useState<IntakeFormData | null>(null);
  const [cosData, setCosData] = useState<CosCustomizationData | null>(null);
  const [isScenarioActive, setIsScenarioActive] = useState(false);
  const [currentScenario, setCurrentScenario] = useState<"morning" | "project" | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

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

    const parsedUserData: IntakeFormData = JSON.parse(intakeData);
    const parsedCosData: CosCustomizationData = JSON.parse(customizationData);
    setUserData(parsedUserData);
    setCosData(parsedCosData);
    console.log("User data for simulation:", { parsedUserData, parsedCosData });
  }, [navigate, toast]);

  const handleStartScenario = (scenario: "morning" | "project") => {
    setIsScenarioActive(true);
    setCurrentScenario(scenario);
    setCurrentStep(0);
    toast({
      title: "Scenario Started",
      description: scenario === "morning" 
        ? "Welcome to your morning briefing with your AI Chief of Staff."
        : "Let's plan a new project together with your AI Chief of Staff.",
    });
  };

  const generateMorningBrief = () => {
    if (!userData || !cosData) return null;

    const briefingStyle = {
      Direct: "Here's your morning brief:",
      Collaborative: "Let's review your morning priorities together:",
      Diplomatic: "I've prepared your morning overview:",
      Analytical: "Based on the current data, here's your morning analysis:",
    }[cosData.communicationStyle];

    const focusArea = {
      "Strategic Planning": "strategic initiatives",
      "Project Management": "project milestones",
      "Team Coordination": "team activities",
      "Resource Optimization": "resource allocation",
      "Process Improvement": "process efficiency",
    }[cosData.primaryFocus];

    const steps = [
      {
        title: "Introduction",
        content: `${briefingStyle}\nGood morning ${userData.fullName}. As your ${cosData.communicationStyle} Chief of Staff, I'll be focusing on ${focusArea} today.`,
      },
      {
        title: "Daily Overview",
        content: "I've analyzed your calendar and priorities for today. Here's what needs your attention:",
      },
      {
        title: "Priority Tasks",
        content: "1. Review and approve the quarterly strategy document\n2. Team standup at 10 AM\n3. Client presentation preparation\n4. Budget review for Q2",
      },
      {
        title: "Recommendations",
        content: "Based on your workload, I recommend focusing on the client presentation first, as it has the highest impact on this week's objectives.",
      },
    ];

    return steps[currentStep];
  };

  const generateProjectPlan = () => {
    if (!userData || !cosData) return null;

    const planningStyle = {
      Direct: "Here's the project breakdown:",
      Collaborative: "Let's develop this project plan together:",
      Diplomatic: "I suggest we consider the following approach:",
      Analytical: "Based on the requirements, here's my analysis:",
    }[cosData.communicationStyle];

    const focusEmphasis = {
      "Strategic Planning": "strategic alignment",
      "Project Management": "timeline and deliverables",
      "Team Coordination": "team roles and responsibilities",
      "Resource Optimization": "resource allocation",
      "Process Improvement": "workflow optimization",
    }[cosData.primaryFocus];

    const steps = [
      {
        title: "Project Definition",
        content: `${planningStyle}\n${userData.fullName}, let's start by defining the project scope. I'll help ensure we maintain strong ${focusEmphasis}.`,
      },
      {
        title: "Timeline Planning",
        content: "I've drafted a preliminary timeline:\n1. Research & Planning (2 weeks)\n2. Development Phase (6 weeks)\n3. Testing & Refinement (2 weeks)\n4. Launch Preparation (2 weeks)",
      },
      {
        title: "Resource Allocation",
        content: "Based on the project scope, we'll need:\n- 2 Frontend Developers\n- 1 Backend Developer\n- 1 UX Designer\n- 1 Project Manager\n\nShall I start drafting the resource request?",
      },
      {
        title: "Next Steps",
        content: "To move forward, I recommend:\n1. Scheduling a kick-off meeting\n2. Creating the project charter\n3. Setting up the project tracking tools\n4. Drafting initial team communications",
      },
    ];

    return steps[currentStep];
  };

  const getCurrentContent = () => {
    if (!isScenarioActive || !currentScenario) return null;
    return currentScenario === "morning" ? generateMorningBrief() : generateProjectPlan();
  };

  const currentContent = getCurrentContent();

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
                {(!isScenarioActive || currentScenario !== "morning") ? (
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => handleStartScenario("morning")}
                    disabled={isScenarioActive && currentScenario !== "morning"}
                  >
                    {isScenarioActive ? "In Progress" : "Start Scenario"}
                  </Button>
                ) : (
                  <Card className="p-4 space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">{currentContent?.title}</h4>
                      <p className="whitespace-pre-line">{currentContent?.content}</p>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        onClick={() => {
                          if (currentStep < 3) {
                            setCurrentStep(prev => prev + 1);
                          } else {
                            setIsScenarioActive(false);
                            setCurrentStep(0);
                            setCurrentScenario(null);
                            toast({
                              title: "Scenario Completed",
                              description: "You've completed the morning briefing scenario!",
                            });
                          }
                        }}
                      >
                        {currentStep < 3 ? "Continue" : "Complete Scenario"}
                      </Button>
                    </div>
                  </Card>
                )}
              </div>

              <div className="bg-muted/50 p-4 rounded-md">
                <h3 className="font-medium mb-2">Scenario 2: Project Planning</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Work with your CoS to plan and organize a new project initiative.
                </p>
                {(!isScenarioActive || currentScenario !== "project") ? (
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => handleStartScenario("project")}
                    disabled={isScenarioActive && currentScenario !== "project"}
                  >
                    {isScenarioActive ? "In Progress" : "Start Scenario"}
                  </Button>
                ) : (
                  <Card className="p-4 space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">{currentContent?.title}</h4>
                      <p className="whitespace-pre-line">{currentContent?.content}</p>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        onClick={() => {
                          if (currentStep < 3) {
                            setCurrentStep(prev => prev + 1);
                          } else {
                            setIsScenarioActive(false);
                            setCurrentStep(0);
                            setCurrentScenario(null);
                            toast({
                              title: "Scenario Completed",
                              description: "You've completed the project planning scenario!",
                            });
                          }
                        }}
                      >
                        {currentStep < 3 ? "Continue" : "Complete Scenario"}
                      </Button>
                    </div>
                  </Card>
                )}
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


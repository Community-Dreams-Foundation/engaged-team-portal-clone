
"use client";

import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface WelcomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WelcomeModal({ open, onOpenChange }: WelcomeModalProps) {
  const navigate = useNavigate();

  const handleStartTutorial = () => {
    onOpenChange(false);
    navigate("/intake");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="animate-fade-in">
          <DialogTitle className="text-2xl font-bold">One Team, One Dream!</DialogTitle>
          <DialogDescription className="text-lg mt-2">
            Welcome to DreamStream! Meet your personal Chief of Staff (CoS) Agent, your dedicated guide to mastering task management, optimizing time, and enhancing your leadership skills.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-6 animate-fade-in" style={{ animationDelay: "200ms" }}>
            <div>
              <h3 className="text-lg font-semibold mb-2">Your CoS Agent will help you:</h3>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-2">
                <li className="hover-scale">Manage autonomous and human agents effectively</li>
                <li className="hover-scale">Delegate tasks intelligently</li>
                <li className="hover-scale">Optimize your time management</li>
                <li className="hover-scale">Enhance your leadership capabilities</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">What's next?</h3>
              <p className="text-sm text-muted-foreground">
                We'll guide you through a personalized setup process to configure your
                CoS Agent according to your preferences and needs. The tutorial will
                take about 5-10 minutes to complete.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            onClick={handleStartTutorial} 
            className="w-full animate-fade-in hover:scale-105 transition-transform"
            style={{ animationDelay: "400ms" }}
          >
            Start Tutorial
            <ArrowRight className="ml-2" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

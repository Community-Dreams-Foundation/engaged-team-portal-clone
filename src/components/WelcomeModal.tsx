
"use client";

import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
        <DialogHeader>
          <DialogTitle>Welcome to DreamStream!</DialogTitle>
          <DialogDescription>
            Meet your personal Chief of Staff (CoS) Agent, your guide to mastering
            task management and time efficiency.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your CoS Agent will help you:
            </p>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-2">
              <li>Organize and prioritize tasks effectively</li>
              <li>Manage your time with personalized strategies</li>
              <li>Provide real-time guidance and recommendations</li>
              <li>Adapt to your work style and preferences</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleStartTutorial} className="w-full">
            Start Onboarding
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

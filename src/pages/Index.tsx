
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LoginDialog } from "@/components/LoginDialog";
import { WelcomeModal } from "@/components/WelcomeModal";

const Index = () => {
  const { currentUser } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Show welcome modal when user logs in
    if (currentUser && !localStorage.getItem("welcomeSeen")) {
      setShowWelcome(true);
      localStorage.setItem("welcomeSeen", "true");
    }
  }, [currentUser]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">Welcome to DreamStream</h1>
      
      {!currentUser && <LoginDialog />}
      
      <WelcomeModal 
        open={showWelcome} 
        onOpenChange={setShowWelcome} 
      />
    </div>
  );
};

export default Index;

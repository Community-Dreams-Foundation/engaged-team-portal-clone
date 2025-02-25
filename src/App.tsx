
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SubmitIdea from "./pages/SubmitIdea";
import Intake from "./pages/Intake";
import CustomizeCoS from "./pages/CustomizeCoS";
import SimulateCoS from "./pages/SimulateCoS";
import Landing from "./pages/Landing";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading, isNewUser } = useAuth();
  
  console.log('ProtectedRoute render:', { 
    currentUser: currentUser?.email,
    loading,
    isNewUser,
    path: window.location.pathname
  });

  if (loading) {
    console.log('Still loading auth state...');
    return <div>Loading...</div>;
  }
  
  if (!currentUser) {
    console.log('No user, redirecting to landing...');
    return <Navigate to="/landing" />;
  }

  // Redirect new users to the intake page
  if (isNewUser && window.location.pathname !== '/intake') {
    console.log('New user, redirecting to intake...');
    return <Navigate to="/intake" />;
  }

  // Redirect returning users to dashboard if they try to access intake
  if (!isNewUser && window.location.pathname === '/intake') {
    console.log('Returning user trying to access intake, redirecting to dashboard...');
    return <Navigate to="/" />;
  }

  console.log('Rendering protected content...');
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/landing" element={<Landing />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/intake"
              element={
                <ProtectedRoute>
                  <Intake />
                </ProtectedRoute>
              }
            />
            <Route path="/submit-idea" element={<SubmitIdea />} />
            <Route path="/customize-cos" element={<CustomizeCoS />} />
            <Route path="/simulate-cos" element={<SimulateCoS />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

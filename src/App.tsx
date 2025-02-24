
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SubmitIdea from "./pages/SubmitIdea";
import Intake from "./pages/Intake";
import CustomizeCoS from "./pages/CustomizeCoS";
import SimulateCoS from "./pages/SimulateCoS";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/submit-idea" element={<SubmitIdea />} />
            <Route path="/intake" element={<Intake />} />
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

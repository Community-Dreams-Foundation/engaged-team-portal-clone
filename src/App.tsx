import { useEffect } from "react"
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from "react-router-dom"
import Landing from "./pages/Landing"
import Index from "./pages/Index"
import Intake from "./pages/Intake"
import NotFound from "./pages/NotFound"
import Settings from "./pages/Settings"
import Completion from "./pages/Completion"
import SimulateCoS from "./pages/SimulateCoS"
import SubmitIdea from "./pages/SubmitIdea"
import FeeTracking from "./pages/FeeTracking"
import CustomizeCoS from "./pages/CustomizeCoS"
import AdminIndex from "./pages/admin/Index"
import AdminWaiverDashboard from "./pages/admin/waiver/WaiverDashboard"
import { AuthProvider } from "./contexts/AuthContext"
import { NotificationProvider } from "./contexts/NotificationContext"
import { Toaster } from "./components/ui/toaster"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import MeetingsPage from "./pages/Meetings"
import TrainingPage from "./pages/TrainingPage"
import PerformancePage from "./pages/PerformancePage"
import CommunityPage from "./pages/CommunityPage"
import PortfolioPage from "./pages/PortfolioPage"
import CosAgentPage from "./pages/CosAgentPage"
import SupportPage from "./pages/SupportPage"

import "./App.css"

// No dynamic import that could fail with "require is not defined"
import { SocketProvider } from './contexts/SocketContext';

// Redirect component to handle /index -> / redirection
const IndexRedirect = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/', { replace: true });
  }, [navigate]);
  
  return null;
};

function App() {
  useEffect(() => {
    // Handle theme
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    
    if (isDark) {
      document.documentElement.classList.add("dark")
    }
  }, [])

  const queryClient = new QueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <SocketProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/index" element={<IndexRedirect />} />
                <Route path="/dashboard" element={<Index />} />
                <Route path="/intake" element={<Intake />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/completion" element={<Completion />} />
                <Route path="/submit-idea" element={<SubmitIdea />} />
                <Route path="/simulate" element={<SimulateCoS />} />
                <Route path="/finalize-cos" element={<FinalizeCoS />} />
                <Route path="/fees" element={<FeeTracking />} />
                <Route path="/customize" element={<CustomizeCoS />} />
                <Route path="/customize-cos" element={<CustomizeCoS />} />
                <Route path="/admin" element={<AdminIndex />} />
                <Route path="/admin/waivers" element={<AdminWaiverDashboard />} />
                <Route path="/meetings" element={<MeetingsPage />} />
                
                {/* New separate pages */}
                <Route path="/training" element={<TrainingPage />} />
                <Route path="/performance" element={<PerformancePage />} />
                <Route path="/community" element={<CommunityPage />} />
                <Route path="/portfolio" element={<PortfolioPage />} />
                <Route path="/cos-agent" element={<CosAgentPage />} />
                <Route path="/support" element={<SupportPage />} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </Router>
          </SocketProvider>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App

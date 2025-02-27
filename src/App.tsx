
import { useEffect } from "react"
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom"
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
import { SocketProvider } from "./contexts/SocketContext"
import { MeetingProvider } from "./contexts/MeetingContext"
import MeetingsPage from "./pages/Meetings"

import "./App.css"

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
          <MeetingProvider>
            <SocketProvider>
              <Router>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/index" element={<Index />} />
                  <Route path="/dashboard" element={<Index />} />
                  <Route path="/intake" element={<Intake />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/completion" element={<Completion />} />
                  <Route path="/submit-idea" element={<SubmitIdea />} />
                  <Route path="/simulate" element={<SimulateCoS />} />
                  <Route path="/fees" element={<FeeTracking />} />
                  <Route path="/customize" element={<CustomizeCoS />} />
                  <Route path="/admin" element={<AdminIndex />} />
                  <Route path="/admin/waivers" element={<AdminWaiverDashboard />} />
                  <Route path="/meetings" element={<MeetingsPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <Toaster />
              </Router>
            </SocketProvider>
          </MeetingProvider>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App

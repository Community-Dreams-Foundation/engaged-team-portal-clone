
import { useState } from "react"
import Header from "@/components/landing/Header"
import HeroSection from "@/components/landing/HeroSection"
import FeatureCards from "@/components/landing/FeatureCards"
import AboutSection from "@/components/landing/AboutSection"
import AuthForm from "@/components/landing/AuthForm"
import Footer from "@/components/landing/Footer"

export default function Landing() {
  const [isLogin, setIsLogin] = useState(true)

  const handleSwitchToSignup = () => {
    setIsLogin(false)
    window.scrollTo({ top: document.body.scrollHeight / 2, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        isLogin={isLogin} 
        setIsLogin={setIsLogin} 
        handleSwitchToSignup={handleSwitchToSignup} 
      />

      <main className="container px-4 md:px-6 pt-24 pb-16">
        <HeroSection handleSwitchToSignup={handleSwitchToSignup} />
        <FeatureCards />
        
        <div className="grid md:grid-cols-2 gap-12 items-start my-16">
          <div className="md:col-start-2">
            <AuthForm isLogin={isLogin} setIsLogin={setIsLogin} />
          </div>
        </div>
        
        <AboutSection />
      </main>

      <Footer />
    </div>
  )
}

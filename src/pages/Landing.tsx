
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { LucideRocket, Users, Trophy, Zap } from "lucide-react"

export default function Landing() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login, signup, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      if (isLogin) {
        await login(email, password)
      } else {
        await signup(email, password)
      }
      navigate("/")
    } catch (error) {
      console.error('Auth error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
      await signInWithGoogle()
      navigate("/")
    } catch (error) {
      console.error('Google auth error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <nav className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <a href="/" className="flex items-center gap-2 font-semibold">
              <LucideRocket className="h-5 w-5" />
              <span>DreamStream</span>
            </a>
            <div className="hidden md:flex gap-6">
              <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground">
                How It Works
              </a>
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground">
                Features
              </a>
              <a href="#leadership" className="text-sm text-muted-foreground hover:text-foreground">
                Leadership
              </a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant={isLogin ? "ghost" : "outline"}
              onClick={() => setIsLogin(true)}
            >
              Sign In
            </Button>
            <Button
              variant={!isLogin ? "default" : "outline"}
              onClick={() => setIsLogin(false)}
            >
              Join Now
            </Button>
          </div>
        </nav>
      </header>

      <main className="container pt-24 pb-16">
        {/* Hero Section */}
        <div className="py-20 text-center space-y-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Accelerate Innovation with{" "}
            <span className="text-primary">DreamStream</span>
          </h1>
          <p className="max-w-[42rem] mx-auto text-lg sm:text-xl text-muted-foreground">
            Revolutionize project execution and maximize your output with our decentralized,
            AI-driven task management platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
            <Button size="lg" className="w-full sm:w-auto">
              Get Started Now
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Value Propositions */}
        <div className="grid md:grid-cols-3 gap-6 py-12">
          <Card className="p-6 space-y-2">
            <Users className="h-12 w-12 text-primary" />
            <h3 className="font-semibold">Community-Driven</h3>
            <p className="text-sm text-muted-foreground">
              Join a network of innovators and leaders shaping the future of work.
            </p>
          </Card>
          <Card className="p-6 space-y-2">
            <Trophy className="h-12 w-12 text-primary" />
            <h3 className="font-semibold">Leadership Development</h3>
            <p className="text-sm text-muted-foreground">
              Grow your skills through our tiered leadership program and competitive challenges.
            </p>
          </Card>
          <Card className="p-6 space-y-2">
            <Zap className="h-12 w-12 text-primary" />
            <h3 className="font-semibold">AI-Powered Efficiency</h3>
            <p className="text-sm text-muted-foreground">
              Leverage cutting-edge AI to optimize your workflow and boost productivity.
            </p>
          </Card>
        </div>

        {/* Auth Section */}
        <div className="grid md:grid-cols-2 gap-12 items-start py-12">
          <div className="space-y-8">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">Why Join DreamStream?</h2>
              <div className="space-y-6">
                <div className="p-4 bg-primary/10 rounded-lg">
                  <h3 className="font-semibold mb-2">Our Mission</h3>
                  <p className="text-sm text-muted-foreground">
                    We're dedicated to building a strong community of dreamers and
                    doers. Our fellowship program empowers individuals to make meaningful
                    impact through collaboration and innovation.
                  </p>
                </div>
                <div className="p-4 bg-secondary/10 rounded-lg">
                  <h3 className="font-semibold mb-2">Fellowship Benefits</h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Mentorship from industry leaders</li>
                    <li>• Access to exclusive networking events</li>
                    <li>• Professional development workshops</li>
                    <li>• Project collaboration opportunities</li>
                  </ul>
                </div>
                <div className="p-4 bg-accent/10 rounded-lg">
                  <h3 className="font-semibold mb-2">Program Structure</h3>
                  <p className="text-sm text-muted-foreground">
                    Our 12-week intensive program combines hands-on projects,
                    leadership training, and community engagement. Fellows work
                    directly with mentors to develop their skills and advance
                    their career goals.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <div className="flex justify-center space-x-4 mb-6">
              <Button
                variant={isLogin ? "default" : "outline"}
                onClick={() => setIsLogin(true)}
              >
                Login
              </Button>
              <Button
                variant={!isLogin ? "default" : "outline"}
                onClick={() => setIsLogin(false)}
              >
                Sign Up
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Loading..." : isLogin ? "Login" : "Sign Up"}
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full"
              >
                Continue with Google
              </Button>
            </form>
          </Card>
        </div>
      </main>
    </div>
  )
}

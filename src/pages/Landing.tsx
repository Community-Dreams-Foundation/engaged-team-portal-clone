
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { LucideRocket, Users, Zap, ChevronDown, Check, ArrowRight, Shield, Brain } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"

export default function Landing() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login, signup, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Starting authentication process...');
    
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Please enter both email and password"
      })
      return
    }

    setIsLoading(true)
    try {
      console.log(`Attempting ${isLogin ? 'login' : 'signup'} for email:`, email);
      
      if (isLogin) {
        console.log('Calling login function...');
        await login(email, password)
        console.log('Login successful, navigating to homepage');
        toast({
          title: "Welcome back!",
          description: "Successfully signed in"
        })
        navigate("/dashboard")
      } else {
        console.log('Calling signup function...');
        await signup(email, password)
        console.log('Signup successful, navigating to homepage');
        toast({
          title: "Welcome to DreamStream!",
          description: "Your account has been created successfully"
        })
        navigate("/dashboard")
      }
    } catch (error: any) {
      console.error('Auth error:', error)
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: error.message || "Failed to authenticate"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
      await signInWithGoogle()
      toast({
        title: "Welcome!",
        description: "Successfully signed in with Google"
      })
      navigate("/dashboard")
    } catch (error: any) {
      console.error('Google auth error:', error)
      toast({
        variant: "destructive",
        title: "Google Sign-in Error",
        description: error.message || "Failed to sign in with Google"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSwitchToSignup = () => {
    setIsLogin(false)
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 border-b landing-header">
        <nav className="container flex items-center justify-between h-16 px-4 md:px-6">
          <div className="flex items-center gap-6">
            <a href="/" className="flex items-center gap-2 font-semibold">
              <LucideRocket className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold landing-gradient-text">DreamStream</span>
            </a>
            <div className="hidden md:flex gap-6">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  How It Works <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <div className="flex flex-col">
                        <span className="font-medium">1. Get Onboard</span>
                        <span className="text-xs text-muted-foreground">Sign up quickly and complete registration</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <div className="flex flex-col">
                        <span className="font-medium">2. Receive Documentation</span>
                        <span className="text-xs text-muted-foreground">Get offer letter and agreement</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <div className="flex flex-col">
                        <span className="font-medium">3. Access Projects</span>
                        <span className="text-xs text-muted-foreground">Start with AI-driven support</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Features <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64">
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <div className="flex flex-col">
                        <span className="font-medium">Decentralized Task Execution</span>
                        <span className="text-xs text-muted-foreground">Transform ideas into micro-tasks</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <div className="flex flex-col">
                        <span className="font-medium">AI-Driven Task Management</span>
                        <span className="text-xs text-muted-foreground">Get personalized guidance</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <div className="flex flex-col">
                        <span className="font-medium">Real-Time Collaboration</span>
                        <span className="text-xs text-muted-foreground">Stay updated and connected</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Leadership <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64">
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <div className="flex flex-col">
                        <span className="font-medium">Development Program</span>
                        <span className="text-xs text-muted-foreground">Join our exclusive training</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <div className="flex flex-col">
                        <span className="font-medium">Progressive Growth</span>
                        <span className="text-xs text-muted-foreground">Advance from emerging leader to Captain</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <div className="flex flex-col">
                        <span className="font-medium">Competitive Advantage</span>
                        <span className="text-xs text-muted-foreground">Drive speed and innovation</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant={isLogin ? "ghost" : "outline"}
              onClick={() => {
                setIsLogin(true)
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
              }}
              className="font-medium"
            >
              Sign In
            </Button>
            <Button
              variant={!isLogin ? "default" : "outline"}
              onClick={handleSwitchToSignup}
              className="font-medium"
            >
              Join Now
            </Button>
          </div>
        </nav>
      </header>

      <main className="container px-4 md:px-6 pt-24 pb-16">
        <div className="py-20 text-center space-y-6 landing-hero my-8 rounded-lg">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Accelerate Innovation with{" "}
            <span className="text-primary landing-gradient-text">DreamStream</span>
          </h1>
          <p className="max-w-[42rem] mx-auto text-lg sm:text-xl text-muted-foreground">
            Revolutionize project execution and maximize your output with our decentralized,
            AI-driven task management platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
            <Button 
              size="lg" 
              className="w-full sm:w-auto px-8 py-6 text-lg rounded-full shadow-lg"
              onClick={handleSwitchToSignup}
            >
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 py-12">
          <Card className="p-8 space-y-4 feature-card">
            <Users className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-semibold">Community-Driven</h3>
            <p className="text-muted-foreground">
              Join a network of innovators and leaders shaping the future of work.
            </p>
          </Card>
          <Card className="p-8 space-y-4 feature-card">
            <Zap className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-semibold">Energy Development</h3>
            <p className="text-muted-foreground">
              Enhance your capabilities through our dynamic training program and skill development.
            </p>
          </Card>
          <Card className="p-8 space-y-4 feature-card">
            <Brain className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-semibold">AI-Powered Efficiency</h3>
            <p className="text-muted-foreground">
              Leverage cutting-edge AI to optimize your workflow and boost productivity.
            </p>
          </Card>
        </div>

        <div className="my-16">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose DreamStream?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-muted/50">
              <Shield className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Enterprise Security</h3>
              <p className="text-muted-foreground">Your data is protected with industry-leading security measures.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-muted/50">
              <Zap className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-muted-foreground">Optimize your productivity with our high-performance platform.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-muted/50">
              <Check className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Quality Assured</h3>
              <p className="text-muted-foreground">Our platform ensures the highest standards in project delivery.</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start py-12 my-16">
          <div className="space-y-8">
            <Card className="p-8 gradient-border">
              <h2 className="text-2xl font-bold mb-6">Why Join DreamStream?</h2>
              <div className="space-y-6">
                <div className="p-4 bg-primary/10 rounded-lg">
                  <h3 className="font-semibold mb-2">Our Mission</h3>
                  <p className="text-muted-foreground">
                    Accelerate innovation by transforming ideas into actionable tasks—enabling rapid, 
                    high-quality project execution.
                  </p>
                </div>
                <div className="p-4 bg-secondary/10 rounded-lg">
                  <h3 className="font-semibold mb-2">Fellowship Benefits</h3>
                  <p className="text-muted-foreground">
                    Enjoy exclusive perks such as personalized coaching, competitive incentives, 
                    fee waivers, and access to cutting-edge technology that boosts your productivity 
                    and leadership potential.
                  </p>
                </div>
                <div className="p-4 bg-accent/10 rounded-lg">
                  <h3 className="font-semibold mb-2">Program Structure</h3>
                  <p className="text-muted-foreground">
                    A clear, data-driven pathway that starts with a simple onboarding process 
                    (offer letter and agreement) and evolves into an advanced leadership development 
                    program, guiding you from individual excellence to strategic executive leadership.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-8 gradient-border">
            <div className="flex justify-center space-x-4 mb-6">
              <Button
                variant={isLogin ? "default" : "outline"}
                onClick={() => setIsLogin(true)}
                disabled={isLoading}
                className="w-32"
              >
                Login
              </Button>
              <Button
                variant={!isLogin ? "default" : "outline"}
                onClick={() => setIsLogin(false)}
                disabled={isLoading}
                className="w-32"
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
                  disabled={isLoading}
                  className="h-12"
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
                  disabled={isLoading}
                  className="h-12"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 font-medium" 
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : isLogin ? "Login" : "Sign Up"}
              </Button>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
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
                className="w-full h-12"
              >
                Continue with Google
              </Button>
            </form>
          </Card>
        </div>
      </main>

      <footer className="border-t py-8 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground">About Us</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Careers</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Documentation</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Blog</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">FAQs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Privacy Policy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Terms of Service</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Cookie Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Twitter</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">LinkedIn</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">GitHub</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>© 2023 DreamStream. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

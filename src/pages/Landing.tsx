
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

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
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
              DreamStream Fellowship
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Join a transformative community dedicated to fostering innovation and leadership
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-start">
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
        </div>
      </div>
    </div>
  )
}


import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

export default function Landing() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await login(email, password)
      navigate("/")
    } catch (error) {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
      await signInWithGoogle()
      navigate("/")
    } catch (error) {
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
              Join the Community Dreams Foundation and make an impact
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">Welcome to DreamStream</h2>
              <div className="space-y-4">
                <div className="p-4 bg-primary/10 rounded-lg">
                  <h3 className="font-semibold mb-2">Our Mission</h3>
                  <p className="text-sm text-muted-foreground">
                    We're dedicated to building a strong community of dreamers and
                    doers. Join us to collaborate, learn, and grow together.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <form onSubmit={handleLogin} className="space-y-4">
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
                  {isLoading ? "Loading..." : "Login"}
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

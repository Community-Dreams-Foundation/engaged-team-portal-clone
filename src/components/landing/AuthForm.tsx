
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "@/components/ui/use-toast"
import { useNavigate } from "react-router-dom"

interface AuthFormProps {
  isLogin: boolean;
  setIsLogin: (isLogin: boolean) => void;
}

export default function AuthForm({ isLogin, setIsLogin }: AuthFormProps) {
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

  return (
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
  )
}


import { Card } from "@/components/ui/card"
import { Users, Zap, Brain } from "lucide-react"

export default function FeatureCards() {
  return (
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
  )
}

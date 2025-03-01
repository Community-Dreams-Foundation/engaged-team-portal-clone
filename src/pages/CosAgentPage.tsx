
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { CosAgent } from "@/components/dashboard/CosAgent"

export default function CosAgentPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold tracking-tight">CoS Agent</h1>
          <p className="text-muted-foreground">
            Your AI-powered productivity assistant
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <CosAgent />
        </div>
      </div>
    </DashboardLayout>
  );
}

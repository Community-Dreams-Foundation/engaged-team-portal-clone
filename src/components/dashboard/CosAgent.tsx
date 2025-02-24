
import { UserCog, MessageSquare, ArrowUpDown, ListChecks } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/contexts/AuthContext"

const fetchRecommendations = async (userId: string) => {
  return [
    "Prioritize the quarterly review meeting",
    "Schedule team sync for project updates"
  ];
}

const fetchActionItems = async (userId: string) => {
  return [
    { id: 1, text: "Review Q4 strategy document", completed: false },
    { id: 2, text: "Prepare meeting agenda", completed: false },
    { id: 3, text: "Follow up with team leads", completed: false }
  ];
}

export function CosAgent() {
  const { currentUser } = useAuth();

  const { data: recommendations = [] } = useQuery({
    queryKey: ['recommendations', currentUser?.uid],
    queryFn: () => fetchRecommendations(currentUser?.uid || ''),
    enabled: !!currentUser,
  });

  const { data: actionItems = [] } = useQuery({
    queryKey: ['actionItems', currentUser?.uid],
    queryFn: () => fetchActionItems(currentUser?.uid || ''),
    enabled: !!currentUser,
  });

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <UserCog className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Chief of Staff Agent</h3>
      </div>
      
      <div className="space-y-4">
        <div className="bg-muted p-4 rounded-lg max-h-[200px] overflow-y-auto space-y-3">
          <div className="flex items-start gap-2">
            <UserCog className="h-4 w-4 mt-1 text-primary" />
            <p className="text-sm">How can I assist you today?</p>
          </div>
          <div className="flex items-start gap-2">
            <MessageSquare className="h-4 w-4 mt-1 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Please help me prioritize my tasks.</p>
          </div>
          <div className="flex items-start gap-2">
            <UserCog className="h-4 w-4 mt-1 text-primary" />
            <p className="text-sm">Based on urgency and impact, I recommend...</p>
          </div>
        </div>

        <Textarea 
          placeholder="Type your message here..."
          className="resize-none"
        />

        <Button className="w-full" size="sm">
          <MessageSquare className="mr-2 h-4 w-4" />
          Send Message
        </Button>

        <div className="border-t pt-4">
          <div className="flex items-center gap-2 mb-3">
            <ArrowUpDown className="h-4 w-4 text-primary" />
            <h4 className="font-medium text-sm">Recommendations</h4>
          </div>
          <div className="space-y-2">
            {recommendations.map((recommendation, index) => (
              <div key={index} className="bg-secondary/50 p-2 rounded-md text-sm">
                {recommendation}
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center gap-2 mb-3">
            <ListChecks className="h-4 w-4 text-primary" />
            <h4 className="font-medium text-sm">Action Items</h4>
          </div>
          <div className="space-y-2">
            {actionItems.map((item) => (
              <div key={item.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded" checked={item.completed} />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

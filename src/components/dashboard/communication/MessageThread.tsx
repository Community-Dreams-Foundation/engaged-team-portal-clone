
import { Card } from "@/components/ui/card"
import { ListChecks } from "lucide-react"
import { Message } from "@/types/communication"
import { MessageContent } from "./MessageContent"

interface MessageThreadProps {
  threadId: string;
  messages: Message[];
}

export function MessageThread({ threadId, messages }: MessageThreadProps) {
  return (
    <Card className="p-4">
      {threadId !== "standalone" && (
        <div className="flex items-center gap-2 mb-2">
          <ListChecks className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Thread</span>
        </div>
      )}
      
      <div className="space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              !message.isRead ? "bg-muted/50 p-2 rounded-lg" : ""
            }`}
          >
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              {message.userName[0]}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">
                  {message.userName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <MessageContent message={message} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

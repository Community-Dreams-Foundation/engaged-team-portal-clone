
import { Message } from "@/types/communication"
import { Button } from "@/components/ui/button"
import { ThumbsUp, MessageCircle } from "lucide-react"
import { toggleLike } from "@/services/messageService"

interface MessageContentProps {
  message: Message;
  onReply?: () => void;
}

export function MessageContent({ message, onReply }: MessageContentProps) {
  const handleLike = async () => {
    if (message.id) {
      await toggleLike(message.id, message.likes || 0)
    }
  }

  const content = () => {
    if (message.format?.code) {
      return (
        <pre className="bg-muted p-2 rounded-md font-mono text-sm overflow-x-auto">
          <code>{message.content}</code>
        </pre>
      )
    }

    if (message.format?.quote) {
      return (
        <blockquote className="border-l-4 border-primary/50 pl-4 italic">
          {message.content}
        </blockquote>
      )
    }

    return (
      <p className={`text-sm ${message.format?.bold ? 'font-bold' : ''} ${message.format?.italic ? 'italic' : ''}`}>
        {message.content}
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {content()}
      
      {/* Attachments */}
      {message.attachments && message.attachments.length > 0 && (
        <div className="flex gap-2 mt-2">
          {message.attachments.map((attachment, index) => (
            <a 
              key={index}
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:underline"
            >
              {attachment.name}
            </a>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 mt-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-primary"
          onClick={handleLike}
        >
          <ThumbsUp className="h-4 w-4 mr-1" />
          {message.likes || 0}
        </Button>
        
        {onReply && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-primary"
            onClick={onReply}
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            {message.replies?.length || 0}
          </Button>
        )}
      </div>

      {/* Replies */}
      {message.replies && message.replies.length > 0 && (
        <div className="ml-6 mt-2 space-y-2 border-l-2 border-muted pl-4">
          {message.replies.map((reply) => (
            <div key={reply.id} className="text-sm">
              <span className="font-medium">{reply.userName}</span>
              <p className="mt-1">{reply.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

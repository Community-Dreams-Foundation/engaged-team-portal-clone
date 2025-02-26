
import { Message } from "@/types/communication"

interface MessageContentProps {
  message: Message;
}

export function MessageContent({ message }: MessageContentProps) {
  if (message.format?.code) {
    return (
      <pre className="bg-muted p-2 rounded-md font-mono text-sm overflow-x-auto">
        <code>{message.content}</code>
      </pre>
    );
  }

  if (message.format?.quote) {
    return (
      <blockquote className="border-l-4 border-primary/50 pl-4 italic">
        {message.content}
      </blockquote>
    );
  }

  return (
    <p className={`text-sm ${message.format?.bold ? 'font-bold' : ''} ${message.format?.italic ? 'italic' : ''}`}>
      {message.content}
    </p>
  );
}

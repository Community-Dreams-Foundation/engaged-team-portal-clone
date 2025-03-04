
import { GeminiChat } from "@/components/ai/GeminiChat";

export default function GeminiPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Gemini AI Assistant</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <GeminiChat />
        </div>
        <div className="space-y-6">
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">About Gemini</h2>
            <p className="text-muted-foreground">
              Gemini is Google's most capable AI model. It can help with creative
              content generation, problem-solving, coding assistance, and more.
              Try asking it questions, requesting creative content, or seeking advice.
            </p>
          </div>
          
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Sample Prompts</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>• "Generate a learning plan for mastering React in 30 days"</li>
              <li>• "Write a cover letter for a frontend developer position"</li>
              <li>• "Help me debug this React code snippet: [paste code]"</li>
              <li>• "Explain the difference between useEffect and useLayoutEffect"</li>
              <li>• "Generate a proposal for a community engagement project"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

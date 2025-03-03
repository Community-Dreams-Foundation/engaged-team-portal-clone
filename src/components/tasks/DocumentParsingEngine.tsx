
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/use-toast";
import { processDocumentForTaskCreation } from "@/services/recommendationService";
import { CoSRecommendation, Task } from "@/types/task";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, FileText, CheckCircle, AlertCircle } from "lucide-react";

interface DocumentParsingEngineProps {
  onTasksExtracted: (tasks: Partial<Task>[]) => void;
  onRecommendationsGenerated: (recommendations: CoSRecommendation[]) => void;
}

export function DocumentParsingEngine({
  onTasksExtracted,
  onRecommendationsGenerated
}: DocumentParsingEngineProps) {
  const { currentUser } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [insights, setInsights] = useState<string[]>([]);
  const [parsingComplete, setParsingComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
      setParsingComplete(false);
      setInsights([]);
    }
  };

  const handleProcess = async () => {
    if (!file || !currentUser) {
      setError("Please select a file and ensure you're logged in");
      return;
    }

    setIsLoading(true);
    setProgress(10);
    setError(null);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      // Process the document
      const result = await processDocumentForTaskCreation(currentUser.uid, file);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      if (result.success) {
        setParsingComplete(true);
        setInsights(result.insights);
        
        // Pass tasks and recommendations to parent components
        onTasksExtracted(result.tasks);
        onRecommendationsGenerated(result.recommendations);
        
        toast({
          title: "Document Processed",
          description: `Successfully extracted ${result.tasks.length} tasks and generated ${result.recommendations.length} recommendations.`
        });
      } else {
        setError("Failed to process document. Please try again with a different file.");
      }
    } catch (error) {
      console.error("Error processing document:", error);
      setError("An unexpected error occurred while processing the document");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Document Parsing Engine</h3>
        <p className="text-sm text-muted-foreground">
          Upload project documentation to automatically extract tasks and generate recommendations.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="document-upload" className="text-sm font-medium">
            Upload Documentation
          </label>
          <Input
            id="document-upload"
            type="file"
            accept=".txt,.md,.doc,.docx,.pdf"
            onChange={handleFileChange}
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">
            Supported formats: TXT, Markdown, DOC, DOCX, PDF
          </p>
        </div>

        {file && (
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4" />
            <span>{file.name}</span>
          </div>
        )}

        {isLoading && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Processing document...</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {parsingComplete && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Document processing complete!</span>
            </div>
            {insights.length > 0 && (
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Key Insights:</h4>
                <ul className="text-xs space-y-1">
                  {insights.map((insight, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <span className="text-primary">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <Button
          onClick={handleProcess}
          disabled={!file || isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Process Document"
          )}
        </Button>
      </div>
    </Card>
  );
}

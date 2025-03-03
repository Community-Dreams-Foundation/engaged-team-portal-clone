
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { processDocumentForTaskCreation } from "@/services/recommendationService";
import { CoSRecommendation, Task } from "@/types/task";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { FileUploadSection } from "./FileUploadSection";
import { ProgressIndicator } from "./ProgressIndicator";
import { ErrorDisplay } from "./ErrorDisplay";
import { ParsingResults } from "./ParsingResults";

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
        <FileUploadSection 
          file={file} 
          isLoading={isLoading} 
          handleFileChange={handleFileChange} 
        />
        
        <ProgressIndicator isLoading={isLoading} progress={progress} />
        
        <ErrorDisplay error={error} />
        
        <ParsingResults parsingComplete={parsingComplete} insights={insights} />

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

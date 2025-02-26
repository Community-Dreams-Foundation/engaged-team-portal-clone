
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { KnowledgeGraph } from "@/components/dashboard/cos-agent/KnowledgeGraph";
import { DocumentType, ParseDocumentResult, DocumentParsingConfig } from "@/types/document-parser";
import { useAuth } from "@/contexts/AuthContext";

interface DocumentParsingEngineProps {
  onDocumentParsed: (result: ParseDocumentResult) => void;
}

export function DocumentParsingEngine({ onDocumentParsed }: DocumentParsingEngineProps) {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [documentType, setDocumentType] = useState<DocumentType>("project-charter");
  const [file, setFile] = useState<File | null>(null);

  const defaultConfig: DocumentParsingConfig = {
    maxTaskDuration: 180, // 3 hours in minutes
    autoSplitThreshold: 90, // 90% of estimated time
    minTaskSize: 30, // 30 minutes
    complexityThreshold: 75,
    requiresDependencyMapping: true,
    includeMetadataEnrichment: true,
    nlpOptions: {
      performSentimentAnalysis: true,
      extractTechnicalTerms: true,
      identifyStakeholders: true,
      calculateComplexity: true,
    },
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleProcess = async () => {
    if (!file || !currentUser) return;

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", documentType);
      formData.append("config", JSON.stringify(defaultConfig));
      formData.append("userId", currentUser.uid);

      const response = await fetch("/api/parse-document", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to parse document");

      const result: ParseDocumentResult = await response.json();
      onDocumentParsed(result);

      toast({
        title: "Document Parsed Successfully",
        description: `Generated ${result.generatedTasks.length} tasks and identified ${result.graphUpdateSummary.entitiesIdentified} entities.`,
      });
    } catch (error) {
      console.error("Error parsing document:", error);
      toast({
        variant: "destructive",
        title: "Error Parsing Document",
        description: "Failed to process the document. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-2">
        <h3 className="text-2xl font-semibold tracking-tight">Document Parser</h3>
        <p className="text-sm text-muted-foreground">
          Upload project documentation to automatically generate tasks and update the knowledge graph.
        </p>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="graph">Knowledge Graph</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Document Type</label>
              <select
                className="w-full p-2 border rounded-md"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value as DocumentType)}
              >
                <option value="project-charter">Project Charter</option>
                <option value="prd">Product Requirements Document</option>
                <option value="execution-calendar">Execution Calendar</option>
                <option value="sprint-plan">Sprint Plan</option>
              </select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Upload Document</label>
              <Input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <Button
            onClick={handleProcess}
            disabled={!file || isProcessing}
            className="w-full"
          >
            {isProcessing ? "Processing..." : "Parse Document"}
          </Button>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          {file && (
            <div className="border rounded-lg p-4">
              <p className="font-medium">Selected File: {file.name}</p>
              <p className="text-sm text-muted-foreground">
                Type: {documentType}
                <br />
                Size: {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="graph">
          <div className="h-[400px] border rounded-lg">
            <KnowledgeGraph
              data={{
                nodes: [],
                edges: []
              }}
            />
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}

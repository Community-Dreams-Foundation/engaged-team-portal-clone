
import React from "react";
import { Input } from "@/components/ui/input";
import { FileText } from "lucide-react";

interface FileUploadSectionProps {
  file: File | null;
  isLoading: boolean;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  file,
  isLoading,
  handleFileChange
}) => {
  return (
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
    </div>
  );
};


import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { FileText, Upload, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";

interface DocumentAgreementProps {
  onAgreementChange: (agreed: boolean) => void;
  agreed: boolean;
}

export function DocumentAgreement({ onAgreementChange, agreed }: DocumentAgreementProps) {
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | null>>({
    offerLetter: null,
    agreement: null, 
    handbook: null
  });
  const [signatureMethod, setSignatureMethod] = useState<"upload" | "sign" | null>(null);
  const [signatureValues, setSignatureValues] = useState<Record<string, string>>({
    offerLetter: "",
    agreement: "", 
    handbook: ""
  });
  const [activeTab, setActiveTab] = useState("offerLetter");
  
  const allDocumentsHandled = () => {
    if (signatureMethod === "upload") {
      return Object.values(uploadedFiles).every(file => file !== null);
    } else if (signatureMethod === "sign") {
      return Object.values(signatureValues).every(value => value.length > 3);
    }
    return false;
  };
  
  const handleFileUpload = (documentType: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFiles(prev => ({
        ...prev,
        [documentType]: e.target.files![0]
      }));
      
      // Check if all documents are uploaded and update agreement status
      setTimeout(() => {
        if (allDocumentsHandled()) {
          updateAgreement(true);
        }
      }, 100);
    }
  };
  
  const handleSignedAgreement = (documentType: string, value: string) => {
    setSignatureValues(prev => ({
      ...prev,
      [documentType]: value
    }));
    
    // Check if all documents are signed and update agreement status
    setTimeout(() => {
      if (allDocumentsHandled()) {
        updateAgreement(true);
      }
    }, 100);
  };
  
  // Update parent component when either method is completed
  const updateAgreement = (value: boolean) => {
    onAgreementChange(value);
  };

  const documentTitles: Record<string, string> = {
    offerLetter: "Offer Letter",
    agreement: "Service Agreement",
    handbook: "Company Handbook"
  };

  const documentDescriptions: Record<string, string> = {
    offerLetter: "This document outlines the terms of your engagement with DreamStream, including role, expectations, and compensation structure.",
    agreement: "Our service agreement covers intellectual property rights, confidentiality, and terms of collaboration.",
    handbook: "The handbook details our policies, procedures, code of conduct, and other important guidelines."
  };

  return (
    <div className="space-y-4">
      <Card className="p-5 border-primary/20">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-primary mt-1" />
            <div>
              <h3 className="font-medium text-lg">Onboarding Documents</h3>
              <p className="text-muted-foreground">
                Please review and sign all required documents before proceeding to the next step.
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <Button 
              type="button" 
              variant={signatureMethod === "upload" ? "default" : "outline"} 
              size="sm"
              onClick={() => setSignatureMethod("upload")}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Signed Documents
            </Button>
            
            <Button 
              type="button" 
              variant={signatureMethod === "sign" ? "default" : "outline"} 
              size="sm"
              onClick={() => setSignatureMethod("sign")}
              className="flex-1"
            >
              <FileText className="h-4 w-4 mr-2" />
              Sign Electronically
            </Button>
          </div>
          
          {signatureMethod && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="offerLetter" className="relative">
                  Offer Letter
                  {((uploadedFiles.offerLetter && signatureMethod === "upload") || 
                    (signatureValues.offerLetter.length > 3 && signatureMethod === "sign")) && (
                    <Check className="h-3 w-3 text-green-500 absolute -top-1 -right-1" />
                  )}
                </TabsTrigger>
                <TabsTrigger value="agreement" className="relative">
                  Agreement
                  {((uploadedFiles.agreement && signatureMethod === "upload") || 
                    (signatureValues.agreement.length > 3 && signatureMethod === "sign")) && (
                    <Check className="h-3 w-3 text-green-500 absolute -top-1 -right-1" />
                  )}
                </TabsTrigger>
                <TabsTrigger value="handbook" className="relative">
                  Handbook
                  {((uploadedFiles.handbook && signatureMethod === "upload") || 
                    (signatureValues.handbook.length > 3 && signatureMethod === "sign")) && (
                    <Check className="h-3 w-3 text-green-500 absolute -top-1 -right-1" />
                  )}
                </TabsTrigger>
              </TabsList>
              
              {Object.keys(documentTitles).map((docType) => (
                <TabsContent key={docType} value={docType} className="space-y-4">
                  <h4 className="font-semibold">{documentTitles[docType]}</h4>
                  <p className="text-sm text-muted-foreground mb-4">{documentDescriptions[docType]}</p>
                  
                  <div className="text-sm border rounded p-3 h-40 overflow-y-auto">
                    <h4 className="font-semibold mb-2">DreamStream {documentTitles[docType]}</h4>
                    <p className="mb-2">
                      This is a sample of the {documentTitles[docType].toLowerCase()} content. In a production environment,
                      this would contain the full text of the document for review.
                    </p>
                    <p className="mb-2">
                      By signing this document, you acknowledge that you have read,
                      understood, and agree to all terms and conditions outlined in the full {documentTitles[docType].toLowerCase()}.
                    </p>
                    <p>
                      This document constitutes a legally binding agreement between you and DreamStream.
                    </p>
                  </div>
                  
                  {signatureMethod === "upload" && (
                    <div className="space-y-2">
                      <Input 
                        type="file" 
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" 
                        onChange={(e) => handleFileUpload(docType, e)}
                      />
                      {uploadedFiles[docType] && (
                        <p className="text-sm text-muted-foreground">
                          Uploaded: {uploadedFiles[docType]?.name}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {signatureMethod === "sign" && (
                    <div className="space-y-2">
                      <Input 
                        type="text" 
                        placeholder="Type your full name to sign"
                        value={signatureValues[docType]}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleSignedAgreement(docType, value);
                        }}
                      />
                      <p className="text-xs text-muted-foreground">
                        By typing your name above, you acknowledge this as your electronic signature.
                      </p>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          )}
          
          <div className="flex items-start space-x-2 mt-6">
            <Checkbox 
              id="terms" 
              checked={agreed}
              onCheckedChange={(checked) => {
                if (checked === true && !allDocumentsHandled()) {
                  toast({
                    variant: "destructive",
                    title: "Document Submission Required",
                    description: "Please sign or upload all required documents before proceeding.",
                  });
                  return;
                }
                updateAgreement(checked === true);
              }}
            />
            <Label htmlFor="terms" className="text-sm leading-normal">
              I confirm that I have read, understood, and agree to all the terms and conditions in these documents. 
              I acknowledge that these documents constitute a legally binding agreement between myself and DreamStream.
            </Label>
          </div>
        </div>
      </Card>
    </div>
  );
}


import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { FileText, Upload } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DocumentAgreementProps {
  onAgreementChange: (agreed: boolean) => void;
  agreed: boolean;
}

export function DocumentAgreement({ onAgreementChange, agreed }: DocumentAgreementProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [signatureMethod, setSignatureMethod] = useState<"upload" | "sign" | null>(null);
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
      setSignatureMethod("upload");
    }
  };
  
  const handleSignedAgreement = () => {
    setSignatureMethod("sign");
  };
  
  // Update parent component when either method is completed
  const updateAgreement = (value: boolean) => {
    onAgreementChange(value);
  };

  return (
    <div className="space-y-4">
      <Card className="p-5 border-primary/20">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-primary mt-1" />
            <div>
              <h3 className="font-medium text-lg">Terms and Conditions</h3>
              <p className="text-muted-foreground">
                Before proceeding, please review and agree to our terms of service and privacy policy.
              </p>
            </div>
          </div>
          
          <div className="text-sm border rounded p-3 h-40 overflow-y-auto">
            <h4 className="font-semibold mb-2">DreamStream Agreement</h4>
            <p className="mb-2">
              By checking the box below, you agree to the terms and conditions of DreamStream services,
              including our privacy policy, data processing agreement, and terms of service.
            </p>
            <p className="mb-2">
              This agreement covers the use of our AI Chief of Staff agent, your data privacy,
              intellectual property rights, and service limitations.
            </p>
            <p>
              You acknowledge that you have read and understood these terms, and agree to be
              bound by them in full.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <Button 
                type="button" 
                variant={signatureMethod === "upload" ? "default" : "outline"} 
                size="sm"
                onClick={() => setSignatureMethod("upload")}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Signed Document
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
            
            {signatureMethod === "upload" && (
              <div className="space-y-2">
                <Input 
                  type="file" 
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" 
                  onChange={handleFileUpload}
                />
                {uploadedFile && (
                  <p className="text-sm text-muted-foreground">
                    Uploaded: {uploadedFile.name}
                  </p>
                )}
              </div>
            )}
            
            {signatureMethod === "sign" && (
              <div className="space-y-2">
                <Input 
                  type="text" 
                  placeholder="Type your full name to sign"
                  onChange={(e) => {
                    // Simple check - if they've typed something, count as signed
                    if (e.target.value.length > 3) {
                      handleSignedAgreement();
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  By typing your name above, you acknowledge this as your electronic signature.
                </p>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="terms" 
              checked={agreed}
              onCheckedChange={(checked) => {
                updateAgreement(checked === true);
              }}
            />
            <Label htmlFor="terms" className="text-sm">
              I have read and agree to the DreamStream Terms & Conditions
            </Label>
          </div>
        </div>
      </Card>
    </div>
  );
}

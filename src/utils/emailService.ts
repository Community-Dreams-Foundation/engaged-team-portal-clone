
import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// Types for email data
export interface EmailData {
  to: string;
  from: string;
  subject: string;
  message: string;
  attachments?: string[];
  metadata?: Record<string, any>;
}

// Types for email tracking
export interface EmailRecord extends EmailData {
  id: string;
  status: 'queued' | 'sent' | 'failed';
  createdAt: Date;
  sentAt?: Date;
  error?: string;
}

/**
 * Sends an email via Firebase-backed email service
 * In a production environment, this would connect to a Cloud Function
 * that handles the actual email sending via a service like SendGrid, Mailgun, etc.
 */
export const sendEmail = async (emailData: EmailData): Promise<string> => {
  try {
    // Store the email request in Firestore for tracking/auditing
    const emailRecord = {
      ...emailData,
      status: 'queued',
      createdAt: serverTimestamp(),
    };
    
    // Add to the emails collection in Firestore
    const docRef = await addDoc(collection(db, "emails"), emailRecord);
    console.log(`Email queued with ID: ${docRef.id}`);
    
    // In production, a Cloud Function would be triggered by this write
    // to process the email sending via a proper email service

    // Simulate successful delivery after a delay
    // This would be removed in production as the Cloud Function would handle it
    setTimeout(() => {
      console.log(`Email to ${emailData.to} processed and sent`);
    }, 1500);
    
    return docRef.id;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

/**
 * Specialized function for sending executed documents to users
 */
export const sendExecutedDocumentsEmail = async (
  userEmail: string,
  userName: string,
  documentTypes: string[]
): Promise<string> => {
  const senderEmail = "humanresources@cdreams.org";
  
  // Create a professional email message
  const message = `
Dear ${userName},

Thank you for completing your onboarding documents with DreamStream.

We're pleased to confirm that we've received your signed documents:
${documentTypes.map(type => `- ${type}`).join('\n')}

Final executed copies with all signatures have been attached to this email for your records. 
Please save these documents for your reference. You can also access them at any time through 
your DreamStream account dashboard.

If you have any questions about these documents or need assistance, please don't 
hesitate to contact our Human Resources team at ${senderEmail}.

Welcome to DreamStream!

Best regards,
DreamStream HR Team
  `;
  
  return sendEmail({
    to: userEmail,
    from: senderEmail,
    subject: "DreamStream - Your Executed Onboarding Documents",
    message,
    metadata: {
      documentTypes,
      onboardingStage: "documentation"
    }
  });
};

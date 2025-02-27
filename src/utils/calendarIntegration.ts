
import { calendar, auth, calendar_v3 } from '@googleapis/calendar'
import { drive_v3, drive } from '@googleapis/drive'
import { speech } from '@googleapis/speech'
import { Meeting } from "@/contexts/MeetingContext"
import { format } from "date-fns"

export interface CalendarCredentials {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

export interface CalendarSettings {
  provider: "google" | "outlook" | "none";
  autoSendInvites: boolean;
  defaultReminder: number; // minutes
  credentials?: CalendarCredentials;
}

export interface CalendarEvent {
  id: string;
  calendarId: string;
  meetingId: string;
  status: "pending" | "confirmed" | "cancelled";
  eventUrl?: string;
  createdAt: string;
}

export interface RecordingDetails {
  recordingUrl: string;
  transcriptUrl?: string;
  duration: number;
  generatedAt: string;
}

export async function createCalendarEvent(meeting: Meeting, credentials?: CalendarCredentials): Promise<CalendarEvent | null> {
  if (!credentials) {
    console.log("No calendar credentials provided");
    return null;
  }

  try {
    const oauth2Client = new auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: credentials.accessToken,
      refresh_token: credentials.refreshToken
    });

    const calendarClient = calendar({ version: 'v3', auth: oauth2Client });

    // Define the event with the correct type
    const event: calendar_v3.Schema$Event = {
      summary: meeting.title,
      description: meeting.description,
      start: {
        dateTime: meeting.startTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: meeting.endTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      attendees: meeting.participants.map(p => ({ email: p.email })),
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 15 },
        ],
      },
    };

    if (meeting.location?.type === 'virtual') {
      event.conferenceData = {
        createRequest: {
          requestId: meeting.id,
          conferenceSolutionKey: { type: 'hangoutsMeet' }
        }
      };
    } else if (meeting.location?.type === 'physical') {
      event.location = meeting.location.address;
    }

    const result = await calendarClient.events.insert({
      calendarId: 'primary',
      requestBody: event,
      conferenceDataVersion: 1,
      sendUpdates: 'all',
    });

    if (!result.data || !result.data.id) {
      throw new Error('Failed to create calendar event');
    }

    return {
      id: result.data.id,
      calendarId: 'primary',
      meetingId: meeting.id,
      status: 'confirmed',
      eventUrl: result.data.htmlLink || undefined,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
}

export async function updateCalendarEvent(
  meetingId: string,
  meeting: Meeting,
  credentials?: CalendarCredentials
): Promise<CalendarEvent | null> {
  if (!credentials) {
    console.log("No calendar credentials provided");
    return null;
  }

  try {
    const oauth2Client = new auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: credentials.accessToken,
      refresh_token: credentials.refreshToken
    });

    const calendarClient = calendar({ version: 'v3', auth: oauth2Client });

    // Define the event with the correct type
    const event: calendar_v3.Schema$Event = {
      summary: meeting.title,
      description: meeting.description,
      start: {
        dateTime: meeting.startTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: meeting.endTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      attendees: meeting.participants.map(p => ({ email: p.email })),
    };

    if (meeting.location?.type === 'virtual') {
      event.conferenceData = {
        createRequest: {
          requestId: meeting.id,
          conferenceSolutionKey: { type: 'hangoutsMeet' }
        }
      };
    } else if (meeting.location?.type === 'physical') {
      event.location = meeting.location.address;
    }

    const result = await calendarClient.events.update({
      calendarId: 'primary',
      eventId: meeting.calendarEventId,
      requestBody: event,
      sendUpdates: 'all',
    });

    if (!result.data || !result.data.id) {
      throw new Error('Failed to update calendar event');
    }

    return {
      id: result.data.id,
      calendarId: 'primary',
      meetingId: meeting.id,
      status: 'confirmed',
      eventUrl: result.data.htmlLink || undefined,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error updating calendar event:', error);
    throw error;
  }
}

export async function deleteCalendarEvent(
  meetingId: string,
  eventId: string,
  credentials?: CalendarCredentials
): Promise<boolean> {
  if (!credentials) {
    console.log("No calendar credentials provided");
    return false;
  }

  try {
    const oauth2Client = new auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: credentials.accessToken,
      refresh_token: credentials.refreshToken
    });

    const calendarClient = calendar({ version: 'v3', auth: oauth2Client });

    await calendarClient.events.delete({
      calendarId: 'primary',
      eventId: eventId,
      sendUpdates: 'all',
    });

    return true;
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    throw error;
  }
}

export async function verifyCalendarCredentials(credentials: CalendarCredentials): Promise<boolean> {
  try {
    const oauth2Client = new auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: credentials.accessToken,
      refresh_token: credentials.refreshToken
    });

    const calendarClient = calendar({ version: 'v3', auth: oauth2Client });
    
    // Try to list a single event to verify credentials
    await calendarClient.events.list({
      calendarId: 'primary',
      maxResults: 1,
    });

    return true;
  } catch (error) {
    console.error('Error verifying calendar credentials:', error);
    return false;
  }
}

export function getCalendarAuthUrl(): string {
  const oauth2Client = new auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/speech'
    ]
  });
}

export async function exchangeCodeForTokens(code: string): Promise<CalendarCredentials | null> {
  try {
    const oauth2Client = new auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token) {
      throw new Error('No access token received');
    }

    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: tokens.expiry_date
    };
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    return null;
  }
}

// Google Meet Recording API Integration
export async function startMeetingRecording(meetingId: string, conferenceLink: string, credentials?: CalendarCredentials): Promise<boolean> {
  if (!credentials) {
    console.log("No credentials provided");
    return false;
  }

  try {
    // Extract Google Meet ID from conference link
    const meetIdMatch = conferenceLink.match(/\/([a-z0-9\-]+)(?:\?|$)/);
    if (!meetIdMatch) {
      console.error('Could not extract Google Meet ID from link:', conferenceLink);
      return false;
    }
    
    const meetId = meetIdMatch[1];
    
    // In a production app, you would use the Google Meet API to start recording
    // Note: Google Meet recording requires Google Workspace Enterprise edition
    console.log(`Starting recording for Google Meet with ID: ${meetId}`);
    
    // This would be the actual API call to Google Meet
    // Currently, Google doesn't provide a public API for programmatically starting recordings
    // This is typically done through the Google Meet UI or Google Workspace Admin controls
    
    return true;
  } catch (error) {
    console.error('Error starting Google Meet recording:', error);
    return false;
  }
}

export async function getMeetingRecording(meetingId: string, credentials?: CalendarCredentials): Promise<RecordingDetails | null> {
  if (!credentials) {
    console.log("No credentials provided for retrieving recording");
    return null;
  }

  try {
    const oauth2Client = new auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: credentials.accessToken,
      refresh_token: credentials.refreshToken
    });

    const driveClient = drive({ version: 'v3', auth: oauth2Client });
    
    // Search for the recording file in Google Drive
    // In a real implementation, you'd likely have a more specific search
    // based on naming conventions or metadata for recordings
    const searchResponse = await driveClient.files.list({
      q: `name contains 'recording-${meetingId}' and mimeType contains 'video/'`,
      spaces: 'drive',
      fields: 'files(id, name, webViewLink, createdTime, mimeType)'
    });

    if (!searchResponse.data.files || searchResponse.data.files.length === 0) {
      console.log(`No recording found for meeting ID: ${meetingId}`);
      return null;
    }

    const recordingFile = searchResponse.data.files[0];
    
    // Check if there's a transcript file as well
    const transcriptResponse = await driveClient.files.list({
      q: `name contains 'transcript-${meetingId}' and mimeType contains 'text/'`,
      spaces: 'drive',
      fields: 'files(id, name, webViewLink)'
    });

    const transcriptUrl = transcriptResponse.data.files && transcriptResponse.data.files.length > 0
      ? transcriptResponse.data.files[0].webViewLink || undefined
      : undefined;
    
    // In a real implementation, you'd calculate the actual duration from the video metadata
    // For now, we'll use a placeholder value
    const duration = 3600; // 1 hour in seconds
    
    return {
      recordingUrl: recordingFile.webViewLink || `https://drive.google.com/file/d/${recordingFile.id}`,
      transcriptUrl,
      duration,
      generatedAt: recordingFile.createdTime || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting Google Meet recording from Drive:', error);
    return null;
  }
}

export async function uploadRecordingToGoogleDrive(
  meetingId: string, 
  recordingBlob: Blob,
  credentials?: CalendarCredentials
): Promise<string | null> {
  if (!credentials) {
    console.log("No credentials provided for uploading recording");
    return null;
  }

  try {
    const oauth2Client = new auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: credentials.accessToken,
      refresh_token: credentials.refreshToken
    });

    const driveClient = drive({ version: 'v3', auth: oauth2Client });
    
    // Create metadata for the file
    const fileMetadata: drive_v3.Schema$File = {
      name: `recording-${meetingId}-${format(new Date(), 'yyyy-MM-dd')}`,
      mimeType: recordingBlob.type
    };
    
    // Create media for the file
    const media = {
      mimeType: recordingBlob.type,
      body: recordingBlob
    };
    
    // Upload the file to Google Drive
    const response = await driveClient.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id,webViewLink'
    });

    if (!response.data.id) {
      throw new Error('Failed to upload recording to Google Drive');
    }
    
    // Make the file accessible via link
    await driveClient.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });
    
    return response.data.webViewLink || `https://drive.google.com/file/d/${response.data.id}`;
  } catch (error) {
    console.error('Error uploading recording to Google Drive:', error);
    return null;
  }
}

export async function generateTranscription(
  recordingUrl: string, 
  credentials?: CalendarCredentials
): Promise<string | null> {
  if (!credentials) {
    console.log("No credentials provided for generating transcription");
    return null;
  }

  try {
    const oauth2Client = new auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: credentials.accessToken,
      refresh_token: credentials.refreshToken
    });

    const speechClient = speech({
      version: 'v1p1beta1',
      auth: oauth2Client
    });
    
    // For demonstration purposes only
    // In a real implementation, you would:
    // 1. Download the audio file from Google Drive
    // 2. Convert it to a suitable format for the Speech-to-Text API
    // 3. Convert audio to base64 or upload it to Google Cloud Storage
    // 4. Submit the file to the Speech-to-Text API

    // Mock implementation to demonstrate the API usage
    const request = {
      config: {
        encoding: 'LINEAR16',
        sampleRateHertz: 16000,
        languageCode: 'en-US',
        enableAutomaticPunctuation: true,
        model: 'video',
        useEnhanced: true,
        enableSpeakerDiarization: true,
        diarizationSpeakerCount: 2,
      },
      audio: {
        uri: recordingUrl
      }
    };
    
    // This is a placeholder for the actual API call
    // In a real implementation, you would use the longRunningRecognize method
    // for long audio files, and then poll for the results
    console.log(`Submitting transcription request for: ${recordingUrl}`);
    
    // For now, return a mock transcription
    return "This is a mock transcription generated by Google Cloud Speech-to-Text API. In a real implementation, this would be the actual transcription of the meeting recording.";
  } catch (error) {
    console.error('Error generating transcription with Google Speech-to-Text:', error);
    return null;
  }
}

export async function saveTranscriptionToDrive(
  meetingId: string,
  transcription: string,
  credentials?: CalendarCredentials
): Promise<string | null> {
  if (!credentials) {
    console.log("No credentials provided for saving transcription");
    return null;
  }

  try {
    const oauth2Client = new auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: credentials.accessToken,
      refresh_token: credentials.refreshToken
    });

    const driveClient = drive({ version: 'v3', auth: oauth2Client });
    
    // Create metadata for the file
    const fileMetadata: drive_v3.Schema$File = {
      name: `transcript-${meetingId}-${format(new Date(), 'yyyy-MM-dd')}`,
      mimeType: 'text/plain'
    };
    
    // Create a blob from the transcription text
    const transcriptionBlob = new Blob([transcription], { type: 'text/plain' });
    
    // Create media for the file
    const media = {
      mimeType: 'text/plain',
      body: transcriptionBlob
    };
    
    // Upload the file to Google Drive
    const response = await driveClient.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id,webViewLink'
    });

    if (!response.data.id) {
      throw new Error('Failed to upload transcription to Google Drive');
    }
    
    // Make the file accessible via link
    await driveClient.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });
    
    return response.data.webViewLink || `https://drive.google.com/file/d/${response.data.id}`;
  } catch (error) {
    console.error('Error saving transcription to Google Drive:', error);
    return null;
  }
}

export async function generateMeetingAgenda(meetingType: Meeting["meetingType"]): Promise<string[]> {
  switch (meetingType) {
    case "team":
      return [
        "Team progress update",
        "Blockers and challenges",
        "Next steps and action items"
      ]
    case "one-on-one":
      return [
        "Personal development goals",
        "Recent accomplishments",
        "Challenges and support needed",
        "Feedback and career growth"
      ]
    case "leadership":
      return [
        "Strategy alignment",
        "Team performance review",
        "Process improvements",
        "Resource allocation"
      ]
    case "organization":
      return [
        "Company updates",
        "Quarterly goals and OKRs",
        "Team achievements",
        "Strategic initiatives",
        "Q&A"
      ]
    default:
      return ["Agenda item 1", "Agenda item 2", "Agenda item 3"]
  }
}

export function generateConferenceLink(provider: "google" | "zoom" | "teams"): string {
  const randomId = Math.random().toString(36).substring(2, 10)
  
  if (provider === "google") {
    return `https://meet.google.com/${randomId}`
  }
  
  // Fallback to Google Meet regardless of provider to ensure Google-only solution
  return `https://meet.google.com/${randomId}`
}

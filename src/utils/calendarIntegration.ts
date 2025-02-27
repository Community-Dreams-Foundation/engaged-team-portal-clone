
import { calendar, auth, calendar_v3 } from '@googleapis/calendar'
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
    scope: ['https://www.googleapis.com/auth/calendar']
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

// Recording API Integration - Zoom API
const ZOOM_API_KEY = process.env.ZOOM_API_KEY;
const ZOOM_API_SECRET = process.env.ZOOM_API_SECRET;

// Get Zoom access token
async function getZoomAccessToken(): Promise<string> {
  try {
    const tokenResponse = await fetch('https://zoom.us/oauth/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${ZOOM_API_KEY}:${ZOOM_API_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    if (!tokenResponse.ok) {
      throw new Error(`Failed to get Zoom token: ${tokenResponse.statusText}`);
    }

    const tokenData = await tokenResponse.json();
    return tokenData.access_token;
  } catch (error) {
    console.error('Error getting Zoom access token:', error);
    throw error;
  }
}

export async function startMeetingRecording(meetingId: string, conferenceLink: string): Promise<boolean> {
  try {
    // Extract Zoom meeting ID from conference link
    const zoomMeetingIdMatch = conferenceLink.match(/\/j\/(\d+)/);
    if (!zoomMeetingIdMatch) {
      console.error('Could not extract Zoom meeting ID from link:', conferenceLink);
      return false;
    }
    
    const zoomMeetingId = zoomMeetingIdMatch[1];
    const accessToken = await getZoomAccessToken();
    
    // Start recording via Zoom API
    const response = await fetch(`https://api.zoom.us/v2/meetings/${zoomMeetingId}/recordings/start`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to start recording:', errorData);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error starting meeting recording:', error);
    return false;
  }
}

export async function getMeetingRecording(meetingId: string): Promise<RecordingDetails | null> {
  try {
    // In a real implementation, you would look up the associated Zoom meeting ID
    // from your database using the internal meetingId
    const accessToken = await getZoomAccessToken();
    
    // Query Zoom API for recordings
    // This is a simplified example - you would need to store the Zoom meeting ID when creating the meeting
    const zoomMeetingId = await lookupZoomMeetingId(meetingId);
    
    if (!zoomMeetingId) {
      console.error('No Zoom meeting ID found for meeting:', meetingId);
      return null;
    }
    
    const response = await fetch(`https://api.zoom.us/v2/meetings/${zoomMeetingId}/recordings`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error('Failed to get recordings:', await response.text());
      return null;
    }
    
    const data = await response.json();
    
    // Check if recording files exist
    if (!data.recording_files || data.recording_files.length === 0) {
      console.log('No recording files found for meeting:', meetingId);
      return null;
    }
    
    // Find the MP4 recording file
    const videoRecording = data.recording_files.find((file: any) => file.file_type === 'MP4');
    if (!videoRecording) {
      console.log('No video recording found for meeting:', meetingId);
      return null;
    }
    
    // Get transcript if available
    const transcript = data.recording_files.find((file: any) => file.file_type === 'TRANSCRIPT');
    
    return {
      recordingUrl: videoRecording.download_url,
      transcriptUrl: transcript ? transcript.download_url : undefined,
      duration: videoRecording.recording_end ? 
        (new Date(videoRecording.recording_end).getTime() - new Date(videoRecording.recording_start).getTime()) / 1000 : 0,
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting meeting recording:', error);
    return null;
  }
}

// Mock function to look up Zoom meeting ID - in a real app, this would query your database
async function lookupZoomMeetingId(meetingId: string): Promise<string | null> {
  // This is a placeholder - in a real implementation, you would query your database
  // to find the Zoom meeting ID associated with your internal meeting ID
  console.log(`Looking up Zoom meeting ID for meeting: ${meetingId}`);
  return null; // Return null for now since this is just a placeholder
}

export async function generateTranscription(recordingUrl: string): Promise<string> {
  try {
    // In a real implementation, you would use a service like AssemblyAI, Google Speech-to-Text, etc.
    const accessToken = await getZoomAccessToken();
    
    // This is a simplified example - Zoom actually provides transcripts directly
    // but for customization, you might want to use a dedicated transcription service
    
    // Mock API call to a transcription service
    const response = await fetch('https://api.transcription-service.example/transcribe', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        media_url: recordingUrl,
        language_code: 'en-US'
      })
    });
    
    if (!response.ok) {
      throw new Error(`Transcription service error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.transcript || "No transcript available";
  } catch (error) {
    console.error('Error generating transcription:', error);
    return "Error generating transcription. Please try again later.";
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
  
  switch (provider) {
    case "google":
      return `https://meet.google.com/${randomId}`
    case "zoom":
      return `https://zoom.us/j/${Math.floor(Math.random() * 1000000000)}`
    case "teams":
      return `https://teams.microsoft.com/l/meetup-join/${randomId}`
    default:
      return `https://meet.google.com/${randomId}`
  }
}

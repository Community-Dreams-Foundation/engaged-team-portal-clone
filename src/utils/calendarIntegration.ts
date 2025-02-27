
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

// Google Meet Recording API Integration
export async function startMeetingRecording(meetingId: string, conferenceLink: string): Promise<boolean> {
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
    
    // Mock success for demonstration purposes
    // This is where you would implement the actual API call to Google Meet
    return true;
  } catch (error) {
    console.error('Error starting Google Meet recording:', error);
    return false;
  }
}

export async function getMeetingRecording(meetingId: string): Promise<RecordingDetails | null> {
  try {
    // In a production app, you would query the Google Drive API
    // to find recordings associated with this Meet session
    console.log(`Fetching recording for meeting ID: ${meetingId}`);
    
    // Mock recording data for demonstration purposes
    // In a real implementation, you would query Google Drive for the recording
    const mockRecording: RecordingDetails = {
      recordingUrl: `https://drive.google.com/file/d/mock-recording-${meetingId}`,
      transcriptUrl: `https://drive.google.com/file/d/mock-transcript-${meetingId}`,
      duration: 3600, // 1 hour in seconds
      generatedAt: new Date().toISOString()
    };
    
    return mockRecording;
  } catch (error) {
    console.error('Error getting Google Meet recording:', error);
    return null;
  }
}

export async function generateTranscription(recordingUrl: string): Promise<string> {
  try {
    // In a production app, you would use Google Cloud Speech-to-Text API
    console.log(`Generating transcription for recording: ${recordingUrl}`);
    
    // Mock transcription data
    return "This is a mock transcription of the meeting. In a real implementation, you would use Google Cloud Speech-to-Text API to transcribe the recording.";
  } catch (error) {
    console.error('Error generating transcription with Google Speech-to-Text:', error);
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
  
  if (provider === "google") {
    return `https://meet.google.com/${randomId}`
  }
  
  // Fallback to Google Meet regardless of provider to ensure Google-only solution
  return `https://meet.google.com/${randomId}`
}


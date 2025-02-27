
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

export async function startMeetingRecording(meetingId: string, conferenceLink: string): Promise<boolean> {
  console.log(`Starting recording for meeting: ${meetingId} at ${conferenceLink}`);
  
  return true;
}

export async function getMeetingRecording(meetingId: string): Promise<RecordingDetails | null> {
  console.log(`Fetching recording for meeting: ${meetingId}`);
  
  return {
    recordingUrl: `https://storage.example.com/meetings/${meetingId}/recording.mp4`,
    transcriptUrl: `https://storage.example.com/meetings/${meetingId}/transcript.txt`,
    duration: 3600, // 1 hour in seconds
    generatedAt: new Date().toISOString()
  };
}

export async function generateTranscription(recordingUrl: string): Promise<string> {
  console.log(`Generating transcription for recording: ${recordingUrl}`);
  
  return "This is a mock transcription of the meeting. In a real implementation, this would be the actual transcribed text from the recording.";
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

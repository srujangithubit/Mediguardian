import { Injectable, Logger } from '@nestjs/common';
import { google, calendar_v3, Auth } from 'googleapis';

@Injectable()
export class GoogleCalendarService {
  private readonly logger = new Logger(GoogleCalendarService.name);
  private oauth2Client: any;
  private isConfigured = false;

  constructor() {
    this.init();
  }

  private init() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      this.logger.warn('Google OAuth credentials missing in .env. Calendar integration will run in mock mode.');
      return;
    }

    this.oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );
    this.isConfigured = true;
    this.logger.log('Google OAuth2 client configured successfully.');
  }

  /**
   * Generates the URL for the user to authorize Google Calendar
   * @param userId The ID of the user requesting authorization, passed in state to identify them on callback
   */
  getAuthUrl(userId: string): string {
    if (!this.isConfigured) return '';
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline', // Required to receive a refresh token
      prompt: 'consent', // Force consent prompt to ensure refresh token is returned
      scope: ['https://www.googleapis.com/auth/calendar.events'],
      state: userId,
    });
  }

  /**
   * Exchanges an auth code for tokens
   */
  async getTokens(code: string) {
    if (!this.isConfigured) throw new Error('Google OAuth is not configured');
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }

  /**
   * Returns a configured Calendar API client for a specific user
   */
  private getCalendarClient(refreshToken: string): calendar_v3.Calendar {
    const client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    client.setCredentials({ refresh_token: refreshToken });
    return google.calendar({ version: 'v3', auth: client });
  }

  /**
   * Creates an appointment in Google Calendar
   * @param eventDetails details of the appointment
   * @param refreshToken the user's refresh token
   */
  async createAppointmentEvent(
    eventDetails: {
      title: string;
      description: string;
      location?: string;
      startTime: Date;
      durationMinutes: number;
    },
    refreshToken: string | null
  ): Promise<string> {
    if (!this.isConfigured || !refreshToken) {
      this.logger.log(`[Mock] Created Google Calendar Event: ${eventDetails.title}`);
      return `mock-google-event-id-${Date.now()}`;
    }

    try {
      const calendar = this.getCalendarClient(refreshToken);
      const endTime = new Date(eventDetails.startTime.getTime() + eventDetails.durationMinutes * 60000);
      
      const event: calendar_v3.Schema$Event = {
        summary: eventDetails.title,
        description: eventDetails.description,
        location: eventDetails.location,
        start: {
          dateTime: eventDetails.startTime.toISOString(),
        },
        end: {
          dateTime: endTime.toISOString(),
        },
      };

      const res = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
      });

      this.logger.log(`Created Google Event: ${res.data.id}`);
      return res.data.id as string;
    } catch (error) {
      this.logger.error(`Error creating Google Calendar event: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Updates an existing appointment in Google Calendar
   */
  async updateAppointmentEvent(
    eventId: string,
    eventDetails: Partial<{
      title: string;
      description: string;
      location?: string;
      startTime: Date;
      durationMinutes: number;
    }>,
    refreshToken: string | null
  ) {
    if (!this.isConfigured || !refreshToken || eventId.startsWith('mock-')) {
      this.logger.log(`[Mock] Updated Google Calendar Event: ${eventId}`);
      return;
    }

    try {
      const calendar = this.getCalendarClient(refreshToken);
      
      // First get the existing event
      const existing = await calendar.events.get({
        calendarId: 'primary',
        eventId: eventId,
      });

      const updatedEvent = existing.data;
      
      if (eventDetails.title) updatedEvent.summary = eventDetails.title;
      if (eventDetails.description) updatedEvent.description = eventDetails.description;
      if (eventDetails.location) updatedEvent.location = eventDetails.location;
      
      if (eventDetails.startTime) {
        updatedEvent.start = { dateTime: eventDetails.startTime.toISOString() };
        if (eventDetails.durationMinutes) {
          const end = new Date(eventDetails.startTime.getTime() + eventDetails.durationMinutes * 60000);
          updatedEvent.end = { dateTime: end.toISOString() };
        } else if (existing.data.end?.dateTime) {
          // Keep same duration
          const oldStart = new Date(existing.data.start?.dateTime || '');
          const oldEnd = new Date(existing.data.end?.dateTime || '');
          const duration = oldEnd.getTime() - oldStart.getTime();
          const newEnd = new Date(eventDetails.startTime.getTime() + duration);
          updatedEvent.end = { dateTime: newEnd.toISOString() };
        }
      }

      await calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        requestBody: updatedEvent,
      });
      
      this.logger.log(`Updated Google Event: ${eventId}`);
    } catch (error) {
      this.logger.error(`Error updating Google Calendar event: ${error.message}`, error);
    }
  }

  /**
   * Deletes an appointment from Google Calendar
   */
  async deleteAppointmentEvent(eventId: string, refreshToken: string | null) {
    if (!this.isConfigured || !refreshToken || eventId.startsWith('mock-')) {
      this.logger.log(`[Mock] Deleted Google Calendar Event: ${eventId}`);
      return;
    }

    try {
      const calendar = this.getCalendarClient(refreshToken);
      await calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
      });
      this.logger.log(`Deleted Google Event: ${eventId}`);
    } catch (error) {
      this.logger.error(`Error deleting Google Calendar event: ${error.message}`, error);
    }
  }
}

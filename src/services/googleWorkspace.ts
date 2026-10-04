import { CalendarEventPayload, GoogleAuthStatus, JobApplication, StudyTopic, StudyMilestone } from '../types';
import { storage } from './storage';

declare global {
  interface Window {
    google?: any;
  }
}

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/tasks',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
].join(' ');

class GoogleWorkspaceService {
  private tokenClient: any = null;
  private authStatus: GoogleAuthStatus = {
    isConnected: false,
    accessToken: null,
    expiresAt: null,
    clientId: '',
  };
  private listeners: ((status: GoogleAuthStatus) => void)[] = [];

  constructor() {
    this.restoreToken();
  }

  public subscribe(callback: (status: GoogleAuthStatus) => void): () => void {
    this.listeners.push(callback);
    callback(this.authStatus);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => cb({ ...this.authStatus }));
  }

  public async getClientId(): Promise<string> {
    const customId = storage.getCustomClientId();
    if (customId && customId.trim().length > 0) {
      return customId.trim();
    }
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const config = await res.json();
        return config.oAuthClientId || '';
      }
    } catch (e) {
      console.warn('Could not fetch app config', e);
    }
    return '';
  }

  private restoreToken() {
    try {
      const saved = localStorage.getItem('productivity_hub_token_info');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.expiresAt && Date.now() < parsed.expiresAt) {
          this.authStatus = parsed;
          this.notify();
        } else {
          localStorage.removeItem('productivity_hub_token_info');
        }
      }
    } catch (e) {
      console.error('Error restoring Google token', e);
    }
  }

  public isConnected(): boolean {
    return (
      Boolean(this.authStatus.accessToken) &&
      Boolean(this.authStatus.expiresAt && Date.now() < this.authStatus.expiresAt)
    );
  }

  public getStatus(): GoogleAuthStatus {
    return { ...this.authStatus };
  }

  public async login(): Promise<boolean> {
    const clientId = await this.getClientId();
    if (!clientId) {
      throw new Error(
        'No se ha configurado un Google OAuth Client ID. Por favor ingresa a la Configuración de Google Cloud para ingresar tu Client ID.'
      );
    }

    if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
      throw new Error(
        'El SDK de Google Identity Services no ha terminado de cargar en el navegador. Por favor recarga la página o verifica tu conexión.'
      );
    }

    return new Promise((resolve, reject) => {
      try {
        this.tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: SCOPES,
          prompt: 'consent',
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              console.error('OAuth token error:', tokenResponse);
              reject(new Error(tokenResponse.error_description || tokenResponse.error));
              return;
            }

            const expiresIn = parseInt(tokenResponse.expires_in, 10) || 3600;
            const expiresAt = Date.now() + expiresIn * 1000;
            const accessToken = tokenResponse.access_token;

            let userEmail: string | undefined;
            let userName: string | undefined;
            let userPicture: string | undefined;

            try {
              const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${accessToken}` },
              });
              if (profileRes.ok) {
                const profile = await profileRes.json();
                userEmail = profile.email;
                userName = profile.name;
                userPicture = profile.picture;
              }
            } catch (err) {
              console.warn('Could not fetch user profile details:', err);
            }

            this.authStatus = {
              isConnected: true,
              accessToken,
              expiresAt,
              clientId,
              userEmail,
              userName,
              userPicture,
            };

            localStorage.setItem('productivity_hub_token_info', JSON.stringify(this.authStatus));
            this.notify();
            resolve(true);
          },
        });

        this.tokenClient.requestAccessToken();
      } catch (err) {
        reject(err);
      }
    });
  }

  public logout(): void {
    if (this.authStatus.accessToken && window.google?.accounts?.oauth2?.revoke) {
      try {
        window.google.accounts.oauth2.revoke(this.authStatus.accessToken, () => {
          console.log('Google token revoked');
        });
      } catch (e) {
        console.warn('Token revocation failed', e);
      }
    }

    this.authStatus = {
      isConnected: false,
      accessToken: null,
      expiresAt: null,
      clientId: this.authStatus.clientId,
    };
    localStorage.removeItem('productivity_hub_token_info');
    this.notify();
  }

  private getAuthHeaders() {
    if (!this.isConnected() || !this.authStatus.accessToken) {
      throw new Error('Debes iniciar sesión con Google para sincronizar con Calendar o Tasks.');
    }
    return {
      Authorization: `Bearer ${this.authStatus.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  // ==========================================
  // GOOGLE CALENDAR API
  // ==========================================

  public async scheduleCalendarEvent(event: CalendarEventPayload): Promise<{ id: string; htmlLink: string }> {
    const headers = this.getAuthHeaders();

    // Calculate start & end datetime in ISO format
    const startDateTimeStr = `${event.startDate}T${event.startTime || '09:00'}:00`;
    const startDateTime = new Date(startDateTimeStr);
    const endDateTime = new Date(startDateTime.getTime() + event.durationMinutes * 60 * 1000);
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

    const body = {
      summary: event.title,
      description: event.description,
      location: event.location || 'Remoto / Online',
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone,
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone,
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 30 },
          { method: 'popup', minutes: 10 },
        ],
      },
    };

    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Error al crear evento en Google Calendar (${res.status})`);
    }

    const createdEvent = await res.json();
    return {
      id: createdEvent.id,
      htmlLink: createdEvent.htmlLink || `https://calendar.google.com/calendar/r/eventedit/${createdEvent.id}`,
    };
  }

  // ==========================================
  // GOOGLE TASKS API
  // ==========================================

  public async getOrCreateTaskList(listName: string): Promise<string> {
    const headers = this.getAuthHeaders();

    // 1. Fetch user task lists
    const listRes = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
      headers,
    });

    if (!listRes.ok) {
      const err = await listRes.json().catch(() => ({}));
      throw new Error(err.error?.message || `Error al obtener listas de Google Tasks (${listRes.status})`);
    }

    const data = await listRes.json();
    const existing = (data.items || []).find(
      (item: any) => item.title.trim().toLowerCase() === listName.trim().toLowerCase()
    );

    if (existing) {
      return existing.id;
    }

    // 2. Create new task list
    const createRes = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
      method: 'POST',
      headers,
      body: JSON.stringify({ title: listName }),
    });

    if (!createRes.ok) {
      const err = await createRes.json().catch(() => ({}));
      throw new Error(err.error?.message || `Error al crear lista en Google Tasks (${createRes.status})`);
    }

    const created = await createRes.json();
    return created.id;
  }

  public async createGoogleTask(
    listName: string,
    title: string,
    notes?: string,
    dueDate?: string
  ): Promise<{ id: string; listId: string }> {
    const headers = this.getAuthHeaders();
    const listId = await this.getOrCreateTaskList(listName);

    const taskBody: any = {
      title,
      notes: notes || '',
      status: 'needsAction',
    };

    if (dueDate) {
      // Google Tasks expects RFC 3339 timestamp for due date (e.g. 2026-09-20T00:00:00.000Z)
      const dueObj = new Date(`${dueDate}T23:59:59Z`);
      taskBody.due = dueObj.toISOString();
    }

    const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(listId)}/tasks`, {
      method: 'POST',
      headers,
      body: JSON.stringify(taskBody),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Error al crear tarea en Google Tasks (${res.status})`);
    }

    const created = await res.json();
    return { id: created.id, listId };
  }

  public async syncJobToGoogleTasks(job: JobApplication): Promise<{ id: string; listId: string }> {
    const listName = 'Productivity Hub - Búsqueda de Empleo';
    const title = `[${job.status}] ${job.position} en ${job.company}`;
    const notes = [
      `Empresa: ${job.company}`,
      `Puesto: ${job.position}`,
      `Estado: ${job.status}`,
      job.vacancyUrl ? `Vacante: ${job.vacancyUrl}` : '',
      job.interviewDate ? `Fecha de Entrevista: ${job.interviewDate} ${job.interviewTime || ''}` : '',
      job.notes ? `Notas: ${job.notes}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const dueDate = job.interviewDate || job.applicationDate;
    return this.createGoogleTask(listName, title, notes, dueDate);
  }

  public async syncTopicToGoogleTasks(topic: StudyTopic): Promise<{ id: string; listId: string }> {
    const listName = 'Productivity Hub - Plan de Estudios';
    const title = `[Estudio: ${topic.category}] ${topic.title}`;
    const notes = [
      `Tema: ${topic.title}`,
      `Categoría: ${topic.category}`,
      `Tiempo estimado: ${topic.estimatedHours} horas`,
      `Descripción: ${topic.description}`,
    ].join('\n');

    return this.createGoogleTask(listName, title, notes, topic.targetDate);
  }

  public async syncStudyMilestoneToGoogleTasks(
    milestone: StudyMilestone,
    courseTitle: string
  ): Promise<{ id: string; listId: string }> {
    const listName = 'Productivity Hub - Plan de Estudios';
    const title = `[Hito] ${milestone.title} (${courseTitle})`;
    const notes = [
      `Curso / Plan: ${courseTitle}`,
      `Hito: ${milestone.title}`,
      `Descripción: ${milestone.description || 'Sin notas adicionales.'}`,
      milestone.estimatedHours ? `Estimado: ${milestone.estimatedHours} horas` : '',
    ]
      .filter(Boolean)
      .join('\n');

    return this.createGoogleTask(listName, title, notes, milestone.dueDate);
  }
}

export const googleWorkspace = new GoogleWorkspaceService();

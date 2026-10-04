import React, { useState, useEffect } from 'react';
import { Calendar, Clock, X, ExternalLink, Check, AlertCircle } from 'lucide-react';
import { googleWorkspace } from '../services/googleWorkspace';
import { useToast } from './Toast';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTitle?: string;
  defaultDescription?: string;
  defaultDate?: string;
  defaultTime?: string;
  defaultDuration?: number;
  onEventScheduled?: (eventId: string, eventLink: string) => void;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  defaultTitle = '',
  defaultDescription = '',
  defaultDate = '',
  defaultTime = '10:00',
  defaultDuration = 60,
  onEventScheduled,
}) => {
  const { showToast } = useToast();
  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState(defaultDescription);
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState(defaultTime);
  const [duration, setDuration] = useState(defaultDuration);
  const [isLoading, setIsLoading] = useState(false);
  const [scheduledLink, setScheduledLink] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle(defaultTitle);
      setDescription(defaultDescription);
      const today = new Date().toISOString().split('T')[0];
      setDate(defaultDate || today);
      setTime(defaultTime || '10:00');
      setDuration(defaultDuration || 60);
      setScheduledLink(null);
    }
  }, [isOpen, defaultTitle, defaultDescription, defaultDate, defaultTime, defaultDuration]);

  if (!isOpen) return null;

  const isGoogleConnected = googleWorkspace.isConnected();

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) {
      showToast('error', 'Campos requeridos', 'Por favor ingresa un título y una fecha.');
      return;
    }

    if (!isGoogleConnected) {
      showToast(
        'info',
        'Conexión requerida',
        'Debes iniciar sesión con Google Workspace para agendar en Google Calendar.'
      );
      try {
        await googleWorkspace.login();
      } catch (err: any) {
        showToast('error', 'No se pudo autenticar', err.message || 'Error al conectar con Google.');
        return;
      }
    }

    setIsLoading(true);
    try {
      const result = await googleWorkspace.scheduleCalendarEvent({
        title,
        description,
        startDate: date,
        startTime: time,
        durationMinutes: duration,
      });

      setScheduledLink(result.htmlLink);
      showToast('success', '¡Evento agendado en Google Calendar!', 'Se ha añadido exitosamente a tu calendario principal.');
      if (onEventScheduled) {
        onEventScheduled(result.id, result.htmlLink);
      }
    } catch (error: any) {
      console.error('Error scheduling in Google Calendar:', error);
      showToast('error', 'Error al agendar', error.message || 'Ocurrió un error al contactar la API de Calendar.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="schedule-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
    >
      <div
        id="schedule-modal-content"
        className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-base">
                Agendar en Google Calendar
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Sincronización directa con tu calendario personal
              </p>
            </div>
          </div>
          <button
            id="close-schedule-modal-btn"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1.5 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {scheduledLink ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              ¡Agendado con éxito!
            </h4>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              El evento "{title}" para el {date} a las {time} ya está en tu Google Calendar.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <a
                id="view-in-google-calendar-link"
                href={scheduledLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors shadow-sm"
              >
                <span>Abrir en Google Calendar</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                id="close-after-schedule-btn"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSchedule} className="p-6 space-y-4">
            {!isGoogleConnected && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  No has iniciado sesión con Google aún. Al hacer clic en "Agendar", se abrirá la ventana de autenticación para otorgar acceso a Calendar.
                </span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                Título del Evento *
              </label>
              <input
                id="schedule-event-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Entrevista Técnica con Stripe / Bloque de Estudio Phrasal Verbs"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                  Fecha *
                </label>
                <input
                  id="schedule-event-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                  Hora de Inicio *
                </label>
                <div className="relative">
                  <input
                    id="schedule-event-time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                  Duración
                </label>
                <select
                  id="schedule-event-duration"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value={30}>30 minutos</option>
                  <option value={45}>45 minutos</option>
                  <option value={60}>1 hora (60 min)</option>
                  <option value={90}>1.5 horas (90 min)</option>
                  <option value={120}>2 horas (120 min)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                Descripción / Notas
              </label>
              <textarea
                id="schedule-event-description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Link de reunión, temas a preparar, notas de la vacante o plan de estudio..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
              <button
                id="cancel-schedule-modal-btn"
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                id="submit-schedule-modal-btn"
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors shadow-sm"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Agendando...</span>
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    <span>Agendar en Google Calendar</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

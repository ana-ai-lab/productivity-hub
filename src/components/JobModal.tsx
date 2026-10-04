import React, { useState, useEffect } from 'react';
import { Briefcase, Calendar, Link as LinkIcon, DollarSign, MapPin, User, X, Check, Clock, AlertCircle, Trash2 } from 'lucide-react';
import { JobApplication, JobStatus } from '../types';
import { googleWorkspace } from '../services/googleWorkspace';
import { useToast } from './Toast';

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobToEdit?: JobApplication | null;
  onSaveJob: (job: JobApplication) => void;
  onScheduleInterview?: (job: JobApplication) => void;
  onDeleteJob?: (id: string) => void;
}

const STATUS_OPTIONS: JobStatus[] = [
  'Por aplicar',
  'Aplicado',
  'Entrevista',
  'Prueba Técnica',
  'Oferta/Rechazo',
];

export const JobModal: React.FC<JobModalProps> = ({
  isOpen,
  onClose,
  jobToEdit,
  onSaveJob,
  onScheduleInterview,
  onDeleteJob,
}) => {
  const { showToast } = useToast();
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [status, setStatus] = useState<JobStatus>('Por aplicar');
  const [applicationDate, setApplicationDate] = useState('');
  const [vacancyUrl, setVacancyUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [salary, setSalary] = useState('');
  const [location, setLocation] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('10:00');
  const [autoSyncTasks, setAutoSyncTasks] = useState(true);

  useEffect(() => {
    if (jobToEdit) {
      setCompany(jobToEdit.company);
      setPosition(jobToEdit.position);
      setStatus(jobToEdit.status);
      setApplicationDate(jobToEdit.applicationDate);
      setVacancyUrl(jobToEdit.vacancyUrl || '');
      setNotes(jobToEdit.notes || '');
      setSalary(jobToEdit.salary || '');
      setLocation(jobToEdit.location || '');
      setContactPerson(jobToEdit.contactPerson || '');
      setInterviewDate(jobToEdit.interviewDate || '');
      setInterviewTime(jobToEdit.interviewTime || '10:00');
    } else {
      setCompany('');
      setPosition('');
      setStatus('Por aplicar');
      setApplicationDate(new Date().toISOString().split('T')[0]);
      setVacancyUrl('');
      setNotes('');
      setSalary('');
      setLocation('');
      setContactPerson('');
      setInterviewDate('');
      setInterviewTime('10:00');
    }
  }, [jobToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !position.trim()) {
      showToast('error', 'Campos requeridos', 'Empresa y puesto son obligatorios.');
      return;
    }

    const jobData: JobApplication = {
      id: jobToEdit ? jobToEdit.id : `job-${Date.now()}`,
      company: company.trim(),
      position: position.trim(),
      status,
      applicationDate: applicationDate || new Date().toISOString().split('T')[0],
      vacancyUrl: vacancyUrl.trim(),
      notes: notes.trim(),
      salary: salary.trim() || undefined,
      location: location.trim() || undefined,
      contactPerson: contactPerson.trim() || undefined,
      interviewDate: interviewDate || undefined,
      interviewTime: interviewDate ? interviewTime : undefined,
      syncedToGoogleTasks: jobToEdit ? jobToEdit.syncedToGoogleTasks : false,
      googleTaskId: jobToEdit?.googleTaskId,
      googleTaskListId: jobToEdit?.googleTaskListId,
      syncedToGoogleCalendar: jobToEdit?.syncedToGoogleCalendar,
      googleCalendarEventId: jobToEdit?.googleCalendarEventId,
      createdAt: jobToEdit ? jobToEdit.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Auto-sync with Google Tasks if connected and checked
    if (autoSyncTasks && googleWorkspace.isConnected()) {
      try {
        const taskResult = await googleWorkspace.syncJobToGoogleTasks(jobData);
        jobData.syncedToGoogleTasks = true;
        jobData.googleTaskId = taskResult.id;
        jobData.googleTaskListId = taskResult.listId;
        showToast('success', 'Guardado y sincronizado', `Tarea creada en Google Tasks para ${jobData.company}.`);
      } catch (err: any) {
        console.warn('Could not auto-sync job to Google Tasks:', err);
        showToast('info', 'Guardado localmente', 'Se guardó en el tablero (la sincronización con Tasks falló o se pospuso).');
      }
    } else {
      showToast('success', jobToEdit ? 'Aplicación actualizada' : 'Nueva vacante agregada');
    }

    onSaveJob(jobData);
    onClose();
  };

  return (
    <div
      id="job-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
    >
      <div
        id="job-modal-content"
        className="w-full max-w-xl max-h-[92vh] flex flex-col bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-base">
              {jobToEdit ? 'Editar Aplicación de Empleo' : 'Nueva Postulación de Empleo'}
            </h3>
          </div>
          <button
            id="close-job-modal-btn"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1.5 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                Empresa *
              </label>
              <input
                id="input-job-company"
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Ej. Stripe, Mercado Libre, Google"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                Puesto / Rol *
              </label>
              <input
                id="input-job-position"
                type="text"
                required
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="Ej. Senior Frontend Engineer"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                Columna / Estado *
              </label>
              <select
                id="select-job-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as JobStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                Fecha de Aplicación *
              </label>
              <input
                id="input-job-app-date"
                type="date"
                required
                value={applicationDate}
                onChange={(e) => setApplicationDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
              Link de la Vacante
            </label>
            <div className="relative">
              <LinkIcon className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
              <input
                id="input-job-url"
                type="url"
                value={vacancyUrl}
                onChange={(e) => setVacancyUrl(e.target.value)}
                placeholder="https://..."
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                Rango Salarial
              </label>
              <input
                id="input-job-salary"
                type="text"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="$90k - $120k USD"
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                Ubicación
              </label>
              <input
                id="input-job-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Remoto / Híbrido"
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                Contacto / Reclutador
              </label>
              <input
                id="input-job-contact"
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="Nombre o correo"
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Interview date & time section */}
          <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Fecha de Entrevista / Prueba (Google Calendar)</span>
              </span>
              {jobToEdit && onScheduleInterview && (
                <button
                  type="button"
                  id="open-calendar-from-job-modal-btn"
                  onClick={() => {
                    onClose();
                    onScheduleInterview(jobToEdit);
                  }}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                >
                  Abrir asistente de agendamiento
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-neutral-600 dark:text-neutral-400 mb-1">
                  Día de la reunión
                </label>
                <input
                  id="input-job-interview-date"
                  type="date"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-neutral-100"
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-600 dark:text-neutral-400 mb-1">
                  Hora
                </label>
                <input
                  id="input-job-interview-time"
                  type="time"
                  value={interviewTime}
                  onChange={(e) => setInterviewTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-neutral-100"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
              Notas & Preparación *
            </label>
            <textarea
              id="input-job-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detalles del proceso, preguntas esperadas, tecnologías clave a repasar, etc."
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
            />
          </div>

          <div className="pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                id="checkbox-auto-sync-tasks"
                type="checkbox"
                checked={autoSyncTasks}
                onChange={(e) => setAutoSyncTasks(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 border-neutral-300 dark:border-neutral-700 focus:ring-blue-500"
              />
              <span className="text-xs text-neutral-700 dark:text-neutral-300">
                Sincronizar automáticamente con <strong>Google Tasks</strong> al guardar
              </span>
            </label>
          </div>

          <div className="flex items-center justify-between gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            {jobToEdit && onDeleteJob ? (
              <button
                id="delete-job-from-modal-btn"
                type="button"
                onClick={() => {
                  onDeleteJob(jobToEdit.id);
                  onClose();
                }}
                className="px-3.5 py-2.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Eliminar esta postulación"
              >
                <Trash2 className="w-4 h-4" />
                <span>Eliminar</span>
              </button>
            ) : (
              <div />
            )}
            <div className="flex items-center gap-2">
              <button
                id="cancel-job-modal-btn"
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                id="submit-job-modal-btn"
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-colors"
              >
                {jobToEdit ? 'Guardar Cambios' : 'Crear Postulación'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

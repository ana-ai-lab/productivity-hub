import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  ExternalLink, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  MoreVertical, 
  Trash2, 
  Edit3, 
  ArrowRight, 
  ArrowLeft, 
  Briefcase, 
  ListTodo, 
  MapPin, 
  DollarSign, 
  Building2,
  Filter
} from 'lucide-react';
import { JobApplication, JobStatus } from '../types';
import { googleWorkspace } from '../services/googleWorkspace';
import { useToast } from './Toast';
import { JobModal } from './JobModal';
import { ScheduleModal } from './ScheduleModal';
import { ConfirmDialog } from './ConfirmDialog';

interface KanbanBoardProps {
  jobs: JobApplication[];
  onUpdateJobs: (jobs: JobApplication[]) => void;
}

const COLUMNS: { status: JobStatus; title: string; color: string; bgBadge: string }[] = [
  { 
    status: 'Por aplicar', 
    title: 'Por aplicar', 
    color: 'border-amber-500/80 text-amber-600 dark:text-amber-400',
    bgBadge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
  },
  { 
    status: 'Aplicado', 
    title: 'Aplicado', 
    color: 'border-blue-500/80 text-blue-600 dark:text-blue-400',
    bgBadge: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
  },
  { 
    status: 'Entrevista', 
    title: 'Entrevista', 
    color: 'border-purple-500/80 text-purple-600 dark:text-purple-400',
    bgBadge: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
  },
  { 
    status: 'Prueba Técnica', 
    title: 'Prueba Técnica', 
    color: 'border-indigo-500/80 text-indigo-600 dark:text-indigo-400',
    bgBadge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
  },
  { 
    status: 'Oferta/Rechazo', 
    title: 'Oferta / Decisión', 
    color: 'border-emerald-500/80 text-emerald-600 dark:text-emerald-400',
    bgBadge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
  },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ jobs, onUpdateJobs }) => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJobForEdit, setSelectedJobForEdit] = useState<JobApplication | null>(null);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [scheduleJobTarget, setScheduleJobTarget] = useState<JobApplication | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [draggedJobId, setDraggedJobId] = useState<string | null>(null);
  const [syncingTaskId, setSyncingTaskId] = useState<string | null>(null);
  const [jobToDelete, setJobToDelete] = useState<{ id: string; company: string; position: string } | null>(null);

  const filteredJobs = jobs.filter((job) => {
    const q = searchTerm.toLowerCase();
    return (
      job.company.toLowerCase().includes(q) ||
      job.position.toLowerCase().includes(q) ||
      job.notes.toLowerCase().includes(q)
    );
  });

  const handleSaveJob = (savedJob: JobApplication) => {
    const exists = jobs.some((j) => j.id === savedJob.id);
    let updated: JobApplication[];
    if (exists) {
      updated = jobs.map((j) => (j.id === savedJob.id ? savedJob : j));
    } else {
      updated = [savedJob, ...jobs];
    }
    onUpdateJobs(updated);
  };

  const handleConfirmDeleteJob = () => {
    if (!jobToDelete) return;
    const updated = jobs.filter((j) => j.id !== jobToDelete.id);
    onUpdateJobs(updated);
    showToast('info', 'Postulación eliminada', `Se eliminó el registro de ${jobToDelete.company}.`);
    setJobToDelete(null);
  };

  const handleMoveStatus = (jobId: string, direction: 'next' | 'prev') => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;

    const currentIndex = COLUMNS.findIndex((c) => c.status === job.status);
    let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex < 0 || nextIndex >= COLUMNS.length) return;

    const newStatus = COLUMNS[nextIndex].status;
    const updated = jobs.map((j) =>
      j.id === jobId ? { ...j, status: newStatus, updatedAt: new Date().toISOString() } : j
    );
    onUpdateJobs(updated);
    showToast('info', 'Estado actualizado', `${job.company} movido a "${newStatus}"`);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedJobId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: JobStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggedJobId;
    if (!id) return;

    const job = jobs.find((j) => j.id === id);
    if (job && job.status !== targetStatus) {
      const updated = jobs.map((j) =>
        j.id === id ? { ...j, status: targetStatus, updatedAt: new Date().toISOString() } : j
      );
      onUpdateJobs(updated);
      showToast('info', 'Estado actualizado', `${job.company} movido a "${targetStatus}"`);
    }
    setDraggedJobId(null);
  };

  const handleSyncToGoogleTasks = async (job: JobApplication) => {
    if (!googleWorkspace.isConnected()) {
      showToast('info', 'Autenticación con Google', 'Conectando con Google Workspace...');
      try {
        await googleWorkspace.login();
      } catch (err: any) {
        showToast('error', 'Error de conexión', err.message);
        return;
      }
    }

    setSyncingTaskId(job.id);
    try {
      const res = await googleWorkspace.syncJobToGoogleTasks(job);
      const updated = jobs.map((j) =>
        j.id === job.id
          ? {
              ...j,
              syncedToGoogleTasks: true,
              googleTaskId: res.id,
              googleTaskListId: res.listId,
            }
          : j
      );
      onUpdateJobs(updated);
      showToast(
        'success',
        '¡Sincronizado con Google Tasks!',
        `Se creó la tarea "[${job.status}] ${job.position} en ${job.company}" en tu lista de Google Tasks.`
      );
    } catch (err: any) {
      showToast('error', 'Error al sincronizar con Tasks', err.message);
    } finally {
      setSyncingTaskId(null);
    }
  };

  const handleOpenScheduleModal = (job: JobApplication) => {
    setScheduleJobTarget(job);
    setIsScheduleModalOpen(true);
  };

  const handleEventScheduled = (eventId: string, eventLink: string) => {
    if (!scheduleJobTarget) return;
    const updated = jobs.map((j) =>
      j.id === scheduleJobTarget.id
        ? {
            ...j,
            syncedToGoogleCalendar: true,
            googleCalendarEventId: eventId,
            googleCalendarEventLink: eventLink,
          }
        : j
    );
    onUpdateJobs(updated);
  };

  const handleSyncAllToTasks = async () => {
    if (!googleWorkspace.isConnected()) {
      showToast('info', 'Conexión con Google', 'Por favor inicia sesión con Google primero.');
      try {
        await googleWorkspace.login();
      } catch (e: any) {
        return;
      }
    }

    const pending = jobs.filter((j) => !j.syncedToGoogleTasks);
    if (pending.length === 0) {
      showToast('info', 'Todo al día', 'Todas las postulaciones ya están sincronizadas con Google Tasks.');
      return;
    }

    let successCount = 0;
    let updatedJobs = [...jobs];

    for (const job of pending) {
      try {
        const res = await googleWorkspace.syncJobToGoogleTasks(job);
        updatedJobs = updatedJobs.map((j) =>
          j.id === job.id
            ? { ...j, syncedToGoogleTasks: true, googleTaskId: res.id, googleTaskListId: res.listId }
            : j
        );
        successCount++;
      } catch (err) {
        console.warn(`Failed to sync job ${job.company}:`, err);
      }
    }

    onUpdateJobs(updatedJobs);
    showToast(
      'success',
      'Sincronización masiva completada',
      `Se sincronizaron ${successCount} postulaciones con Google Tasks.`
    );
  };

  return (
    <div id="kanban-section" className="space-y-6">
      {/* Top Bar / Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <span>Tablero Kanban de Búsqueda de Empleo</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold">
              {jobs.length} postulaciones
            </span>
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Gestiona postulaciones, entrevistas, pruebas técnicas y sincroniza automáticamente con Google Tasks y Calendar.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            <input
              id="kanban-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar empresa, rol o notas..."
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Sync All with Google Tasks */}
          <button
            id="sync-all-tasks-btn"
            onClick={handleSyncAllToTasks}
            title="Sincroniza todas las postulaciones no sincronizadas con Google Tasks"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold shadow-xs transition-colors"
          >
            <ListTodo className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Sincronizar todo con Tasks</span>
            <span className="sm:hidden">Tasks</span>
          </button>

          {/* New Job Button */}
          <button
            id="open-new-job-modal-btn"
            onClick={() => {
              setSelectedJobForEdit(null);
              setIsJobModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Vacante</span>
          </button>
        </div>
      </div>

      {/* Kanban Grid */}
      <div
        id="kanban-columns-grid"
        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start min-h-[600px] overflow-x-auto pb-4"
      >
        {COLUMNS.map((col, colIdx) => {
          const columnJobs = filteredJobs.filter((j) => j.status === col.status);

          return (
            <div
              key={col.status}
              id={`kanban-col-${col.status.toLowerCase().replace(/[\s\/]/g, '-')}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.status)}
              className="flex flex-col bg-neutral-100/70 dark:bg-neutral-900/60 rounded-2xl p-3 border border-neutral-200/80 dark:border-neutral-800/80 min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-2 py-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${col.color.split(' ')[0].replace('border-', 'bg-')}`} />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                    {col.title}
                  </h3>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${col.bgBadge}`}>
                  {columnJobs.length}
                </span>
              </div>

              {/* Column Cards */}
              <div className="space-y-3 flex-1">
                {columnJobs.length === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-neutral-200 dark:border-neutral-800/80 rounded-xl p-4 text-center">
                    <p className="text-xs text-neutral-400">Arrastra aquí o agrega una vacante</p>
                  </div>
                ) : (
                  columnJobs.map((job) => (
                    <div
                      key={job.id}
                      id={`job-card-${job.id}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, job.id)}
                      className="group bg-white dark:bg-neutral-800/90 rounded-xl p-4 border border-neutral-200/80 dark:border-neutral-700/60 shadow-xs hover:shadow-md transition-all space-y-3 cursor-grab active:cursor-grabbing"
                    >
                      {/* Company & Actions */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm leading-snug truncate">
                            {job.company}
                          </h4>
                          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium truncate mt-0.5">
                            {job.position}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            id={`edit-job-btn-${job.id}`}
                            onClick={() => {
                              setSelectedJobForEdit(job);
                              setIsJobModalOpen(true);
                            }}
                            title="Editar vacante"
                            className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`delete-job-btn-${job.id}`}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setJobToDelete({ id: job.id, company: job.company, position: job.position });
                            }}
                            title="Eliminar vacante"
                            className="p-1 text-neutral-400 hover:text-rose-600 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Details row: Application date & salary / location */}
                      <div className="space-y-1 text-[11px] text-neutral-500 dark:text-neutral-400">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-neutral-400 shrink-0" />
                          <span>Aplicado: {job.applicationDate}</span>
                        </div>
                        {job.location && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                            <span className="truncate">{job.location}</span>
                          </div>
                        )}
                        {job.salary && (
                          <div className="flex items-center gap-1.5">
                            <DollarSign className="w-3 h-3 text-neutral-400 shrink-0" />
                            <span className="truncate">{job.salary}</span>
                          </div>
                        )}
                      </div>

                      {/* Vacancy Link */}
                      {job.vacancyUrl && (
                        <div>
                          <a
                            href={job.vacancyUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline max-w-full truncate"
                          >
                            <ExternalLink className="w-3 h-3 shrink-0" />
                            <span className="truncate">Ver publicación oficial</span>
                          </a>
                        </div>
                      )}

                      {/* Notes snippet */}
                      {job.notes && (
                        <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-100 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-300 line-clamp-3 leading-relaxed">
                          {job.notes}
                        </div>
                      )}

                      {/* Google Workspace Sync Badges & Actions */}
                      <div className="pt-2 border-t border-neutral-100 dark:border-neutral-700/60 space-y-2">
                        {/* Tasks status & sync */}
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-neutral-500 flex items-center gap-1">
                            <ListTodo className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>Google Tasks:</span>
                          </span>
                          {job.syncedToGoogleTasks ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Sincronizado</span>
                            </span>
                          ) : (
                            <button
                              id={`sync-task-btn-${job.id}`}
                              disabled={syncingTaskId === job.id}
                              onClick={() => handleSyncToGoogleTasks(job)}
                              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                            >
                              {syncingTaskId === job.id ? 'Sincronizando...' : 'Crear Tarea'}
                            </button>
                          )}
                        </div>

                        {/* Calendar status & schedule */}
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-neutral-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            <span>Google Calendar:</span>
                          </span>
                          {job.syncedToGoogleCalendar ? (
                            <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Agendado</span>
                            </span>
                          ) : (
                            <button
                              id={`schedule-cal-btn-${job.id}`}
                              onClick={() => handleOpenScheduleModal(job)}
                              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                            >
                              Agendar
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Move Column Arrow Controls (Accessibility / Mobile fallback) */}
                      <div className="flex items-center justify-between pt-1 text-neutral-400">
                        {colIdx > 0 ? (
                          <button
                            id={`move-prev-${job.id}`}
                            onClick={() => handleMoveStatus(job.id, 'prev')}
                            title={`Mover a ${COLUMNS[colIdx - 1].title}`}
                            className="p-1 hover:text-neutral-800 dark:hover:text-neutral-200 text-xs flex items-center gap-0.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700"
                          >
                            <ArrowLeft className="w-3 h-3" />
                            <span className="text-[10px]">Atrás</span>
                          </button>
                        ) : <div />}

                        {colIdx < COLUMNS.length - 1 ? (
                          <button
                            id={`move-next-${job.id}`}
                            onClick={() => handleMoveStatus(job.id, 'next')}
                            title={`Mover a ${COLUMNS[colIdx + 1].title}`}
                            className="p-1 hover:text-neutral-800 dark:hover:text-neutral-200 text-xs flex items-center gap-0.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700"
                          >
                            <span className="text-[10px]">Avanzar</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : <div />}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit / New Job Modal */}
      {isJobModalOpen && (
        <JobModal
          isOpen={isJobModalOpen}
          onClose={() => {
            setIsJobModalOpen(false);
            setSelectedJobForEdit(null);
          }}
          jobToEdit={selectedJobForEdit}
          onSaveJob={handleSaveJob}
          onScheduleInterview={(job) => {
            setScheduleJobTarget(job);
            setIsScheduleModalOpen(true);
          }}
          onDeleteJob={(id) => {
            const job = jobs.find((j) => j.id === id);
            if (job) {
              setJobToDelete({ id: job.id, company: job.company, position: job.position });
            }
          }}
        />
      )}

      {/* Schedule Interview Modal */}
      {isScheduleModalOpen && (
        <ScheduleModal
          isOpen={isScheduleModalOpen}
          onClose={() => {
            setIsScheduleModalOpen(false);
            setScheduleJobTarget(null);
          }}
          defaultTitle={
            scheduleJobTarget
              ? `Entrevista: ${scheduleJobTarget.position} en ${scheduleJobTarget.company}`
              : 'Entrevista Laboral'
          }
          defaultDescription={
            scheduleJobTarget
              ? `Empresa: ${scheduleJobTarget.company}\nPuesto: ${scheduleJobTarget.position}\nVacante: ${scheduleJobTarget.vacancyUrl || 'N/A'}\nNotas: ${scheduleJobTarget.notes}`
              : ''
          }
          defaultDate={scheduleJobTarget?.interviewDate || ''}
          defaultTime={scheduleJobTarget?.interviewTime || '10:00'}
          defaultDuration={60}
          onEventScheduled={handleEventScheduled}
        />
      )}

      {/* Confirmation Dialog for Deletion */}
      <ConfirmDialog
        isOpen={Boolean(jobToDelete)}
        onClose={() => setJobToDelete(null)}
        onConfirm={handleConfirmDeleteJob}
        title="¿Eliminar postulación?"
        message={
          jobToDelete
            ? `¿Estás seguro de que deseas eliminar la postulación para "${jobToDelete.position}" en ${jobToDelete.company}? Esta acción no se puede deshacer.`
            : ''
        }
        confirmLabel="Eliminar postulación"
      />
    </div>
  );
};

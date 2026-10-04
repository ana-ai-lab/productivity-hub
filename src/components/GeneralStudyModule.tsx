import React, { useState } from 'react';
import { 
  GraduationCap, 
  Sparkles, 
  Plus, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Search, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  ListTodo, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  Layers, 
  Award, 
  Timer, 
  Check, 
  AlertCircle,
  Filter,
  Flame,
  FileText
} from 'lucide-react';
import { StudyCourse, StudyMilestone, StudyPlanCategory, StudySessionLog } from '../types';
import { googleWorkspace } from '../services/googleWorkspace';
import { useToast } from './Toast';
import { ScheduleModal } from './ScheduleModal';
import { AiStudyPlanModal } from './studies/AiStudyPlanModal';
import { CourseEditModal } from './studies/CourseEditModal';
import { LogSessionModal } from './studies/LogSessionModal';
import { StudyTimerModal } from './studies/StudyTimerModal';
import { ConfirmDialog } from './ConfirmDialog';

interface GeneralStudyModuleProps {
  courses: StudyCourse[];
  studySessions: StudySessionLog[];
  onUpdateCourses: (courses: StudyCourse[]) => void;
  onUpdateStudySessions: (sessions: StudySessionLog[]) => void;
}

export const GeneralStudyModule: React.FC<GeneralStudyModuleProps> = ({
  courses,
  studySessions,
  onUpdateCourses,
  onUpdateStudySessions,
}) => {
  const { showToast } = useToast();

  // Active view: 'courses' | 'sessions'
  const [viewMode, setViewMode] = useState<'courses' | 'sessions'>('courses');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Expanded cards state (all expanded by default for quick access)
  const [expandedCourseIds, setExpandedCourseIds] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    courses.forEach((c) => {
      initial[c.id] = true;
    });
    return initial;
  });

  // Modals state
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<StudyCourse | null>(null);
  const [isLogSessionOpen, setIsLogSessionOpen] = useState(false);
  const [activeCourseForSession, setActiveCourseForSession] = useState<string | undefined>(undefined);
  const [isTimerOpen, setIsTimerOpen] = useState(false);

  // Google Calendar scheduling modal
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleData, setScheduleData] = useState<{
    title: string;
    description: string;
    date: string;
  }>({ title: '', description: '', date: '' });

  // Sync state for Tasks
  const [syncingMilestoneId, setSyncingMilestoneId] = useState<string | null>(null);

  // In-app deletion confirm dialog state
  const [courseToDelete, setCourseToDelete] = useState<{ id: string; title: string } | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  // Toggle card collapse/expand
  const toggleCourseExpand = (id: string) => {
    setExpandedCourseIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Checkbox milestone complete toggle
  const handleToggleMilestone = (courseId: string, milestoneId: string) => {
    const updated = courses.map((course) => {
      if (course.id !== courseId) return course;

      let hoursChange = 0;
      const newMilestones = course.milestones.map((m) => {
        if (m.id !== milestoneId) return m;
        const nextCompleted = !m.completed;
        hoursChange = nextCompleted ? m.estimatedHours : -m.estimatedHours;
        return {
          ...m,
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date().toISOString().split('T')[0] : undefined,
        };
      });

      const nextCompletedHours = Math.max(0, Math.min(course.totalEstimatedHours, course.completedHours + hoursChange));
      const allDone = newMilestones.every((m) => m.completed) && newMilestones.length > 0;

      return {
        ...course,
        milestones: newMilestones,
        completedHours: nextCompletedHours,
        status: allDone ? ('Completado' as const) : course.status === 'Por iniciar' ? ('En progreso' as const) : course.status,
        updatedAt: new Date().toISOString(),
      };
    });

    onUpdateCourses(updated);
  };

  // Quick hour increment
  const handleQuickAddHours = (courseId: string, hours: number) => {
    const updated = courses.map((course) => {
      if (course.id !== courseId) return course;
      const nextHours = Math.min(course.totalEstimatedHours, course.completedHours + hours);
      return {
        ...course,
        completedHours: nextHours,
        status: course.status === 'Por iniciar' ? ('En progreso' as const) : course.status,
        updatedAt: new Date().toISOString(),
      };
    });

    onUpdateCourses(updated);
    showToast('success', 'Tiempo registrado', `Se agregaron ${hours}h al curso.`);
  };

  // Sync milestone to Google Tasks
  const handleSyncMilestoneToTasks = async (course: StudyCourse, milestone: StudyMilestone) => {
    if (!googleWorkspace.isConnected()) {
      showToast(
        'info',
        'Google Workspace desconectado',
        'Por favor haz clic en "Conectar Google" en la barra superior para sincronizar con Google Tasks.'
      );
      return;
    }

    setSyncingMilestoneId(milestone.id);
    try {
      const result = await googleWorkspace.syncStudyMilestoneToGoogleTasks(milestone, course.title);

      const updated = courses.map((c) => {
        if (c.id !== course.id) return c;
        return {
          ...c,
          milestones: c.milestones.map((m) =>
            m.id === milestone.id ? { ...m, syncedToGoogleTasks: true, googleTaskId: result.id } : m
          ),
        };
      });

      onUpdateCourses(updated);
      showToast('success', '¡Sincronizado con Google Tasks!', `"${milestone.title}" se agregó a tu lista de Google Tasks.`);
    } catch (err: any) {
      console.error('Error syncing milestone to Tasks:', err);
      showToast('error', 'Error al sincronizar con Google Tasks', err.message);
    } finally {
      setSyncingMilestoneId(null);
    }
  };

  // Open calendar scheduling for milestone
  const handleScheduleMilestone = (course: StudyCourse, milestone: StudyMilestone) => {
    const today = new Date().toISOString().split('T')[0];
    setScheduleData({
      title: `Estudio: ${milestone.title}`,
      description: `Plan: ${course.title}\nMódulo: ${milestone.title}\nDetalles: ${milestone.description || ''}`,
      date: milestone.dueDate || today,
    });
    setIsScheduleModalOpen(true);
  };

  // Save new or edited course
  const handleSaveCourse = (savedCourse: StudyCourse) => {
    const exists = courses.some((c) => c.id === savedCourse.id);
    if (exists) {
      onUpdateCourses(courses.map((c) => (c.id === savedCourse.id ? savedCourse : c)));
    } else {
      onUpdateCourses([savedCourse, ...courses]);
      setExpandedCourseIds((prev) => ({ ...prev, [savedCourse.id]: true }));
    }
  };

  // Delete course confirmation
  const handleConfirmDeleteCourse = () => {
    if (!courseToDelete) return;
    onUpdateCourses(courses.filter((c) => c.id !== courseToDelete.id));
    showToast('info', 'Plan eliminado', `Se ha removido "${courseToDelete.title}".`);
    setCourseToDelete(null);
  };

  // Save study session log
  const handleSaveSession = (session: StudySessionLog, courseId: string, hoursToAdd: number) => {
    onUpdateStudySessions([session, ...studySessions]);
    const updated = courses.map((c) => {
      if (c.id !== courseId) return c;
      return {
        ...c,
        completedHours: Math.min(c.totalEstimatedHours, Number((c.completedHours + hoursToAdd).toFixed(1))),
        status: c.status === 'Por iniciar' ? ('En progreso' as const) : c.status,
        updatedAt: new Date().toISOString(),
      };
    });
    onUpdateCourses(updated);
  };

  // Delete session log confirmation
  const handleConfirmDeleteSession = () => {
    if (!sessionToDelete) return;
    onUpdateStudySessions(studySessions.filter((s) => s.id !== sessionToDelete));
    showToast('info', 'Registro eliminado', 'La sesión fue eliminada de la bitácora.');
    setSessionToDelete(null);
  };

  // Metrics calculation
  const totalCourses = courses.length;
  const inProgressCourses = courses.filter((c) => c.status === 'En progreso').length;
  const completedCourses = courses.filter((c) => c.status === 'Completado').length;
  
  const totalEstimatedHours = courses.reduce((sum, c) => sum + (c.totalEstimatedHours || 0), 0);
  const totalCompletedHours = courses.reduce((sum, c) => sum + (c.completedHours || 0), 0);
  const hoursProgressPercent = totalEstimatedHours > 0 ? Math.round((totalCompletedHours / totalEstimatedHours) * 100) : 0;

  const totalMilestones = courses.reduce((sum, c) => sum + c.milestones.length, 0);
  const completedMilestones = courses.reduce(
    (sum, c) => sum + c.milestones.filter((m) => m.completed).length,
    0
  );
  const milestonesPercent = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  // Filtered courses
  const filteredCourses = courses.filter((c) => {
    const matchesSearch = 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.institutionOrPlatform.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.notes.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner & Overview Metrics */}
      <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Title & Description */}
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-neutral-900 dark:text-neutral-100 tracking-tight">
                  Plan de Estudios & Certificaciones
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Planifica y monitorea tus materias, certificaciones técnicas, libros y cursos profesionales
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Planificar con IA</span>
            </button>

            <button
              onClick={() => {
                setCourseToEdit(null);
                setIsEditModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-750 text-neutral-800 dark:text-neutral-200 text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Curso</span>
            </button>

            <button
              onClick={() => {
                setActiveCourseForSession(undefined);
                setIsLogSessionOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100 transition-colors"
            >
              <Clock className="w-4 h-4" />
              <span>Registrar Sesión</span>
            </button>

            <button
              onClick={() => setIsTimerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/60 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-semibold hover:bg-amber-100 transition-colors"
              title="Iniciar temporizador de estudio enfocado (Pomodoro)"
            >
              <Timer className="w-4 h-4" />
              <span>Modo Enfoque</span>
            </button>
          </div>
        </div>

        {/* Global Progress Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-neutral-100 dark:border-neutral-800/80">
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-800">
            <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
              Planes Activos
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-neutral-900 dark:text-neutral-100">
                {inProgressCourses}
              </span>
              <span className="text-xs text-neutral-500">
                de {totalCourses} totales ({completedCourses} completados)
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-800">
            <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
              Horas de Estudio
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                {totalCompletedHours}h
              </span>
              <span className="text-xs text-neutral-500">
                de {totalEstimatedHours}h ({hoursProgressPercent}%)
              </span>
            </div>
            <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, hoursProgressPercent)}%` }}
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-800">
            <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
              Hitos Completados
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {completedMilestones}
              </span>
              <span className="text-xs text-neutral-500">
                de {totalMilestones} ({milestonesPercent}%)
              </span>
            </div>
            <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, milestonesPercent)}%` }}
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-800">
            <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
              Sesiones Registradas
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {studySessions.length}
              </span>
              <span className="text-xs text-neutral-500 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                Bitácora activa
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-view Navigation: Courses vs Sessions Log */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('courses')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'courses'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Mis Cursos y Planes ({filteredCourses.length})</span>
          </button>

          <button
            onClick={() => setViewMode('sessions')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'sessions'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Bitácora de Sesiones ({studySessions.length})</span>
          </button>
        </div>

        {/* Search & Filter Toolbar (when on courses view) */}
        {viewMode === 'courses' && (
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar plan o plataforma..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-700 dark:text-neutral-300 focus:outline-hidden"
            >
              <option value="all">Todas las categorías</option>
              <option value="Tecnología">Tecnología</option>
              <option value="Certificación">Certificación</option>
              <option value="Universidad">Universidad</option>
              <option value="Ciencia de Datos">Ciencia de Datos</option>
              <option value="Negocios">Negocios</option>
              <option value="Habilidades Blandas">Habilidades Blandas</option>
              <option value="Otro">Otro</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-700 dark:text-neutral-300 focus:outline-hidden"
            >
              <option value="all">Todos los estados</option>
              <option value="En progreso">En progreso</option>
              <option value="Por iniciar">Por iniciar</option>
              <option value="En pausa">En pausa</option>
              <option value="Completado">Completado</option>
            </select>
          </div>
        )}
      </div>

      {/* Main View: Courses List */}
      {viewMode === 'courses' && (
        <div className="space-y-4">
          {filteredCourses.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <BookOpen className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                No se encontraron planes de estudio
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mt-1 mb-4">
                {searchQuery || categoryFilter !== 'all' || statusFilter !== 'all'
                  ? 'Intenta cambiar tus filtros de búsqueda.'
                  : 'Comienza generando un plan estructurado con IA o creando uno manual.'}
              </p>
              <button
                onClick={() => setIsAiModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generar Plan con IA</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {filteredCourses.map((course) => {
                const isExpanded = expandedCourseIds[course.id] ?? true;
                const completedMs = course.milestones.filter((m) => m.completed).length;
                const progressPct = course.milestones.length > 0 ? Math.round((completedMs / course.milestones.length) * 100) : 0;
                const hoursPct = course.totalEstimatedHours > 0 ? Math.round((course.completedHours / course.totalEstimatedHours) * 100) : 0;

                const categoryBadgeColors: Record<string, string> = {
                  Certificación: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800',
                  Tecnología: 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-800',
                  Universidad: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
                  'Ciencia de Datos': 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border-purple-200 dark:border-purple-800',
                  Negocios: 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200 dark:border-rose-800',
                  Otro: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700',
                };

                const statusBadgeColors: Record<string, string> = {
                  'En progreso': 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800',
                  'Por iniciar': 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700',
                  'En pausa': 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800',
                  Completado: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
                };

                return (
                  <div
                    key={course.id}
                    className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs hover:shadow-md transition-all overflow-hidden"
                  >
                    {/* Course Card Header */}
                    <div className="p-5 border-b border-neutral-100 dark:border-neutral-800/80 bg-gradient-to-r from-neutral-50/50 via-white to-neutral-50/50 dark:from-neutral-850/50 dark:via-neutral-900 dark:to-neutral-850/50">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1.5 flex-1">
                          {/* Badges row */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                                categoryBadgeColors[course.category] || categoryBadgeColors.Otro
                              }`}
                            >
                              {course.category}
                            </span>

                            <span
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                                statusBadgeColors[course.status] || statusBadgeColors['Por iniciar']
                              }`}
                            >
                              {course.status}
                            </span>

                            {course.institutionOrPlatform && (
                              <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                                • {course.institutionOrPlatform}
                              </span>
                            )}
                          </div>

                          {/* Course Title */}
                          <h3 className="text-base font-extrabold text-neutral-900 dark:text-neutral-100 tracking-tight">
                            {course.title}
                          </h3>

                          {course.notes && (
                            <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">
                              {course.notes}
                            </p>
                          )}
                        </div>

                        {/* Top Card Actions */}
                        <div className="flex items-center gap-1.5 self-end sm:self-start">
                          <button
                            onClick={() => {
                              setActiveCourseForSession(course.id);
                              setIsLogSessionOpen(true);
                            }}
                            title="Registrar sesión de estudio en este curso"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-750 text-neutral-700 dark:text-neutral-300 text-xs font-semibold shadow-2xs transition-colors"
                          >
                            <Clock className="w-3.5 h-3.5 text-indigo-500" />
                            <span className="hidden md:inline">+Registrar</span>
                          </button>

                          <button
                            onClick={() => {
                              setCourseToEdit(course);
                              setIsEditModalOpen(true);
                            }}
                            title="Editar curso"
                            className="p-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-50 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCourseToDelete({ id: course.id, title: course.title });
                            }}
                            title="Eliminar plan de estudios"
                            className="p-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => toggleCourseExpand(course.id)}
                            className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                            title={isExpanded ? 'Contraer módulos' : 'Expandir módulos'}
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Progress Stats bar */}
                      <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-4 text-neutral-600 dark:text-neutral-300">
                          <div>
                            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                              {completedMs} / {course.milestones.length}
                            </span>{' '}
                            hitos ({progressPct}%)
                          </div>
                          <span>•</span>
                          <div>
                            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                              {course.completedHours}h
                            </span>{' '}
                            de {course.totalEstimatedHours}h estimadas
                          </div>
                          {course.targetDate && (
                            <>
                              <span className="hidden sm:inline">•</span>
                              <div className="hidden sm:flex items-center gap-1 text-neutral-500">
                                <Calendar className="w-3 h-3" />
                                <span>Meta: {course.targetDate}</span>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Quick hour adders */}
                        <div className="flex items-center gap-1.5 self-start sm:self-auto">
                          <span className="text-[11px] text-neutral-400 mr-1 hidden sm:inline">Rápido:</span>
                          <button
                            onClick={() => handleQuickAddHours(course.id, 0.5)}
                            className="px-2 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 transition-colors"
                          >
                            +30m
                          </button>
                          <button
                            onClick={() => handleQuickAddHours(course.id, 1)}
                            className="px-2 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 transition-colors"
                          >
                            +1h
                          </button>
                        </div>
                      </div>

                      {/* Visual progress track */}
                      <div className="w-full h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full mt-2.5 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(progressPct, hoursPct))}%` }}
                        />
                      </div>
                    </div>

                    {/* Expandable Milestones / Modules Content */}
                    {isExpanded && (
                      <div className="p-5 space-y-4">
                        {/* Milestones Checklist */}
                        <div>
                          <div className="flex items-center justify-between mb-2.5">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
                              <Layers className="w-3.5 h-3.5 text-blue-500" />
                              <span>Módulos y Temario de Estudio ({course.milestones.length})</span>
                            </h4>
                            <span className="text-[11px] text-neutral-400">
                              Marca las casillas al avanzar para actualizar tu progreso
                            </span>
                          </div>

                          <div className="space-y-2">
                            {course.milestones.map((ms, index) => (
                              <div
                                key={ms.id}
                                className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-3 ${
                                  ms.completed
                                    ? 'bg-neutral-50/60 dark:bg-neutral-850/40 border-neutral-200/60 dark:border-neutral-800 opacity-80'
                                    : 'bg-white dark:bg-neutral-850 border-neutral-200 dark:border-neutral-700/80 hover:border-blue-400'
                                }`}
                              >
                                <div className="flex items-start gap-3 flex-1">
                                  {/* Checkbox */}
                                  <button
                                    onClick={() => handleToggleMilestone(course.id, ms.id)}
                                    className={`w-5 h-5 mt-0.5 rounded-lg border flex items-center justify-center transition-all ${
                                      ms.completed
                                        ? 'bg-emerald-600 border-emerald-600 text-white'
                                        : 'border-neutral-300 dark:border-neutral-600 hover:border-blue-500 bg-white dark:bg-neutral-800'
                                    }`}
                                  >
                                    {ms.completed && <Check className="w-3.5 h-3.5" />}
                                  </button>

                                  <div className="space-y-0.5 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span
                                        className={`text-xs font-bold ${
                                          ms.completed
                                            ? 'line-through text-neutral-400 dark:text-neutral-500'
                                            : 'text-neutral-900 dark:text-neutral-100'
                                        }`}
                                      >
                                        {index + 1}. {ms.title}
                                      </span>

                                      <span className="px-1.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-[10px] font-semibold">
                                        {ms.estimatedHours}h
                                      </span>

                                      {ms.dueDate && (
                                        <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                                          <Calendar className="w-2.5 h-2.5" />
                                          {ms.dueDate}
                                        </span>
                                      )}

                                      {ms.syncedToGoogleTasks && (
                                        <span className="px-1.5 py-0.2 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[9px] font-bold">
                                          En Google Tasks
                                        </span>
                                      )}
                                    </div>

                                    {ms.description && (
                                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                        {ms.description}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* Milestone Sync / Actions */}
                                <div className="flex items-center gap-1.5 self-end sm:self-center pl-8 sm:pl-0">
                                  {/* Sync to Google Tasks */}
                                  <button
                                    onClick={() => handleSyncMilestoneToTasks(course, ms)}
                                    disabled={syncingMilestoneId === ms.id}
                                    title="Sincronizar este hito con Google Tasks"
                                    className={`p-1.5 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1 ${
                                      ms.syncedToGoogleTasks
                                        ? 'border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30'
                                        : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:text-blue-600 hover:border-blue-300'
                                    }`}
                                  >
                                    {syncingMilestoneId === ms.id ? (
                                      <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      <ListTodo className="w-3.5 h-3.5" />
                                    )}
                                    <span className="hidden lg:inline text-[11px]">Tasks</span>
                                  </button>

                                  {/* Schedule in Google Calendar */}
                                  <button
                                    onClick={() => handleScheduleMilestone(course, ms)}
                                    title="Agendar sesión de estudio para este hito en Google Calendar"
                                    className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:text-blue-600 hover:border-blue-300 text-xs font-medium transition-colors flex items-center gap-1"
                                  >
                                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                                    <span className="hidden lg:inline text-[11px]">Calendar</span>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Resources Links */}
                        {course.resources && course.resources.length > 0 && (
                          <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80">
                            <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
                              Recursos y Enlaces Útiles
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {course.resources.map((res) => (
                                <a
                                  key={res.id}
                                  href={res.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-750 text-xs text-blue-600 dark:text-blue-400 font-medium transition-colors"
                                >
                                  <span>{res.title}</span>
                                  <ExternalLink className="w-3 h-3 opacity-70" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Secondary View: Study Sessions Log / Bitácora */}
      {viewMode === 'sessions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" />
              <span>Historial de Sesiones de Estudio</span>
            </h3>
            <button
              onClick={() => {
                setActiveCourseForSession(undefined);
                setIsLogSessionOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva Sesión</span>
            </button>
          </div>

          {studySessions.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <Clock className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                Aún no has registrado sesiones de estudio
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto mt-1 mb-4">
                Usa el botón "Registrar Sesión" o el "Modo Enfoque" para llevar la cuenta de tus horas y aprendizajes.
              </p>
              <button
                onClick={() => setIsLogSessionOpen(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs"
              >
                Registrar Primera Sesión
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {studySessions.map((session) => (
                <div
                  key={session.id}
                  className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs flex items-start justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                        {session.courseTitle}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold">
                        {session.minutesSpent >= 60 ? `${(session.minutesSpent / 60).toFixed(1)}h` : `${session.minutesSpent} min`}
                      </span>
                      <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {session.date}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-700 dark:text-neutral-300">
                      {session.summary}
                    </p>

                    {session.keyTakeaways && (
                      <div className="p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/50 dark:border-neutral-700/50 text-[11px] text-neutral-600 dark:text-neutral-300">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">Aprendizaje clave: </span>
                        {session.keyTakeaways}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSessionToDelete(session.id);
                    }}
                    className="p-1.5 text-neutral-400 hover:text-rose-600 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    title="Eliminar sesión"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <AiStudyPlanModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onPlanCreated={handleSaveCourse}
      />

      <CourseEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setCourseToEdit(null);
        }}
        onSaveCourse={handleSaveCourse}
        courseToEdit={courseToEdit}
        onDeleteCourse={(id) => {
          const course = courses.find((c) => c.id === id);
          if (course) {
            setCourseToDelete({ id: course.id, title: course.title });
          }
        }}
      />

      <LogSessionModal
        isOpen={isLogSessionOpen}
        onClose={() => {
          setIsLogSessionOpen(false);
          setActiveCourseForSession(undefined);
        }}
        courses={courses}
        defaultCourseId={activeCourseForSession}
        onSaveSession={handleSaveSession}
      />

      <StudyTimerModal
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
        courses={courses}
        onSessionFinished={(courseId, mins) => {
          const course = courses.find((c) => c.id === courseId);
          handleSaveSession(
            {
              id: `session-pomodoro-${Date.now()}`,
              courseId,
              courseTitle: course ? course.title : 'Estudio Enfocado',
              date: new Date().toISOString().split('T')[0],
              minutesSpent: mins,
              summary: `Sesión de enfoque completada (${mins} min).`,
            },
            courseId,
            Number((mins / 60).toFixed(1))
          );
        }}
      />

      {/* Schedule in Calendar Modal */}
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        defaultTitle={scheduleData.title}
        defaultDescription={scheduleData.description}
        defaultDate={scheduleData.date}
        defaultDuration={60}
      />

      {/* Confirm Deletion Dialogs */}
      <ConfirmDialog
        isOpen={Boolean(courseToDelete)}
        onClose={() => setCourseToDelete(null)}
        onConfirm={handleConfirmDeleteCourse}
        title="¿Eliminar plan de estudio?"
        message={
          courseToDelete
            ? `¿Estás seguro de eliminar el plan "${courseToDelete.title}" y todos sus módulos asociados? Esta acción no se puede deshacer.`
            : ''
        }
        confirmLabel="Eliminar plan"
      />

      <ConfirmDialog
        isOpen={Boolean(sessionToDelete)}
        onClose={() => setSessionToDelete(null)}
        onConfirm={handleConfirmDeleteSession}
        title="¿Eliminar registro de sesión?"
        message="¿Deseas eliminar este registro de la bitácora de estudio? Esta acción no se puede deshacer."
        confirmLabel="Eliminar registro"
      />
    </div>
  );
};

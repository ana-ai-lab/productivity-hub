import React, { useState, useEffect } from 'react';
import { X, Clock, BookOpen, Check, Award } from 'lucide-react';
import { StudyCourse, StudySessionLog } from '../../types';
import { useToast } from '../Toast';

interface LogSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: StudyCourse[];
  defaultCourseId?: string;
  onSaveSession: (session: StudySessionLog, courseId: string, hoursToAdd: number) => void;
}

export const LogSessionModal: React.FC<LogSessionModalProps> = ({
  isOpen,
  onClose,
  courses,
  defaultCourseId,
  onSaveSession,
}) => {
  const { showToast } = useToast();
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [minutes, setMinutes] = useState(60);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [summary, setSummary] = useState('');
  const [keyTakeaways, setKeyTakeaways] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedCourseId(defaultCourseId || (courses.length > 0 ? courses[0].id : ''));
      setMinutes(60);
      setDate(new Date().toISOString().split('T')[0]);
      setSummary('');
      setKeyTakeaways('');
    }
  }, [isOpen, defaultCourseId, courses]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) {
      showToast('error', 'Selecciona un curso', 'Debes vincular la sesión a un plan de estudio.');
      return;
    }
    if (!summary.trim()) {
      showToast('error', 'Resumen requerido', 'Escribe brevemente qué tema o ejercicio estudiaste.');
      return;
    }

    const course = courses.find((c) => c.id === selectedCourseId);
    const courseTitle = course ? course.title : 'Estudio General';

    const session: StudySessionLog = {
      id: `session-${Date.now()}`,
      courseId: selectedCourseId,
      courseTitle,
      date,
      minutesSpent: minutes,
      summary: summary.trim(),
      keyTakeaways: keyTakeaways.trim() || undefined,
    };

    const hoursToAdd = Number((minutes / 60).toFixed(1));
    onSaveSession(session, selectedCourseId, hoursToAdd);
    showToast('success', '¡Sesión registrada!', `Se sumaron ${hoursToAdd}h de estudio a "${courseTitle}".`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/80 dark:bg-neutral-850">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-base">
                Registrar Sesión de Estudio
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Lleva un registro preciso de tu tiempo y aprendizajes clave
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
              Curso / Plan de Estudio <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500/50"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.category})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Tiempo Dedicado
              </label>
              <div className="flex items-center gap-1.5">
                {[30, 45, 60, 90, 120].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMinutes(m)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      minutes === m
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-indigo-400'
                    }`}
                  >
                    {m >= 60 ? `${m / 60}h` : `${m}m`}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Fecha
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-neutral-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              ¿Qué temas o ejercicios estudiaste hoy? <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Ej. Revisé el módulo de VPCs públicas/privadas y configuré un NAT Gateway en la consola..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Aprendizaje clave o conclusión para recordar (opcional)
            </label>
            <input
              type="text"
              value={keyTakeaways}
              onChange={(e) => setKeyTakeaways(e.target.value)}
              placeholder="Ej. La tabla de ruteo privada debe apuntar al NAT Gateway para salir a internet."
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Sesión (+{minutes >= 60 ? `${(minutes / 60).toFixed(1)}h` : `${minutes}m`})</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

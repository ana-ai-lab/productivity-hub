import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw, Check, Sparkles, BookOpen } from 'lucide-react';
import { StudyCourse } from '../../types';
import { useToast } from '../Toast';

interface StudyTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: StudyCourse[];
  defaultCourseId?: string;
  onSessionFinished: (courseId: string, minutesCompleted: number) => void;
}

export const StudyTimerModal: React.FC<StudyTimerModalProps> = ({
  isOpen,
  onClose,
  courses,
  defaultCourseId,
  onSessionFinished,
}) => {
  const { showToast } = useToast();
  const [selectedCourseId, setSelectedCourseId] = useState(defaultCourseId || (courses[0]?.id || ''));
  const [totalMinutes, setTotalMinutes] = useState(25);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedCourseId(defaultCourseId || (courses[0]?.id || ''));
      setTimeLeftSeconds(totalMinutes * 60);
      setIsRunning(false);
    }
  }, [isOpen, defaultCourseId, courses]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeftSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            handleCompleted();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, totalMinutes]);

  const handleCompleted = () => {
    showToast('success', '¡Tiempo de estudio concluido!', `Completaste una sesión de ${totalMinutes} minutos.`);
    if (selectedCourseId) {
      onSessionFinished(selectedCourseId, totalMinutes);
    }
    onClose();
  };

  const handleSelectPreset = (mins: number) => {
    setIsRunning(false);
    setTotalMinutes(mins);
    setTimeLeftSeconds(mins * 60);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeftSeconds(totalMinutes * 60);
  };

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const progressPercent = Math.round(((totalMinutes * 60 - timeLeftSeconds) / (totalMinutes * 60)) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col items-center text-center p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 mb-2">
          Modo Enfoque & Pomodoro
        </span>
        <h3 className="font-extrabold text-neutral-900 dark:text-neutral-100 text-lg">
          Temporizador de Estudio
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
          Estudia sin distracciones y acumula horas en tu plan
        </p>

        {/* Course Selector */}
        <div className="w-full mb-6">
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 text-left">
            Vincular al curso:
          </label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-neutral-100"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        {/* Presets */}
        <div className="flex gap-2 mb-6">
          {[15, 25, 45, 60].map((m) => (
            <button
              key={m}
              onClick={() => handleSelectPreset(m)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                totalMinutes === m
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-blue-400'
              }`}
            >
              {m} min
            </button>
          ))}
        </div>

        {/* Big Digital Countdown */}
        <div className="relative w-48 h-48 rounded-full border-4 border-neutral-100 dark:border-neutral-800 flex flex-col items-center justify-center mb-6 shadow-inner">
          <div 
            className="absolute inset-0 rounded-full border-4 border-blue-600 transition-all duration-1000"
            style={{
              clipPath: `inset(0 0 0 0 round 9999px)`,
              opacity: progressPercent > 0 ? 0.9 : 0.2,
            }}
          />
          <div className="text-4xl font-extrabold font-mono tracking-tight text-neutral-900 dark:text-neutral-100">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mt-1">
            {isRunning ? 'Enfoque activo...' : 'En pausa'}
          </span>
        </div>

        {/* Timer Controls */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={handleReset}
            title="Reiniciar"
            className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white shadow-lg transition-all ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5" />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>Iniciar Enfoque</span>
              </>
            )}
          </button>

          <button
            onClick={handleCompleted}
            title="Concluir y guardar tiempo"
            className="p-3 rounded-xl border border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
          >
            <Check className="w-5 h-5" />
          </button>
        </div>

        <p className="text-[11px] text-neutral-400">
          Al terminar el tiempo se registrará automáticamente en tu progreso.
        </p>
      </div>
    </div>
  );
};

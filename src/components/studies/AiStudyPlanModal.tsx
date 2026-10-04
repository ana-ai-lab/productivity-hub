import React, { useState } from 'react';
import { Sparkles, X, BookOpen, Clock, Calendar, Check, AlertCircle } from 'lucide-react';
import { StudyCourse, StudyPlanCategory } from '../../types';
import { aiStudyPlanService } from '../../services/aiStudyPlan';
import { useToast } from '../Toast';

interface AiStudyPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanCreated: (course: StudyCourse) => void;
}

export const AiStudyPlanModal: React.FC<AiStudyPlanModalProps> = ({
  isOpen,
  onClose,
  onPlanCreated,
}) => {
  const { showToast } = useToast();
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState<StudyPlanCategory>('Tecnología');
  const [institution, setInstitution] = useState('');
  const [targetWeeks, setTargetWeeks] = useState(6);
  const [weeklyHours, setWeeklyHours] = useState(5);
  const [goal, setGoal] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      showToast('error', 'Tema requerido', 'Ingresa la materia, tecnología o certificación que deseas estudiar.');
      return;
    }

    setIsGenerating(true);
    try {
      const generated = await aiStudyPlanService.generateCoursePlan({
        topic: topic.trim(),
        category,
        institutionOrPlatform: institution.trim() || 'Autodidacta / En línea',
        targetWeeks,
        weeklyHours,
        goal: goal.trim(),
      });

      const today = new Date();
      const targetDateObj = new Date(today);
      targetDateObj.setDate(today.getDate() + targetWeeks * 7);

      const newCourse: StudyCourse = {
        id: `course-${Date.now()}`,
        title: generated.title || topic.trim(),
        category: generated.category || category,
        institutionOrPlatform: generated.institutionOrPlatform || institution.trim() || 'En línea',
        status: 'Por iniciar',
        startDate: today.toISOString().split('T')[0],
        targetDate: targetDateObj.toISOString().split('T')[0],
        totalEstimatedHours: generated.totalEstimatedHours || (targetWeeks * weeklyHours),
        completedHours: 0,
        notes: generated.notes || `Plan generado para ${topic.trim()} (${targetWeeks} semanas).`,
        color: category === 'Certificación' ? '#F59E0B' : category === 'Tecnología' ? '#3B82F6' : category === 'Universidad' ? '#10B981' : '#8B5CF6',
        resources: (generated.resources || []).map((r, idx) => ({
          id: `res-${Date.now()}-${idx}`,
          title: r.title,
          url: r.url,
        })),
        milestones: (generated.milestones || []).map((m, idx) => {
          const msDate = new Date(today);
          const weeksStep = Math.max(1, Math.floor(targetWeeks / Math.max(1, generated.milestones.length)));
          msDate.setDate(today.getDate() + (idx + 1) * weeksStep * 7);
          return {
            id: `ms-${Date.now()}-${idx}`,
            title: m.title,
            description: m.description,
            completed: false,
            estimatedHours: m.estimatedHours,
            dueDate: msDate.toISOString().split('T')[0],
          };
        }),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      onPlanCreated(newCourse);
      showToast('success', '¡Plan de estudios generado!', `Se han creado ${newCourse.milestones.length} módulos estructurados con IA.`);
      onClose();
    } catch (err: any) {
      console.error('Error generating AI plan:', err);
      showToast('error', 'Error al generar plan', err.message || 'No se pudo generar el plan con IA.');
    } finally {
      setIsGenerating(false);
    }
  };

  const samplePrompts = [
    'Docker y Kubernetes para Desarrollo Cloud',
    'Certificación AWS Cloud Practitioner / Solutions Architect',
    'Estructuras de Datos y Algoritmos en TypeScript',
    'Diseño de Sistemas Distribuidos y Microservicios',
    'Machine Learning y Redes Neuronales con Python',
    'Gestión de Proyectos Ágiles y Scrum Master',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-purple-50/50 dark:from-blue-950/20 dark:via-indigo-950/10 dark:to-purple-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-base">
                Crear Plan de Estudios con IA
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Gemini diseña un temario secuencial con módulos, horas estimadas y recursos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Quick sample chips */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Ideas rápidas o escribe la tuya:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {samplePrompts.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setTopic(p)}
                  className="text-[11px] px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 hover:border-blue-400 text-neutral-600 dark:text-neutral-300 hover:text-blue-600 transition-colors text-left"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Topic Input */}
          <div>
            <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
              ¿Qué materia, certificación o tema deseas planificar? <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ej. Arquitectura Hexagonal y DDD en Node.js"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* Category & Institution */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Categoría
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as StudyPlanCategory)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="Tecnología">Tecnología & Programación</option>
                <option value="Certificación">Certificación Oficial</option>
                <option value="Universidad">Universidad / Posgrado</option>
                <option value="Ciencia de Datos">Ciencia de Datos & IA</option>
                <option value="Negocios">Negocios & Gestión</option>
                <option value="Habilidades Blandas">Habilidades Blandas</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Plataforma o Institución
              </label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="Ej. Coursera, AWS, Udemy, Platzi, Autodidacta"
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>

          {/* Duration & Weekly Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                <span>Semanas objetivo</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="2"
                  max="24"
                  value={targetWeeks}
                  onChange={(e) => setTargetWeeks(Number(e.target.value))}
                  className="flex-1 accent-blue-600"
                />
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 w-12 text-right">
                  {targetWeeks} sem.
                </span>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                <span>Dedicación semanal</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="2"
                  max="25"
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(Number(e.target.value))}
                  className="flex-1 accent-indigo-600"
                />
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 w-12 text-right">
                  {weeklyHours} h/sem
                </span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 italic">
            Total estimado calculado: ~{targetWeeks * weeklyHours} horas de estudio distribuidas en {targetWeeks} semanas.
          </div>

          {/* Goal / Focus */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Objetivo o enfoque particular (opcional)
            </label>
            <textarea
              rows={2}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Ej. Enfocar el plan en preparación para la entrevista técnica final de Senior Engineer..."
              className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              disabled={isGenerating}
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Diseñando temario con IA...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generar Plan Completo</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

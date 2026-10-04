import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, BookOpen, Link, Calendar, Clock, Layers } from 'lucide-react';
import { StudyCourse, StudyPlanCategory, StudyMilestone, StudyResource } from '../../types';
import { useToast } from '../Toast';

interface CourseEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCourse: (course: StudyCourse) => void;
  courseToEdit?: StudyCourse | null;
  onDeleteCourse?: (id: string) => void;
}

export const CourseEditModal: React.FC<CourseEditModalProps> = ({
  isOpen,
  onClose,
  onSaveCourse,
  courseToEdit,
  onDeleteCourse,
}) => {
  const { showToast } = useToast();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<StudyPlanCategory>('Tecnología');
  const [institution, setInstitution] = useState('');
  const [status, setStatus] = useState<StudyCourse['status']>('Por iniciar');
  const [startDate, setStartDate] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [totalEstimatedHours, setTotalEstimatedHours] = useState(20);
  const [completedHours, setCompletedHours] = useState(0);
  const [notes, setNotes] = useState('');
  const [resources, setResources] = useState<StudyResource[]>([]);
  const [milestones, setMilestones] = useState<StudyMilestone[]>([]);

  // New resource inputs
  const [resTitle, setResTitle] = useState('');
  const [resUrl, setResUrl] = useState('');

  // New milestone inputs
  const [msTitle, setMsTitle] = useState('');
  const [msDesc, setMsDesc] = useState('');
  const [msHours, setMsHours] = useState(4);
  const [msDueDate, setMsDueDate] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (courseToEdit) {
        setTitle(courseToEdit.title);
        setCategory(courseToEdit.category);
        setInstitution(courseToEdit.institutionOrPlatform || '');
        setStatus(courseToEdit.status);
        setStartDate(courseToEdit.startDate || '');
        setTargetDate(courseToEdit.targetDate || '');
        setTotalEstimatedHours(courseToEdit.totalEstimatedHours || 20);
        setCompletedHours(courseToEdit.completedHours || 0);
        setNotes(courseToEdit.notes || '');
        setResources(courseToEdit.resources || []);
        setMilestones(courseToEdit.milestones || []);
      } else {
        const today = new Date().toISOString().split('T')[0];
        const nextMonth = new Date();
        nextMonth.setDate(nextMonth.getDate() + 45);
        setTitle('');
        setCategory('Tecnología');
        setInstitution('');
        setStatus('Por iniciar');
        setStartDate(today);
        setTargetDate(nextMonth.toISOString().split('T')[0]);
        setTotalEstimatedHours(25);
        setCompletedHours(0);
        setNotes('');
        setResources([]);
        setMilestones([
          {
            id: `ms-${Date.now()}-1`,
            title: 'Módulo 1: Fundamentos y Entorno',
            description: 'Conceptos base y configuración del entorno de estudio.',
            completed: false,
            estimatedHours: 5,
            dueDate: today,
          },
        ]);
      }
      setResTitle('');
      setResUrl('');
      setMsTitle('');
      setMsDesc('');
      setMsHours(4);
      setMsDueDate('');
    }
  }, [isOpen, courseToEdit]);

  if (!isOpen) return null;

  const handleAddResource = () => {
    if (!resTitle.trim()) return;
    setResources((prev) => [
      ...prev,
      {
        id: `res-${Date.now()}`,
        title: resTitle.trim(),
        url: resUrl.trim() || 'https://google.com',
      },
    ]);
    setResTitle('');
    setResUrl('');
  };

  const handleRemoveResource = (id: string) => {
    setResources((prev) => prev.filter((r) => r.id !== id));
  };

  const handleAddMilestone = () => {
    if (!msTitle.trim()) {
      showToast('error', 'Título requerido', 'Ingresa el nombre del hito o módulo.');
      return;
    }
    const newMs: StudyMilestone = {
      id: `ms-${Date.now()}`,
      title: msTitle.trim(),
      description: msDesc.trim(),
      completed: false,
      estimatedHours: msHours,
      dueDate: msDueDate || undefined,
    };
    setMilestones((prev) => [...prev, newMs]);
    setMsTitle('');
    setMsDesc('');
    setMsHours(4);
    setMsDueDate('');
  };

  const handleRemoveMilestone = (id: string) => {
    setMilestones((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('error', 'Título requerido', 'Por favor ingresa un título para el plan de estudio.');
      return;
    }

    const calculatedHours = milestones.reduce((sum, m) => sum + (m.estimatedHours || 0), 0);

    const saved: StudyCourse = {
      id: courseToEdit ? courseToEdit.id : `course-${Date.now()}`,
      title: title.trim(),
      category,
      institutionOrPlatform: institution.trim() || 'Autodidacta / En línea',
      status,
      startDate: startDate || undefined,
      targetDate: targetDate || undefined,
      totalEstimatedHours: calculatedHours > 0 ? calculatedHours : totalEstimatedHours,
      completedHours,
      notes: notes.trim(),
      resources,
      milestones,
      color: category === 'Certificación' ? '#F59E0B' : category === 'Tecnología' ? '#3B82F6' : category === 'Universidad' ? '#10B981' : '#8B5CF6',
      createdAt: courseToEdit ? courseToEdit.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveCourse(saved);
    showToast('success', courseToEdit ? 'Curso actualizado' : 'Nuevo curso creado con éxito');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/80 dark:bg-neutral-850">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-base">
                {courseToEdit ? 'Editar Plan de Estudio' : 'Nuevo Plan de Estudio / Curso'}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Organiza materias, certificaciones, cursos online o lecturas técnicas
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

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
                Nombre del Plan o Curso <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Certificación Kubernetes CKA o Cálculo III"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
                Categoría
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as StudyPlanCategory)}
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="Tecnología">Tecnología & Software</option>
                <option value="Certificación">Certificación Oficial</option>
                <option value="Universidad">Universidad / Academia</option>
                <option value="Ciencia de Datos">Ciencia de Datos & IA</option>
                <option value="Negocios">Negocios & Gestión</option>
                <option value="Habilidades Blandas">Habilidades Blandas</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>

          {/* Institution & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Plataforma / Institución
              </label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="Ej. Udemy, AWS, Coursera, Universidad"
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Estado
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StudyCourse['status'])}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-neutral-100"
              >
                <option value="Por iniciar">Por iniciar</option>
                <option value="En progreso">En progreso</option>
                <option value="En pausa">En pausa</option>
                <option value="Completado">Completado</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Fecha Meta / Final
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-neutral-100"
              />
            </div>
          </div>

          {/* Hours & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Horas Totales Estimadas
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={totalEstimatedHours}
                onChange={(e) => setTotalEstimatedHours(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Horas Ya Dedicadas
              </label>
              <input
                type="number"
                min="0"
                max="500"
                value={completedHours}
                onChange={(e) => setCompletedHours(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Fecha de Inicio
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-neutral-100"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Notas, Estrategia o Metodología
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Consejos clave, cómo planeas estudiar, días de repaso..."
              className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-neutral-100"
            />
          </div>

          {/* Milestones / Modules Section */}
          <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-500" />
                <span>Módulos o Hitos de Estudio ({milestones.length})</span>
              </h4>
            </div>

            {/* Existing Milestones List */}
            <div className="space-y-2 mb-3">
              {milestones.map((m, idx) => (
                <div
                  key={m.id}
                  className="flex items-start justify-between gap-3 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700/80 bg-neutral-50 dark:bg-neutral-800/40 text-xs"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {idx + 1}. {m.title}
                      </span>
                      <span className="px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-[10px] font-bold">
                        {m.estimatedHours}h
                      </span>
                      {m.dueDate && (
                        <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                          Meta: {m.dueDate}
                        </span>
                      )}
                    </div>
                    {m.description && (
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                        {m.description}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveMilestone(m.id)}
                    className="p-1 text-neutral-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Milestone Form */}
            <div className="p-3 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/30 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <input
                  type="text"
                  placeholder="Título del hito o capítulo"
                  value={msTitle}
                  onChange={(e) => setMsTitle(e.target.value)}
                  className="sm:col-span-2 px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs"
                />
                <input
                  type="number"
                  placeholder="Horas"
                  min="1"
                  max="100"
                  value={msHours}
                  onChange={(e) => setMsHours(Number(e.target.value))}
                  className="px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs"
                />
                <input
                  type="date"
                  value={msDueDate}
                  onChange={(e) => setMsDueDate(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Descripción breve de conceptos a dominar..."
                  value={msDesc}
                  onChange={(e) => setMsDesc(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddMilestone}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-900 text-white dark:bg-neutral-700 dark:hover:bg-neutral-600 text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir Hito</span>
                </button>
              </div>
            </div>
          </div>

          {/* Resources Section */}
          <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-2 flex items-center gap-1.5">
              <Link className="w-4 h-4 text-indigo-500" />
              <span>Enlaces y Recursos de Estudio</span>
            </h4>

            <div className="space-y-1.5 mb-2">
              {resources.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                      {r.title}
                    </span>
                    <span className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate max-w-[200px]">
                      {r.url}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveResource(r.id)}
                    className="p-1 text-neutral-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nombre del recurso (ej. Guía oficial)"
                value={resTitle}
                onChange={(e) => setResTitle(e.target.value)}
                className="w-1/2 px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs"
              />
              <input
                type="url"
                placeholder="https://..."
                value={resUrl}
                onChange={(e) => setResUrl(e.target.value)}
                className="flex-1 px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs"
              />
              <button
                type="button"
                onClick={handleAddResource}
                className="px-3 py-1.5 rounded-lg bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-300 text-xs font-semibold"
              >
                Añadir
              </button>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-2.5">
            {courseToEdit && onDeleteCourse ? (
              <button
                type="button"
                onClick={() => {
                  onDeleteCourse(courseToEdit.id);
                  onClose();
                }}
                className="px-3.5 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Eliminar este plan de estudio"
              >
                <Trash2 className="w-4 h-4" />
                <span>Eliminar Plan</span>
              </button>
            ) : (
              <div />
            )}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
              >
                {courseToEdit ? 'Guardar Cambios' : 'Crear Plan de Estudio'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

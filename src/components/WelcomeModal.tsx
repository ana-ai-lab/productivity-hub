import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Briefcase, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  ListTodo, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  BrainCircuit, 
  X, 
  ChevronRight, 
  Lightbulb, 
  ShieldCheck, 
  Download, 
  Bot,
  PlayCircle
} from 'lucide-react';
import { storage } from '../services/storage';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: 'kanban' | 'english' | 'studies') => void;
  onOpenGoogleGuide?: () => void;
}

type TabType = 'overview' | 'kanban' | 'studies' | 'english' | 'google';

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onOpenGoogleGuide,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, dontShowAgain]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (dontShowAgain) {
      storage.setWelcomeSeen(true);
    }
    onClose();
  };

  const handleNavigateAndClose = (tab: 'kanban' | 'english' | 'studies') => {
    if (dontShowAgain) {
      storage.setWelcomeSeen(true);
    }
    onNavigateTab?.(tab);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto"
      onClick={handleClose}
    >
      <div
        className="bg-white dark:bg-neutral-900 rounded-3xl max-w-4xl w-full my-auto shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-modal-title"
      >
        {/* Modal Top Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-neutral-200/80 dark:border-neutral-800 bg-gradient-to-br from-blue-50/60 via-indigo-50/30 to-purple-50/20 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-850">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2
                    id="welcome-modal-title"
                    className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight"
                  >
                    ¡Bienvenido a Productivity Hub!
                  </h2>
                  <span className="hidden sm:inline text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                    Guía de Inicio
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-0.5">
                  Tu plataforma integral para conseguir tu próximo empleo, estructurar tu aprendizaje y dominar el inglés técnico.
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="Cerrar guía"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sub-Navigation Pills */}
          <div className="flex items-center gap-1.5 sm:gap-2 mt-5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : 'bg-white/80 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-750 border border-neutral-200 dark:border-neutral-700/80'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Visión General</span>
            </button>

            <button
              onClick={() => setActiveTab('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'kanban'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : 'bg-white/80 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-750 border border-neutral-200 dark:border-neutral-700/80'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>1. Empleo (Kanban)</span>
            </button>

            <button
              onClick={() => setActiveTab('studies')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'studies'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : 'bg-white/80 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-750 border border-neutral-200 dark:border-neutral-700/80'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>2. Planes de Estudio</span>
            </button>

            <button
              onClick={() => setActiveTab('english')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'english'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : 'bg-white/80 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-750 border border-neutral-200 dark:border-neutral-700/80'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>3. Inglés con IA</span>
            </button>

            <button
              onClick={() => setActiveTab('google')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'google'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : 'bg-white/80 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-750 border border-neutral-200 dark:border-neutral-700/80'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>4. Google Sync</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-200/60 dark:border-blue-800/40">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-1 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>¿Cómo funciona esta aplicación?</span>
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  Productivity Hub une los tres pilares de tu crecimiento laboral en una sola pantalla: búsqueda de empleo sin estrés, planificación disciplinada de estudios con asistencia de Inteligencia Artificial, y preparación intensiva de inglés para entrevistas de trabajo internacionales.
                </p>
              </div>

              {/* 3 Core Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Module 1 Card */}
                <div
                  onClick={() => setActiveTab('kanban')}
                  className="group p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-850/50 hover:bg-white dark:hover:bg-neutral-800 hover:border-blue-300 dark:hover:border-blue-700/60 transition-all cursor-pointer shadow-xs hover:shadow-md"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 flex items-center justify-between">
                    <span>1. Empleo (Kanban)</span>
                    <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-blue-600 transition-colors" />
                  </h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1.5 leading-relaxed">
                    Visualiza tus postulaciones en columnas, agenda entrevistas en Google Calendar y programa recordatorios en Google Tasks.
                  </p>
                </div>

                {/* Module 2 Card */}
                <div
                  onClick={() => setActiveTab('studies')}
                  className="group p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-850/50 hover:bg-white dark:hover:bg-neutral-800 hover:border-blue-300 dark:hover:border-blue-700/60 transition-all cursor-pointer shadow-xs hover:shadow-md"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 flex items-center justify-between">
                    <span>2. Planes de Estudio</span>
                    <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-indigo-600 transition-colors" />
                  </h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1.5 leading-relaxed">
                    Crea cursos o genéralos con IA (Gemini). Mide tu tiempo con el cronómetro Pomodoro y lleva una bitácora de tus horas.
                  </p>
                </div>

                {/* Module 3 Card */}
                <div
                  onClick={() => setActiveTab('english')}
                  className="group p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-850/50 hover:bg-white dark:hover:bg-neutral-800 hover:border-blue-300 dark:hover:border-blue-700/60 transition-all cursor-pointer shadow-xs hover:shadow-md"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 flex items-center justify-between">
                    <span>3. Inglés con IA</span>
                    <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-purple-600 transition-colors" />
                  </h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1.5 leading-relaxed">
                    Vocabulario técnico con pronunciación IPA y simulador interactivo de preguntas de entrevista con evaluación y corrección con IA.
                  </p>
                </div>
              </div>

              {/* Integration banner */}
              <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-850 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      Sincronización Directa y Respaldo Local
                    </h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Conéctate a Google Workspace para reflejar eventos en tu Calendario. Descarga copias de seguridad de tus datos cuando desees.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('google')}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors whitespace-nowrap shrink-0"
                >
                  Ver configuración
                </button>
              </div>
            </div>
          )}

          {/* TAB: Kanban */}
          {activeTab === 'kanban' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
                    Paso a paso: Gestión de Postulaciones (Tablero Kanban)
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Controla todo tu embudo de entrevistas laborales en un solo lugar.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
                    <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-[11px]">1</span>
                    <span>Registrar una postulación</span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    Haz clic en el botón <strong className="text-neutral-900 dark:text-neutral-200">+ Nueva Postulación</strong> en la esquina superior derecha. Completa empresa, rol, salario esperado, enlace a la vacante y contacto del reclutador.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
                    <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-[11px]">2</span>
                    <span>Mover de columna según tu avance</span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    Arrastra las tarjetas o usa las flechas rápidas para avanzar entre columnas: <em>Por aplicar → Aplicado → Entrevista → Prueba Técnica → Oferta / Rechazo</em>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
                    <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-[11px]">3</span>
                    <span>Agendar en Google Calendar</span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    Pulsa el icono de calendario <Calendar className="inline w-3.5 h-3.5 text-blue-500 mx-0.5" /> en cualquier tarjeta para seleccionar fecha, hora y enlace de videollamada. Se creará automáticamente un evento en tu Google Calendar.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
                    <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-[11px]">4</span>
                    <span>Sincronizar tareas pendientes</span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    Usa el icono de lista <ListTodo className="inline w-3.5 h-3.5 text-indigo-500 mx-0.5" /> para enviar un recordatorio directo a tu lista de Google Tasks y no olvidar preparar la entrevista.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => handleNavigateAndClose('kanban')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <span>Ir al Tablero de Empleo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB: Studies */}
          {activeTab === 'studies' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
                    Paso a paso: Planes de Estudio y Certificaciones
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Estructura tus horas de aprendizaje, mantén disciplina y genera rutas con IA.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    <Bot className="w-4 h-4" />
                    <span>Generador de Planes con IA</span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    Pulsa <strong className="text-neutral-900 dark:text-neutral-200">Generar Plan con IA</strong>, escribe el tema (ej: <em>Docker y Kubernetes, AWS Solutions Architect, React Avanzado</em>) y Gemini generará los módulos, semanas, horas e hitos ideales.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    <Clock className="w-4 h-4" />
                    <span>Cronómetro Pomodoro de Estudio</span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    Haz clic en <strong className="text-neutral-900 dark:text-neutral-200">Iniciar Cronómetro</strong> para entrar en modo enfoque. Al terminar tu sesión, el tiempo se registra automáticamente en tu bitácora de horas.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Checklist de Hitos y Objetivos</span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    Marca los hitos a medida que los completes. El porcentaje de progreso se actualizará en tiempo real y podrás sincronizar cualquier hito con Google Tasks.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    <Calendar className="w-4 h-4" />
                    <span>Agendar Sesiones de Estudio</span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    Bloquea tiempo en tu Google Calendar para estudiar cada módulo sin distracciones mediante el botón de agendamiento.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => handleNavigateAndClose('studies')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <span>Ir a Planes de Estudio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB: English */}
          {activeTab === 'english' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
                    Paso a paso: Módulo de Inglés Profesional con IA
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Prepárate para entrevistas laborales internacionales en inglés.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400">
                    <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-[11px]">1</span>
                    <span>Tarjetas de Vocabulario Clave</span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    Consulta términos técnicos esenciales (ej: <em>Trade-off, Scalability, Deadlock, Bottleneck</em>) con transcripción fonética IPA, definición en español y oraciones de ejemplo de ingeniería. Puedes añadir tus propios términos.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400">
                    <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-[11px]">2</span>
                    <span>Generador de Preguntas de Entrevista</span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    Genera preguntas reales de entrevistas (behavioral y técnicas) con Gemini AI según tu nivel y temática preferida (Frontend, Backend, System Design, etc.).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400">
                    <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-[11px]">3</span>
                    <span>Evaluación y Feedback Inteligente</span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    Escribe tu respuesta en inglés y haz clic en <strong className="text-neutral-900 dark:text-neutral-200">Evaluar Respuesta</strong>. La IA te calificará de 0 a 100 y te dará correcciones gramaticales y una versión mejorada de nivel nativo.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400">
                    <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-[11px]">4</span>
                    <span>Sesiones de Práctica en Calendar</span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    Agenda tus bloques de práctica diaria de conversación e inglés en Google Calendar directamente desde los temas de estudio.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => handleNavigateAndClose('english')}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <span>Ir a Inglés Profesional</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB: Google Sync & Backup */}
          {activeTab === 'google' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
                    Integración con Google Workspace y Respaldo
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Conecta tus herramientas habituales para no perder ninguna cita.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 flex items-center justify-center shrink-0 mt-0.5">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      Google Calendar
                    </h4>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                      Programa entrevistas laborales con enlace de Meet/Teams y sesiones de estudio de 30, 45 o 60 minutos con recordatorio emergente de 15 minutos en tu calendario personal o de trabajo.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 flex items-center justify-center shrink-0 mt-0.5">
                    <ListTodo className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      Google Tasks
                    </h4>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                      Sincroniza tareas de seguimiento de vacantes (enviar CV, agradecer tras la llamada) e hitos de cursos técnicos directamente en la lista "Productivity Hub" de Google Tasks.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950 flex items-center justify-center shrink-0 mt-0.5">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      Exportar / Importar Copias de Seguridad
                    </h4>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                      En la barra superior encontrarás los botones para descargar un archivo JSON con todas tus postulaciones, vocabulario y cursos, o restaurarlo en cualquier computadora.
                    </p>
                  </div>
                </div>
              </div>

              {onOpenGoogleGuide && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      handleClose();
                      onOpenGoogleGuide();
                    }}
                    className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <span>Configurar Google Client ID</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 sm:p-5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-600 dark:text-neutral-400 select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800"
            />
            <span>No volver a mostrar automáticamente</span>
          </label>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleClose}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
            >
              <span>¡Entendido, comenzar!</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

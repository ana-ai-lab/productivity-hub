import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  Plus, 
  Search, 
  Volume2, 
  Calendar, 
  ListTodo, 
  Clock, 
  TrendingUp, 
  Check, 
  X, 
  RefreshCw, 
  Send, 
  HelpCircle, 
  Award, 
  BookMarked,
  Trash2,
  Filter
} from 'lucide-react';
import { EnglishExercise, StudyTopic, VocabularyItem } from '../types';
import { aiEnglishService } from '../services/aiEnglish';
import { googleWorkspace } from '../services/googleWorkspace';
import { useToast } from './Toast';
import { ScheduleModal } from './ScheduleModal';
import { ConfirmDialog } from './ConfirmDialog';

interface EnglishStudyModuleProps {
  vocabulary: VocabularyItem[];
  topics: StudyTopic[];
  onUpdateVocabulary: (vocab: VocabularyItem[]) => void;
  onUpdateTopics: (topics: StudyTopic[]) => void;
}

export const EnglishStudyModule: React.FC<EnglishStudyModuleProps> = ({
  vocabulary,
  topics,
  onUpdateVocabulary,
  onUpdateTopics,
}) => {
  const { showToast } = useToast();

  // Active sub-tab
  const [subTab, setSubTab] = useState<'exercises' | 'vocabulary' | 'topics'>('exercises');

  // AI Exercises state
  const [exercises, setExercises] = useState<EnglishExercise[]>([]);
  const [isGeneratingExercises, setIsGeneratingExercises] = useState(false);
  const [exerciseTopic, setExerciseTopic] = useState('Inglés para entrevistas técnicas y reuniones');
  const [exerciseDifficulty, setExerciseDifficulty] = useState('intermedio');
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [evaluatingId, setEvaluatingId] = useState<string | null>(null);

  // Vocabulary state
  const [vocabSearch, setVocabSearch] = useState('');
  const [vocabFilter, setVocabFilter] = useState<'all' | 'learning' | 'learned'>('all');
  const [isAddVocabModalOpen, setIsAddVocabModalOpen] = useState(false);
  const [newTerm, setNewTerm] = useState('');
  const [newMeaning, setNewMeaning] = useState('');
  const [newPartOfSpeech, setNewPartOfSpeech] = useState<VocabularyItem['partOfSpeech']>('noun');
  const [newExample, setNewExample] = useState('');
  const [newPronunciation, setNewPronunciation] = useState('');
  const [newTag, setNewTag] = useState('Técnico');
  const [vocabToDelete, setVocabToDelete] = useState<VocabularyItem | null>(null);

  // Study Topics & Calendar state
  const [scheduleTopicTarget, setScheduleTopicTarget] = useState<StudyTopic | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicCategory, setNewTopicCategory] = useState<StudyTopic['category']>('Gramática');
  const [newTopicHours, setNewTopicHours] = useState(3);
  const [newTopicDesc, setNewTopicDesc] = useState('');
  const [isAddTopicOpen, setIsAddTopicOpen] = useState(false);
  const [syncingTopicId, setSyncingTopicId] = useState<string | null>(null);

  // Initial exercises load if empty
  useEffect(() => {
    if (exercises.length === 0) {
      handleGenerateDailyExercises();
    }
  }, []);

  // Text-To-Speech for vocabulary
  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } else {
      showToast('info', 'TTS no soportado', 'Tu navegador no soporta síntesis de voz.');
    }
  };

  // ==========================================
  // AI EXERCISES LOGIC
  // ==========================================
  const handleGenerateDailyExercises = async () => {
    setIsGeneratingExercises(true);
    try {
      const generated = await aiEnglishService.generateDailyExercises(exerciseTopic, exerciseDifficulty);
      setExercises(generated);
      setUserAnswers({});
      showToast(
        'success',
        '¡5 Ejercicios Diarios Listos!',
        'Generados con IA y contextualizados para tu perfil profesional.'
      );
    } catch (err: any) {
      showToast('error', 'Error generando ejercicios', err.message);
    } finally {
      setIsGeneratingExercises(false);
    }
  };

  const handleEvaluateAnswer = async (exercise: EnglishExercise) => {
    const answer = userAnswers[exercise.id] || '';
    if (!answer.trim()) {
      showToast('info', 'Escribe una respuesta', 'Por favor ingresa tu respuesta antes de evaluar.');
      return;
    }

    setEvaluatingId(exercise.id);
    try {
      const evaluation = await aiEnglishService.evaluateAnswer(exercise, answer);
      const updatedExercises = exercises.map((ex) =>
        ex.id === exercise.id
          ? {
              ...ex,
              userAnswer: answer,
              isSubmitted: true,
              evaluation,
            }
          : ex
      );
      setExercises(updatedExercises);
      if (evaluation.isCorrect) {
        showToast('success', `¡Correcto! Puntuación: ${evaluation.score}/100`, evaluation.feedback);
      } else {
        showToast('info', `Feedback: ${evaluation.score}/100`, evaluation.feedback);
      }
    } catch (err: any) {
      showToast('error', 'Error al evaluar', err.message);
    } finally {
      setEvaluatingId(null);
    }
  };

  // ==========================================
  // VOCABULARY LOGIC
  // ==========================================
  const handleAddVocabulary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTerm.trim() || !newMeaning.trim()) {
      showToast('error', 'Campos requeridos', 'El término y el significado son obligatorios.');
      return;
    }

    const newItem: VocabularyItem = {
      id: `vocab-${Date.now()}`,
      term: newTerm.trim(),
      meaning: newMeaning.trim(),
      partOfSpeech: newPartOfSpeech,
      exampleSentence: newExample.trim() || undefined,
      pronunciation: newPronunciation.trim() || undefined,
      tags: newTag ? [newTag] : ['General'],
      learned: false,
      dateAdded: new Date().toISOString().split('T')[0],
    };

    onUpdateVocabulary([newItem, ...vocabulary]);
    showToast('success', 'Palabra agregada', `"${newItem.term}" añadida a tu vocabulario.`);
    setIsAddVocabModalOpen(false);
    setNewTerm('');
    setNewMeaning('');
    setNewExample('');
    setNewPronunciation('');
  };

  const handleToggleLearned = (id: string) => {
    const updated = vocabulary.map((v) => (v.id === id ? { ...v, learned: !v.learned } : v));
    onUpdateVocabulary(updated);
    const item = updated.find((v) => v.id === id);
    if (item) {
      showToast(
        'info',
        item.learned ? 'Marcada como aprendida 🎉' : 'Regresada a repaso',
        `"${item.term}"`
      );
    }
  };

  const handleConfirmDeleteVocab = () => {
    if (!vocabToDelete) return;
    const updated = vocabulary.filter((v) => v.id !== vocabToDelete.id);
    onUpdateVocabulary(updated);
    showToast('info', 'Palabra eliminada', `"${vocabToDelete.term}" fue removida.`);
    setVocabToDelete(null);
  };

  const filteredVocabulary = vocabulary.filter((v) => {
    const matchesSearch =
      v.term.toLowerCase().includes(vocabSearch.toLowerCase()) ||
      v.meaning.toLowerCase().includes(vocabSearch.toLowerCase()) ||
      (v.exampleSentence && v.exampleSentence.toLowerCase().includes(vocabSearch.toLowerCase()));

    if (vocabFilter === 'learning') return matchesSearch && !v.learned;
    if (vocabFilter === 'learned') return matchesSearch && v.learned;
    return matchesSearch;
  });

  // ==========================================
  // STUDY TOPICS & PROGRESS LOGIC
  // ==========================================
  const handleToggleTopicComplete = (id: string) => {
    const updated = topics.map((t) => {
      if (t.id === id) {
        const nextState = !t.completed;
        return {
          ...t,
          completed: nextState,
          completedAt: nextState ? new Date().toISOString().split('T')[0] : undefined,
        };
      }
      return t;
    });
    onUpdateTopics(updated);
  };

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim()) return;

    const newTopic: StudyTopic = {
      id: `topic-${Date.now()}`,
      title: newTopicTitle.trim(),
      category: newTopicCategory,
      description: newTopicDesc.trim() || 'Estudio intensivo y práctica de conversación.',
      estimatedHours: newTopicHours || 2,
      completed: false,
      targetDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    };

    onUpdateTopics([...topics, newTopic]);
    setIsAddTopicOpen(false);
    setNewTopicTitle('');
    setNewTopicDesc('');
    showToast('success', 'Tema añadido', `"${newTopic.title}" añadido a tu plan de estudio.`);
  };

  const handleSyncTopicToTasks = async (topic: StudyTopic) => {
    if (!googleWorkspace.isConnected()) {
      showToast('info', 'Conectando con Google...', 'Se requiere autorización para Google Tasks.');
      try {
        await googleWorkspace.login();
      } catch (err: any) {
        showToast('error', 'Fallo de autenticación', err.message);
        return;
      }
    }

    setSyncingTopicId(topic.id);
    try {
      const res = await googleWorkspace.syncTopicToGoogleTasks(topic);
      const updated = topics.map((t) =>
        t.id === topic.id ? { ...t, syncedToGoogleTasks: true, googleTaskId: res.id } : t
      );
      onUpdateTopics(updated);
      showToast(
        'success',
        '¡Tarea de estudio creada en Google Tasks!',
        `Se agregó "${topic.title}" a tu lista de Google Tasks.`
      );
    } catch (err: any) {
      showToast('error', 'Error al sincronizar con Tasks', err.message);
    } finally {
      setSyncingTopicId(null);
    }
  };

  const handleScheduleStudyBlock = (topic: StudyTopic) => {
    setScheduleTopicTarget(topic);
    setIsScheduleModalOpen(true);
  };

  // Metrics
  const completedTopicsCount = topics.filter((t) => t.completed).length;
  const progressPercent = topics.length > 0 ? Math.round((completedTopicsCount / topics.length) * 100) : 0;
  const totalHours = topics.reduce((acc, curr) => acc + (curr.estimatedHours || 0), 0);
  const completedHours = topics
    .filter((t) => t.completed)
    .reduce((acc, curr) => acc + (curr.estimatedHours || 0), 0);

  const submittedExercises = exercises.filter((e) => e.isSubmitted);
  const correctExercisesCount = submittedExercises.filter((e) => e.evaluation?.isCorrect).length;

  return (
    <div id="english-study-module" className="space-y-6">
      {/* Module Navigation Sub-Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <span>Plan de Estudios e Inglés Profesional</span>
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Domina el inglés laboral con ejercicios generados por IA, banco de vocabulario y bloques de estudio en Google Calendar.
          </p>
        </div>

        {/* Sub-tab pills */}
        <div className="flex items-center p-1 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800">
          <button
            id="subtab-exercises-btn"
            onClick={() => setSubTab('exercises')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              subTab === 'exercises'
                ? 'bg-white dark:bg-neutral-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>5 Ejercicios de IA</span>
            {submittedExercises.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                {submittedExercises.length}/5
              </span>
            )}
          </button>

          <button
            id="subtab-vocabulary-btn"
            onClick={() => setSubTab('vocabulary')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              subTab === 'vocabulary'
                ? 'bg-white dark:bg-neutral-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span>Vocabulario</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300">
              {vocabulary.length}
            </span>
          </button>

          <button
            id="subtab-topics-btn"
            onClick={() => setSubTab('topics')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              subTab === 'topics'
                ? 'bg-white dark:bg-neutral-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Progreso de Temas</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {progressPercent}%
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. SECCIÓN DE EJERCICIOS DIARIOS CON IA                                   */}
      {/* ========================================================================= */}
      {subTab === 'exercises' && (
        <div id="ai-exercises-subview" className="space-y-6 animate-in fade-in">
          {/* Controls Card */}
          <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-base">
                    Generador de 5 Ejercicios Diarios de Inglés
                  </h3>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Practica gramática, colocaciones y traducción al inglés enfocado en entrevistas de trabajo y ambiente laboral con feedback inteligente.
                </p>
              </div>

              {/* Regenerate Button */}
              <button
                id="regenerate-exercises-btn"
                onClick={handleGenerateDailyExercises}
                disabled={isGeneratingExercises}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingExercises ? 'animate-spin' : ''}`} />
                <span>{isGeneratingExercises ? 'Generando con Gemini...' : 'Generar Nuevos 5 Ejercicios'}</span>
              </button>
            </div>

            {/* Filters / Topic selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs">
              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-medium">
                  Área de enfoque / Tema
                </label>
                <select
                  id="select-exercise-topic"
                  value={exerciseTopic}
                  onChange={(e) => setExerciseTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                >
                  <option value="Inglés para entrevistas técnicas y reuniones">
                    Entrevistas Técnicas y Standups
                  </option>
                  <option value="Gramática: Tiempos verbales pasados y perfectos">
                    Gramática: Tiempos Pasados y Perfectos
                  </option>
                  <option value="Phrasal Verbs de oficina y negocios">
                    Phrasal Verbs de Trabajo
                  </option>
                  <option value="Traducción de logros y método STAR">
                    Método STAR y Logros Laborales
                  </option>
                  <option value="Negociación salarial y correos profesionales">
                    Negociación y Emails Formales
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-medium">
                  Nivel de Dificultad
                </label>
                <select
                  id="select-exercise-difficulty"
                  value={exerciseDifficulty}
                  onChange={(e) => setExerciseDifficulty(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                >
                  <option value="principiante">B1 - Intermedio Inicial</option>
                  <option value="intermedio">B2 - Intermedio Profesional (Recomendado)</option>
                  <option value="avanzado">C1 - Avanzado / Fluidez Nativa</option>
                </select>
              </div>

              <div className="flex flex-col justify-end">
                <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60 flex items-center justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400">Progreso del día:</span>
                  <span className="font-bold text-neutral-900 dark:text-neutral-100">
                    {submittedExercises.length}/5 resueltos ({correctExercisesCount} correctos)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Exercise Cards */}
          <div className="space-y-4">
            {exercises.map((exercise, index) => {
              const currentAnswer = userAnswers[exercise.id] || '';
              const isSubmitted = exercise.isSubmitted;
              const isEvaluating = evaluatingId === exercise.id;
              const evaluation = exercise.evaluation;

              return (
                <div
                  key={exercise.id}
                  id={`exercise-card-${exercise.id}`}
                  className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4"
                >
                  {/* Card Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-bold text-xs flex items-center justify-center">
                        {index + 1}
                      </span>
                      <h4 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                        {exercise.title}
                      </h4>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                        {exercise.category}
                      </span>
                    </div>

                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      {exercise.type === 'grammar'
                        ? 'Gramática'
                        : exercise.type === 'translation'
                        ? 'Traducción'
                        : exercise.type === 'multiple_choice'
                        ? 'Opción Múltiple'
                        : 'Corrección'}
                    </span>
                  </div>

                  {/* Question prompt */}
                  <div className="space-y-1 text-sm">
                    <p className="font-medium text-neutral-900 dark:text-neutral-100 leading-relaxed">
                      {exercise.question}
                    </p>
                    {exercise.promptTranslation && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 italic">
                        {exercise.promptTranslation}
                      </p>
                    )}
                  </div>

                  {/* Multiple Choice Options if available */}
                  {exercise.options && exercise.options.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {exercise.options.map((opt) => {
                        const isSelected = currentAnswer.trim() === opt.trim();
                        return (
                          <button
                            key={opt}
                            type="button"
                            disabled={isSubmitted}
                            onClick={() => setUserAnswers((prev) => ({ ...prev, [exercise.id]: opt }))}
                            className={`px-3.5 py-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                              isSelected
                                ? 'border-purple-600 bg-purple-50 text-purple-900 dark:bg-purple-950/60 dark:text-purple-200 dark:border-purple-500'
                                : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Text Input Area (if not multiple choice or flexible) */}
                  {(!exercise.options || exercise.options.length === 0) && (
                    <div className="relative">
                      <input
                        id={`input-exercise-answer-${exercise.id}`}
                        type="text"
                        disabled={isSubmitted}
                        value={currentAnswer}
                        onChange={(e) =>
                          setUserAnswers((prev) => ({ ...prev, [exercise.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !isSubmitted) {
                            handleEvaluateAnswer(exercise);
                          }
                        }}
                        placeholder="Escribe tu respuesta en inglés aquí..."
                        className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 disabled:opacity-75"
                      />
                    </div>
                  )}

                  {/* Action row & Evaluation result */}
                  <div className="flex flex-col gap-3 pt-1">
                    {!isSubmitted ? (
                      <div className="flex items-center justify-end">
                        <button
                          id={`evaluate-btn-${exercise.id}`}
                          disabled={isEvaluating || !currentAnswer.trim()}
                          onClick={() => handleEvaluateAnswer(exercise)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors"
                        >
                          {isEvaluating ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Evaluando con IA...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              <span>Comprobar con IA</span>
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      /* Evaluation Output Box */
                      <div
                        id={`evaluation-box-${exercise.id}`}
                        className={`p-4 rounded-xl border text-xs space-y-2.5 ${
                          evaluation?.isCorrect
                            ? 'bg-emerald-50/70 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100'
                            : 'bg-amber-50/70 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 text-amber-950 dark:text-amber-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-bold">
                            {evaluation?.isCorrect ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            )}
                            <span>{evaluation?.isCorrect ? '¡Respuesta Correcta!' : 'Oportunidad de Mejora'}</span>
                          </div>
                          <span className="font-bold px-2 py-0.5 rounded-full bg-white dark:bg-neutral-900 border border-current">
                            {evaluation?.score || 0} / 100 pts
                          </span>
                        </div>

                        <p className="leading-relaxed">{evaluation?.feedback}</p>

                        {evaluation?.correctedVersion && (
                          <div className="p-2.5 rounded-lg bg-white/80 dark:bg-neutral-900/80 border border-neutral-200/60 dark:border-neutral-800 space-y-1">
                            <span className="font-semibold text-[11px] text-neutral-500 uppercase tracking-wider block">
                              Versión recomendada en inglés:
                            </span>
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium text-neutral-900 dark:text-neutral-100 text-xs">
                                {evaluation.correctedVersion}
                              </span>
                              <button
                                onClick={() => handleSpeak(evaluation.correctedVersion || '')}
                                title="Escuchar pronunciación"
                                className="p-1 hover:text-purple-600 rounded text-neutral-500 shrink-0"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}

                        {evaluation?.tips && (
                          <p className="text-[11px] opacity-90 italic">
                            💡 Tip: {evaluation.tips}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SECCIÓN DE VOCABULARIO DINÁMICO                                        */}
      {/* ========================================================================= */}
      {subTab === 'vocabulary' && (
        <div id="vocabulary-subview" className="space-y-6 animate-in fade-in">
          {/* Top Bar for Vocab */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-72">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                <input
                  id="input-search-vocabulary"
                  type="text"
                  value={vocabSearch}
                  onChange={(e) => setVocabSearch(e.target.value)}
                  placeholder="Buscar palabra o significado..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Filter pills */}
              <div className="flex items-center rounded-xl p-1 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs">
                <button
                  onClick={() => setVocabFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    vocabFilter === 'all'
                      ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs'
                      : 'text-neutral-500'
                  }`}
                >
                  Todas ({vocabulary.length})
                </button>
                <button
                  onClick={() => setVocabFilter('learning')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    vocabFilter === 'learning'
                      ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs'
                      : 'text-neutral-500'
                  }`}
                >
                  En estudio ({vocabulary.filter((v) => !v.learned).length})
                </button>
                <button
                  onClick={() => setVocabFilter('learned')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    vocabFilter === 'learned'
                      ? 'bg-white dark:bg-neutral-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-neutral-500'
                  }`}
                >
                  Aprendidas ({vocabulary.filter((v) => v.learned).length})
                </button>
              </div>
            </div>

            <button
              id="open-add-vocab-modal-btn"
              onClick={() => setIsAddVocabModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Palabra</span>
            </button>
          </div>

          {/* Word Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVocabulary.length === 0 ? (
              <div className="col-span-full p-12 text-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl">
                <p className="text-sm text-neutral-500">No se encontraron palabras en este filtro.</p>
              </div>
            ) : (
              filteredVocabulary.map((item) => (
                <div
                  key={item.id}
                  id={`vocab-item-${item.id}`}
                  className={`p-4 rounded-2xl border transition-all space-y-3 bg-white dark:bg-neutral-900 shadow-xs ${
                    item.learned
                      ? 'border-emerald-200 dark:border-emerald-900/60'
                      : 'border-neutral-200 dark:border-neutral-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-neutral-900 dark:text-neutral-100 text-base">
                          {item.term}
                        </h4>
                        <button
                          onClick={() => handleSpeak(item.term)}
                          title="Escuchar pronunciación"
                          className="p-1 text-neutral-400 hover:text-blue-600 rounded"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {item.pronunciation && (
                        <p className="text-[11px] font-mono text-neutral-400">{item.pronunciation}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-semibold">
                        {item.partOfSpeech}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setVocabToDelete(item);
                        }}
                        title="Eliminar palabra"
                        className="p-1 text-neutral-400 hover:text-rose-600 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Meaning in Spanish */}
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed font-medium">
                    {item.meaning}
                  </p>

                  {/* Example sentence */}
                  {item.exampleSentence && (
                    <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 space-y-1 text-xs">
                      <p className="text-neutral-800 dark:text-neutral-200 italic">
                        "{item.exampleSentence}"
                      </p>
                      {item.exampleTranslation && (
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                          {item.exampleTranslation}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Footer & Toggle learned */}
                  <div className="flex items-center justify-between pt-1 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                    <span className="text-[11px] text-neutral-400">
                      {item.tags?.join(', ') || 'General'}
                    </span>
                    <button
                      id={`toggle-learned-btn-${item.id}`}
                      onClick={() => handleToggleLearned(item.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                        item.learned
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      <Check className="w-3 h-3" />
                      <span>{item.learned ? 'Aprendida' : 'Marcar aprendida'}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Vocabulary Modal */}
          {isAddVocabModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
              <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
                  <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-base">
                    Añadir Palabra al Vocabulario
                  </h3>
                  <button
                    onClick={() => setIsAddVocabModalOpen(false)}
                    className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleAddVocabulary} className="p-6 space-y-3.5 text-xs">
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
                      Palabra o Frase en Inglés *
                    </label>
                    <input
                      id="input-new-vocab-term"
                      type="text"
                      required
                      value={newTerm}
                      onChange={(e) => setNewTerm(e.target.value)}
                      placeholder="Ej. Trade-off, Seamless, Standup"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-neutral-100"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
                        Tipo de palabra
                      </label>
                      <select
                        value={newPartOfSpeech}
                        onChange={(e) => setNewPartOfSpeech(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                      >
                        <option value="noun">Sustantivo (noun)</option>
                        <option value="verb">Verbo (verb)</option>
                        <option value="adjective">Adjetivo (adjective)</option>
                        <option value="adverb">Adverbio (adverb)</option>
                        <option value="phrase">Frase (phrase)</option>
                        <option value="idiom">Modismo (idiom)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
                        Categoría / Tag
                      </label>
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Ej. Técnico, Entrevistas"
                        className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
                      Significado en Español *
                    </label>
                    <textarea
                      id="input-new-vocab-meaning"
                      required
                      rows={2}
                      value={newMeaning}
                      onChange={(e) => setNewMeaning(e.target.value)}
                      placeholder="Explicación clara y concisa en español..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-neutral-100 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
                      Oración de Ejemplo (en inglés)
                    </label>
                    <input
                      type="text"
                      value={newExample}
                      onChange={(e) => setNewExample(e.target.value)}
                      placeholder="Ej. We made a trade-off between speed and memory."
                      className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                    <button
                      type="button"
                      onClick={() => setIsAddVocabModalOpen(false)}
                      className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      id="submit-new-vocab-btn"
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
                    >
                      Guardar Palabra
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SECCIÓN DE PROGRESO VISUAL DE TEMAS ESTUDIADOS Y AGENDA                */}
      {/* ========================================================================= */}
      {subTab === 'topics' && (
        <div id="topics-progress-subview" className="space-y-6 animate-in fade-in">
          {/* Progress Overview Metrics Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Metric 1: % Progress */}
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg shrink-0 border-4 border-blue-500/20">
                {progressPercent}%
              </div>
              <div>
                <p className="text-xs text-neutral-500 font-medium">Progreso Global de Estudio</p>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  {completedTopicsCount} de {topics.length} temas
                </h3>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                  {topics.length - completedTopicsCount} temas pendientes
                </p>
              </div>
            </div>

            {/* Metric 2: Horas Estimadas */}
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-neutral-500 font-medium">Horas de Estudio</p>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  {completedHours} / {totalHours} horas
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Bloques sugeridos de 60-90 min
                </p>
              </div>
            </div>

            {/* Metric 3: Workspace Sync State */}
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-neutral-500 font-medium">Sincronización Workspace</p>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Google Calendar & Tasks
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Agenda sesiones y crea recordatorios
                </p>
              </div>
              <button
                id="open-add-topic-modal-btn"
                onClick={() => setIsAddTopicOpen(true)}
                className="p-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors shrink-0"
                title="Añadir nuevo tema de estudio"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Visual Progress Bar */}
          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-neutral-700 dark:text-neutral-300">Curva de avance del plan de estudio</span>
              <span className="text-blue-600 dark:text-blue-400">{progressPercent}% completado</span>
            </div>
            <div className="w-full h-3 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Topics List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Temas del Plan de Estudios
              </h3>
              <button
                onClick={() => setIsAddTopicOpen(true)}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar tema</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {topics.map((topic) => (
                <div
                  key={topic.id}
                  id={`topic-card-${topic.id}`}
                  className={`p-4 rounded-2xl border transition-all space-y-3 bg-white dark:bg-neutral-900 shadow-xs ${
                    topic.completed
                      ? 'border-emerald-200 dark:border-emerald-900/60'
                      : 'border-neutral-200 dark:border-neutral-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        id={`check-topic-${topic.id}`}
                        onClick={() => handleToggleTopicComplete(topic.id)}
                        title={topic.completed ? 'Marcar pendiente' : 'Marcar completado'}
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center mt-0.5 transition-colors shrink-0 ${
                          topic.completed
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-400'
                        }`}
                      >
                        {topic.completed && <Check className="w-3.5 h-3.5" />}
                      </button>
                      <div>
                        <h4
                          className={`font-bold text-sm leading-snug ${
                            topic.completed
                              ? 'line-through text-neutral-400 dark:text-neutral-500'
                              : 'text-neutral-900 dark:text-neutral-100'
                          }`}
                        >
                          {topic.title}
                        </h4>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 mt-1 inline-block">
                          {topic.category}
                        </span>
                      </div>
                    </div>

                    <span className="text-[11px] font-medium text-neutral-400 whitespace-nowrap flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" />
                      <span>{topic.estimatedHours}h</span>
                    </span>
                  </div>

                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed pl-8">
                    {topic.description}
                  </p>

                  {/* Actions: Agendar en Calendar & Sincronizar en Tasks */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800 pl-8 text-xs">
                    {/* Tasks sync */}
                    {topic.syncedToGoogleTasks ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>En Google Tasks</span>
                      </span>
                    ) : (
                      <button
                        id={`sync-topic-tasks-${topic.id}`}
                        disabled={syncingTopicId === topic.id}
                        onClick={() => handleSyncTopicToTasks(topic)}
                        className="inline-flex items-center gap-1 text-neutral-600 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 text-[11px] font-semibold transition-colors"
                      >
                        <ListTodo className="w-3.5 h-3.5" />
                        <span>{syncingTopicId === topic.id ? 'Sincronizando...' : 'Crear en Google Tasks'}</span>
                      </button>
                    )}

                    {/* Calendar Schedule */}
                    <button
                      id={`schedule-topic-cal-${topic.id}`}
                      onClick={() => handleScheduleStudyBlock(topic)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-600 dark:text-blue-400 text-[11px] font-semibold transition-colors"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Agendar Bloque en Calendar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Topic Modal */}
          {isAddTopicOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
              <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
                  <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-base">
                    Añadir Tema al Plan de Estudio
                  </h3>
                  <button
                    onClick={() => setIsAddTopicOpen(false)}
                    className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleAddTopic} className="p-6 space-y-3.5 text-xs">
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
                      Título del Tema *
                    </label>
                    <input
                      type="text"
                      required
                      value={newTopicTitle}
                      onChange={(e) => setNewTopicTitle(e.target.value)}
                      placeholder="Ej. Condicionales Mixtos en Negociaciones"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-neutral-100"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
                        Categoría
                      </label>
                      <select
                        value={newTopicCategory}
                        onChange={(e) => setNewTopicCategory(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                      >
                        <option value="Gramática">Gramática</option>
                        <option value="Vocabulario Técnico">Vocabulario Técnico</option>
                        <option value="Entrevistas de Trabajo">Entrevistas de Trabajo</option>
                        <option value="Conversación">Conversación</option>
                        <option value="Escritura Profesional">Escritura Profesional</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
                        Horas estimadas
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={40}
                        value={newTopicHours}
                        onChange={(e) => setNewTopicHours(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
                      Descripción
                    </label>
                    <textarea
                      rows={2}
                      value={newTopicDesc}
                      onChange={(e) => setNewTopicDesc(e.target.value)}
                      placeholder="Objetivos de aprendizaje y conceptos clave..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-neutral-100 resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                    <button
                      type="button"
                      onClick={() => setIsAddTopicOpen(false)}
                      className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
                    >
                      Guardar Tema
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Schedule Topic Modal */}
          {isScheduleModalOpen && (
            <ScheduleModal
              isOpen={isScheduleModalOpen}
              onClose={() => {
                setIsScheduleModalOpen(false);
                setScheduleTopicTarget(null);
              }}
              defaultTitle={
                scheduleTopicTarget
                  ? `Estudio de Inglés: ${scheduleTopicTarget.title}`
                  : 'Bloque de Estudio de Inglés'
              }
              defaultDescription={
                scheduleTopicTarget
                  ? `Tema: ${scheduleTopicTarget.title}\nCategoría: ${scheduleTopicTarget.category}\nDescripción: ${scheduleTopicTarget.description}`
                  : ''
              }
              defaultDuration={60}
              onEventScheduled={(eventId) => {
                if (scheduleTopicTarget) {
                  const updated = topics.map((t) =>
                    t.id === scheduleTopicTarget.id
                      ? { ...t, scheduledCalendarEventId: eventId }
                      : t
                  );
                  onUpdateTopics(updated);
                }
              }}
            />
          )}

          {/* Confirm Delete Vocabulary Modal */}
          <ConfirmDialog
            isOpen={Boolean(vocabToDelete)}
            onClose={() => setVocabToDelete(null)}
            onConfirm={handleConfirmDeleteVocab}
            title="¿Eliminar término?"
            message={
              vocabToDelete
                ? `¿Deseas eliminar la palabra o expresión "${vocabToDelete.term}" de tu vocabulario?`
                : ''
            }
            confirmLabel="Eliminar término"
          />
        </div>
      )}
    </div>
  );
};

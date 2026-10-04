export type JobStatus = 
  | 'Por aplicar' 
  | 'Aplicado' 
  | 'Entrevista' 
  | 'Prueba Técnica' 
  | 'Oferta/Rechazo';

export interface JobApplication {
  id: string;
  company: string;
  position: string;
  applicationDate: string; // YYYY-MM-DD
  vacancyUrl: string;
  notes: string;
  status: JobStatus;
  salary?: string;
  location?: string;
  contactPerson?: string;
  interviewDate?: string; // YYYY-MM-DD
  interviewTime?: string; // HH:mm
  syncedToGoogleTasks?: boolean;
  googleTaskId?: string;
  googleTaskListId?: string;
  syncedToGoogleCalendar?: boolean;
  googleCalendarEventId?: string;
  googleCalendarEventLink?: string;
  createdAt: string;
  updatedAt: string;
}

export type ExerciseType = 'grammar' | 'translation' | 'sentence_correction' | 'multiple_choice';

export interface EnglishExercise {
  id: string;
  type: ExerciseType;
  title: string;
  question: string;
  promptTranslation?: string;
  options?: string[]; // For multiple choice
  correctAnswer?: string;
  explanation?: string;
  category: string; // e.g., 'Present Perfect', 'Phrasal Verbs', 'Technical English'
  userAnswer?: string;
  isSubmitted?: boolean;
  evaluation?: {
    isCorrect: boolean;
    score: number; // 0 - 100
    feedback: string;
    correctedVersion?: string;
    tips?: string;
  };
}

export interface VocabularyItem {
  id: string;
  term: string;
  meaning: string;
  partOfSpeech: 'noun' | 'verb' | 'adjective' | 'adverb' | 'phrase' | 'idiom';
  exampleSentence?: string;
  exampleTranslation?: string;
  pronunciation?: string;
  tags?: string[];
  learned: boolean;
  dateAdded: string;
}

export interface StudyTopic {
  id: string;
  title: string;
  category: 'Gramática' | 'Vocabulario Técnico' | 'Entrevistas de Trabajo' | 'Conversación' | 'Escritura Profesional';
  description: string;
  estimatedHours: number;
  completed: boolean;
  completedAt?: string;
  targetDate?: string;
  syncedToGoogleTasks?: boolean;
  googleTaskId?: string;
  scheduledCalendarEventId?: string;
}

export interface GoogleAuthStatus {
  isConnected: boolean;
  accessToken: string | null;
  expiresAt: number | null;
  clientId: string;
  userEmail?: string;
  userName?: string;
  userPicture?: string;
}

export interface CalendarEventPayload {
  title: string;
  description: string;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  durationMinutes: number;
  location?: string;
}

export interface TaskPayload {
  title: string;
  notes?: string;
  dueDate?: string; // YYYY-MM-DD
  listName?: string;
}

export type StudyPlanCategory = 
  | 'Tecnología' 
  | 'Certificación' 
  | 'Universidad' 
  | 'Negocios' 
  | 'Ciencia de Datos' 
  | 'Habilidades Blandas' 
  | 'Otro';

export interface StudyMilestone {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  completedAt?: string;
  estimatedHours: number;
  dueDate?: string;
  syncedToGoogleTasks?: boolean;
  googleTaskId?: string;
  scheduledCalendarEventId?: string;
}

export interface StudyResource {
  id: string;
  title: string;
  url: string;
}

export interface StudyCourse {
  id: string;
  title: string;
  category: StudyPlanCategory;
  institutionOrPlatform: string;
  status: 'Por iniciar' | 'En progreso' | 'En pausa' | 'Completado';
  startDate?: string;
  targetDate?: string;
  totalEstimatedHours: number;
  completedHours: number;
  notes: string;
  resources: StudyResource[];
  milestones: StudyMilestone[];
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudySessionLog {
  id: string;
  courseId: string;
  courseTitle: string;
  date: string; // YYYY-MM-DD
  minutesSpent: number;
  summary: string;
  keyTakeaways?: string;
}

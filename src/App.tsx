import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { KanbanBoard } from './components/KanbanBoard';
import { EnglishStudyModule } from './components/EnglishStudyModule';
import { GeneralStudyModule } from './components/GeneralStudyModule';
import { GoogleCloudGuideModal } from './components/GoogleCloudGuideModal';
import { WelcomeModal } from './components/WelcomeModal';
import { ToastProvider } from './components/Toast';
import { storage } from './services/storage';
import { googleWorkspace } from './services/googleWorkspace';
import { GoogleAuthStatus, JobApplication, StudyTopic, VocabularyItem, StudyCourse, StudySessionLog } from './types';
import { ExternalLink, Key, ShieldCheck, Heart, HelpCircle } from 'lucide-react';

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => storage.getTheme());
  const [activeTab, setActiveTab] = useState<'kanban' | 'english' | 'studies' | 'guide'>('kanban');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(() => !storage.hasSeenWelcome());

  // Application Data States
  const [jobs, setJobs] = useState<JobApplication[]>(() => storage.getJobs());
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>(() => storage.getVocabulary());
  const [topics, setTopics] = useState<StudyTopic[]>(() => storage.getTopics());
  const [courses, setCourses] = useState<StudyCourse[]>(() => storage.getCourses());
  const [studySessions, setStudySessions] = useState<StudySessionLog[]>(() => storage.getStudySessions());

  // Google OAuth Connection State
  const [googleStatus, setGoogleStatus] = useState<GoogleAuthStatus>(() => googleWorkspace.getStatus());

  // Subscribe to Google Workspace status changes
  useEffect(() => {
    const unsubscribe = googleWorkspace.subscribe((status) => {
      setGoogleStatus(status);
    });
    return () => unsubscribe();
  }, []);

  // Sync theme with HTML document
  useEffect(() => {
    storage.saveTheme(theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Persist jobs on change
  const handleUpdateJobs = (newJobs: JobApplication[]) => {
    setJobs(newJobs);
    storage.saveJobs(newJobs);
  };

  // Persist vocabulary on change
  const handleUpdateVocabulary = (newVocab: VocabularyItem[]) => {
    setVocabulary(newVocab);
    storage.saveVocabulary(newVocab);
  };

  // Persist topics on change
  const handleUpdateTopics = (newTopics: StudyTopic[]) => {
    setTopics(newTopics);
    storage.saveTopics(newTopics);
  };

  // Persist courses on change
  const handleUpdateCourses = (newCourses: StudyCourse[]) => {
    setCourses(newCourses);
    storage.saveCourses(newCourses);
  };

  // Persist study sessions on change
  const handleUpdateStudySessions = (newSessions: StudySessionLog[]) => {
    setStudySessions(newSessions);
    storage.saveStudySessions(newSessions);
  };

  // Reload data when imported
  const handleDataImported = () => {
    setJobs(storage.getJobs());
    setVocabulary(storage.getVocabulary());
    setTopics(storage.getTopics());
    setCourses(storage.getCourses());
    setStudySessions(storage.getStudySessions());
  };

  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-500 ease-in-out">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          theme={theme}
          setTheme={setTheme}
          googleStatus={googleStatus}
          onOpenGuide={() => setIsGuideOpen(true)}
          onOpenWelcome={() => setIsWelcomeOpen(true)}
          onDataImported={handleDataImported}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === 'kanban' && (
            <KanbanBoard
              jobs={jobs}
              onUpdateJobs={handleUpdateJobs}
            />
          )}

          {activeTab === 'studies' && (
            <GeneralStudyModule
              courses={courses}
              studySessions={studySessions}
              onUpdateCourses={handleUpdateCourses}
              onUpdateStudySessions={handleUpdateStudySessions}
            />
          )}

          {activeTab === 'english' && (
            <EnglishStudyModule
              vocabulary={vocabulary}
              topics={topics}
              onUpdateVocabulary={handleUpdateVocabulary}
              onUpdateTopics={handleUpdateTopics}
            />
          )}
        </main>

        {/* Welcome & How-To Guide Modal */}
        <WelcomeModal
          isOpen={isWelcomeOpen}
          onClose={() => setIsWelcomeOpen(false)}
          onNavigateTab={(tab) => setActiveTab(tab)}
          onOpenGoogleGuide={() => setIsGuideOpen(true)}
        />

        {/* Google Cloud Guide & Credentials Modal */}
        <GoogleCloudGuideModal
          isOpen={isGuideOpen}
          onClose={() => setIsGuideOpen(false)}
        />

        {/* Footer */}
        <footer className="border-t border-neutral-200/80 dark:border-neutral-800/80 py-6 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-neutral-900/50 text-xs text-neutral-500 dark:text-neutral-400">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                Productivity Hub
              </span>
              <span>•</span>
              <span>Integración Google Calendar & Tasks</span>
              <span>•</span>
              <span>IA con Gemini 2.5 Flash</span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsWelcomeOpen(true)}
                className="hover:text-blue-600 dark:hover:text-blue-400 font-medium flex items-center gap-1 transition-colors"
                title="Cómo usar la aplicación"
              >
                <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
                <span>Cómo usar</span>
              </button>
              <button
                onClick={() => setIsGuideOpen(true)}
                className="hover:text-blue-600 dark:hover:text-blue-400 font-medium flex items-center gap-1 transition-colors"
              >
                <Key className="w-3.5 h-3.5 text-amber-500" />
                <span>Credenciales Google Cloud</span>
              </button>
              <a
                href="https://console.cloud.google.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-neutral-900 dark:hover:text-neutral-200 flex items-center gap-1 transition-colors"
              >
                <span>Google Cloud Console</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </footer>
      </div>
    </ToastProvider>
  );
}

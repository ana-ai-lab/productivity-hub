import React, { useState } from 'react';
import { 
  Briefcase, 
  BookOpen, 
  GraduationCap,
  Calendar, 
  ListTodo, 
  Sun, 
  Moon, 
  LogOut, 
  Download, 
  Upload, 
  Key, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Menu,
  X,
  HelpCircle
} from 'lucide-react';
import { GoogleAuthStatus } from '../types';
import { googleWorkspace } from '../services/googleWorkspace';
import { storage } from '../services/storage';
import { useToast } from './Toast';

interface HeaderProps {
  activeTab: 'kanban' | 'english' | 'studies' | 'guide';
  setActiveTab: (tab: 'kanban' | 'english' | 'studies' | 'guide') => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  googleStatus: GoogleAuthStatus;
  onOpenGuide: () => void;
  onOpenWelcome: () => void;
  onDataImported: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  theme,
  setTheme,
  googleStatus,
  onOpenGuide,
  onOpenWelcome,
  onDataImported,
}) => {
  const { showToast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleGoogleConnect = async () => {
    setIsConnecting(true);
    try {
      await googleWorkspace.login();
      showToast(
        'success',
        '¡Google Workspace Conectado!',
        'Ahora puedes sincronizar eventos con Google Calendar y tareas con Google Tasks.'
      );
    } catch (err: any) {
      console.error('Google connect error:', err);
      showToast(
        'error',
        'Error al conectar',
        err.message || 'Verifica que tu Client ID esté configurado y que tu origen esté autorizado.'
      );
    } finally {
      setIsConnecting(false);
    }
  };

  const handleGoogleDisconnect = () => {
    googleWorkspace.logout();
    showToast('info', 'Sesión cerrada', 'Se ha revocado la conexión con Google Workspace.');
  };

  const handleExportData = () => {
    const json = storage.exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `productivity-hub-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Copia de seguridad descargada');
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = storage.importAllData(content);
      if (success) {
        showToast('success', 'Datos restaurados con éxito');
        onDataImported();
      } else {
        showToast('error', 'Error al importar', 'El formato del archivo no es válido.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header
      id="app-main-header"
      className="sticky top-0 z-40 w-full border-b border-neutral-200/80 dark:border-neutral-800/80 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md transition-colors duration-500 ease-in-out"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 transition-transform duration-300 hover:scale-105">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-neutral-900 dark:text-neutral-100 text-lg leading-tight tracking-tight transition-colors duration-500">
                  Productivity Hub
                </h1>
                <span className="hidden sm:inline text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 transition-colors duration-500">
                  Workspace Ready
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-neutral-500 dark:text-neutral-400 transition-colors duration-500">
                Kanban de Empleo • Estudios & Certificaciones • Inglés con IA • Sincronización Google
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700/60 transition-colors duration-500 ease-in-out">
            <button
              id="nav-tab-kanban"
              onClick={() => setActiveTab('kanban')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'kanban'
                  ? 'bg-white dark:bg-neutral-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Búsqueda de Empleo</span>
            </button>

            <button
              id="nav-tab-studies"
              onClick={() => setActiveTab('studies')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'studies'
                  ? 'bg-white dark:bg-neutral-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Plan de Estudios</span>
            </button>

            <button
              id="nav-tab-english"
              onClick={() => setActiveTab('english')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'english'
                  ? 'bg-white dark:bg-neutral-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Inglés Profesional</span>
            </button>

            <button
              id="nav-tab-welcome"
              onClick={onOpenWelcome}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50/80 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-all border border-blue-200/60 dark:border-blue-800/40"
              title="Cómo usar la aplicación (Guía y Bienvenida)"
            >
              <HelpCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Cómo usar</span>
            </button>

            <button
              id="nav-tab-guide"
              onClick={onOpenGuide}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-all"
            >
              <Key className="w-3.5 h-3.5 text-amber-500" />
              <span>Google Cloud</span>
            </button>
          </nav>

          {/* Actions: Google Auth, Theme, Backup */}
          <div className="flex items-center gap-2">
            {/* Google Workspace Connection Badge / Button */}
            {googleStatus.isConnected ? (
              <div
                id="google-connected-pill"
                className="flex items-center gap-2 p-1 pl-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-[11px] hidden sm:inline max-w-[130px] truncate">
                  {googleStatus.userEmail || 'Google Conectado'}
                </span>
                <span className="sm:hidden font-semibold text-[11px]">Google</span>
                <button
                  id="disconnect-google-btn"
                  onClick={handleGoogleDisconnect}
                  title="Desconectar Google Workspace"
                  className="p-1 text-neutral-400 hover:text-rose-600 rounded-lg transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                id="connect-google-btn"
                disabled={isConnecting}
                onClick={handleGoogleConnect}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-750 text-neutral-800 dark:text-neutral-200 text-xs font-semibold shadow-xs transition-all"
              >
                {isConnecting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span>Conectando...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                    <span>Conectar Google</span>
                  </>
                )}
              </button>
            )}

            {/* Backup / Export */}
            <button
              id="export-data-btn"
              onClick={handleExportData}
              title="Descargar copia de seguridad (JSON)"
              className="p-2 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-300"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Backup / Import hidden file input */}
            <label
              id="import-data-label"
              title="Restaurar copia de seguridad (JSON)"
              className="p-2 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-300 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
            </label>

            {/* Theme Toggle with smooth transition animation */}
            <button
              id="theme-toggle-btn"
              type="button"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              title={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
              aria-label={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
              className="relative p-2 w-9 h-9 flex items-center justify-center text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 active:scale-90 transition-all duration-300 overflow-hidden cursor-pointer"
            >
              <Moon
                className={`w-4 h-4 text-neutral-600 dark:text-neutral-400 transition-all duration-500 ease-in-out transform ${
                  theme === 'light'
                    ? 'rotate-0 scale-100 opacity-100'
                    : '-rotate-90 scale-0 opacity-0 pointer-events-none'
                }`}
              />
              <Sun
                className={`w-4 h-4 text-amber-400 absolute transition-all duration-500 ease-in-out transform ${
                  theme === 'dark'
                    ? 'rotate-0 scale-100 opacity-100'
                    : 'rotate-90 scale-0 opacity-0 pointer-events-none'
                }`}
              />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-neutral-600 dark:text-neutral-300 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-300"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-neutral-200 dark:border-neutral-800 flex flex-col gap-2 transition-colors duration-500 ease-in-out">
            <button
              onClick={() => {
                setActiveTab('kanban');
                setIsMobileMenuOpen(false);
              }}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold ${
                activeTab === 'kanban'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Búsqueda de Empleo (Kanban)</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('studies');
                setIsMobileMenuOpen(false);
              }}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold ${
                activeTab === 'studies'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Plan de Estudios & Certificaciones</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('english');
                setIsMobileMenuOpen(false);
              }}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold ${
                activeTab === 'english'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Inglés Profesional</span>
            </button>
            <button
              onClick={() => {
                onOpenWelcome();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50/70 dark:bg-blue-950/50"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Cómo usar la aplicación (Guía)</span>
            </button>
            <button
              onClick={() => {
                onOpenGuide();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400"
            >
              <Key className="w-4 h-4 text-amber-500" />
              <span>Guía Google Cloud & Credenciales</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

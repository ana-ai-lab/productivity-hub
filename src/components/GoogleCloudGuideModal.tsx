import React, { useState, useEffect } from 'react';
import { 
  Key, 
  ExternalLink, 
  Copy, 
  Check, 
  ShieldCheck, 
  X, 
  CheckCircle2, 
  Globe, 
  Calendar, 
  ListTodo, 
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { storage } from '../services/storage';
import { googleWorkspace } from '../services/googleWorkspace';
import { useToast } from './Toast';

interface GoogleCloudGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleCloudGuideModal: React.FC<GoogleCloudGuideModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useToast();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [clientIdInput, setClientIdInput] = useState('');
  const [currentResolvedClientId, setCurrentResolvedClientId] = useState('');
  const [activeTab, setActiveTab] = useState<'guide' | 'settings'>('guide');

  useEffect(() => {
    if (isOpen) {
      googleWorkspace.getClientId().then((id) => {
        setCurrentResolvedClientId(id);
        setClientIdInput(storage.getCustomClientId() || id);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    showToast('info', 'Copiado al portapapeles', text);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSaveClientId = () => {
    storage.saveCustomClientId(clientIdInput.trim());
    setCurrentResolvedClientId(clientIdInput.trim());
    showToast(
      'success',
      'Client ID guardado',
      'El nuevo ID de cliente de Google OAuth se utilizará para autenticación.'
    );
  };

  const handleResetClientId = async () => {
    storage.saveCustomClientId('');
    const defaultId = await googleWorkspace.getClientId();
    setClientIdInput(defaultId);
    setCurrentResolvedClientId(defaultId);
    showToast('info', 'Restaurado', 'Se ha restablecido al Client ID preconfigurado.');
  };

  const originUrl = window.location.origin;

  return (
    <div
      id="google-cloud-guide-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in"
    >
      <div
        id="google-cloud-guide-content"
        className="w-full max-w-3xl max-h-[90vh] flex flex-col bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                Guía de Configuración: Google Cloud & Credenciales
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Aprende a habilitar Calendar API, Tasks API y obtener tu Client ID y API Key
              </p>
            </div>
          </div>
          <button
            id="close-guide-modal-btn"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800 px-6 bg-neutral-50/30 dark:bg-neutral-900/30">
          <button
            id="guide-tab-tutorial"
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'guide'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Paso a Paso en Google Cloud Console
          </button>
          <button
            id="guide-tab-credentials"
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'settings'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Mi Client ID & Estado
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-neutral-700 dark:text-neutral-300">
          {activeTab === 'guide' ? (
            <div className="space-y-6">
              {/* Introduction Card */}
              <div className="p-4 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-950 dark:text-blue-200 text-sm">
                      Integración Segura con OAuth 2.0 Client-Side
                    </h3>
                    <p className="text-xs text-blue-900/90 dark:text-blue-300/90 mt-1 leading-relaxed">
                      Esta aplicación utiliza el estándar moderno <strong>Google Identity Services (GSI)</strong> para obtener un token temporal directamente en tu navegador con tu consentimiento explícito. Nunca expones secretos de cliente en el cliente ni se almacenan credenciales sensibles sin encriptar.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 1 */}
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  <h4 className="font-bold text-neutral-900 dark:text-neutral-100">
                    Crear o Seleccionar un Proyecto en Google Cloud
                  </h4>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 pl-8">
                  Ingresa a Google Cloud Console y crea un proyecto nuevo (ej. <em>"Productivity-Hub-App"</em>) o selecciona uno existente.
                </p>
                <div className="pl-8 pt-1">
                  <a
                    href="https://console.cloud.google.com/projectcreate"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <span>Abrir Google Cloud Console</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  <h4 className="font-bold text-neutral-900 dark:text-neutral-100">
                    Habilitar las APIs de Google Workspace
                  </h4>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 pl-8">
                  En el menú de navegación, ve a <strong>APIs & Services &gt; Library</strong> y habilita las siguientes dos APIs:
                </p>
                <div className="pl-8 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/60 flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100">Google Calendar API</p>
                      <p className="text-[11px] text-neutral-500">Para agendar entrevistas y bloques de estudio</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/60 flex items-center gap-2.5">
                    <ListTodo className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100">Google Tasks API</p>
                      <p className="text-[11px] text-neutral-500">Para crear tareas automáticas del Kanban y estudio</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-xs font-bold flex items-center justify-center">
                    3
                  </span>
                  <h4 className="font-bold text-neutral-900 dark:text-neutral-100">
                    Configurar Pantalla de Consentimiento OAuth (Consent Screen)
                  </h4>
                </div>
                <div className="pl-8 space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
                  <p>1. Ve a <strong>APIs & Services &gt; OAuth consent screen</strong>.</p>
                  <p>2. Selecciona Tipo de Usuario: <strong>Externo</strong> (External) o Interno si tienes Google Workspace empresarial.</p>
                  <p>3. Llena el nombre de la app (ej. <em>Productivity Hub</em>) y tu correo de soporte.</p>
                  <p>4. En el paso <strong>Scopes (Permisos)</strong>, haz clic en "Add or Remove Scopes" y busca:</p>
                  <div className="p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 font-mono text-[11px] text-neutral-800 dark:text-neutral-200 space-y-1">
                    <div>https://www.googleapis.com/auth/calendar.events</div>
                    <div>https://www.googleapis.com/auth/tasks</div>
                  </div>
                  <p>5. En <strong>Test users (Usuarios de prueba)</strong>: añade tu correo de Gmail (ej. <em>tu_correo@gmail.com</em>) para poder autorizar la app en modo desarrollo.</p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-xs font-bold flex items-center justify-center">
                    4
                  </span>
                  <h4 className="font-bold text-neutral-900 dark:text-neutral-100">
                    Crear Credencial OAuth 2.0 Client ID
                  </h4>
                </div>
                <div className="pl-8 space-y-2.5 text-xs text-neutral-600 dark:text-neutral-400">
                  <p>1. Ve a <strong>APIs & Services &gt; Credentials &gt; Create Credentials &gt; OAuth client ID</strong>.</p>
                  <p>2. Tipo de aplicación: <strong>Web application</strong> (Aplicación Web).</p>
                  <p>3. En <strong>Authorized JavaScript origins (Orígenes de JavaScript autorizados)</strong>, debes agregar la URL exacta donde corre la app:</p>
                  <div className="flex items-center gap-2">
                    <code className="px-2.5 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 font-mono text-xs text-blue-600 dark:text-blue-400 border border-neutral-200 dark:border-neutral-700 select-all">
                      {originUrl}
                    </code>
                    <button
                      onClick={() => handleCopy(originUrl, 1)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium"
                    >
                      {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copiar Origen</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    * Si ejecutas la app localmente con Vite, también agrega: <code className="font-mono">http://localhost:3000</code> y <code className="font-mono">http://localhost:5173</code>.
                  </p>
                  <p>4. Haz clic en <strong>Create</strong> y copia tu <strong>Client ID</strong> (termina en <em>.apps.googleusercontent.com</em>).</p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-xs font-bold flex items-center justify-center">
                    5
                  </span>
                  <h4 className="font-bold text-neutral-900 dark:text-neutral-100">
                    (Opcional) API Key de Google Cloud
                  </h4>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 pl-8">
                  Para APIs públicas de solo lectura o descubrimiento, puedes crear una API Key en <strong>Credentials &gt; Create Credentials &gt; API key</strong> y restringirla a las APIs de Calendar y Tasks. Para crear eventos y tareas privadas de tu cuenta, el Client ID con OAuth2 es el método principal requerido.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Credentials Settings Card */}
              <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 space-y-4">
                <div>
                  <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-base">
                    Configuración de Google OAuth Client ID
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Puedes utilizar el Client ID integrado en este entorno o ingresar tu propio Client ID personalizado de Google Cloud.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                    Client ID Activo
                  </label>
                  <input
                    id="input-custom-client-id"
                    type="text"
                    value={clientIdInput}
                    onChange={(e) => setClientIdInput(e.target.value)}
                    placeholder="Ej. 1234567890-abcdef.apps.googleusercontent.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 font-mono text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex flex-wrap gap-2.5 pt-2">
                  <button
                    id="save-custom-client-id-btn"
                    onClick={handleSaveClientId}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
                  >
                    Guardar y Aplicar
                  </button>
                  <button
                    id="reset-client-id-btn"
                    onClick={handleResetClientId}
                    className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium transition-colors"
                  >
                    Restablecer al predeterminado
                  </button>
                </div>
              </div>

              {/* Status card */}
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/60 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">
                  Estado de los Servicios
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                    <p className="text-[11px] text-neutral-500">Google OAuth</p>
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Configurado</span>
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                    <p className="text-[11px] text-neutral-500">Google Calendar & Tasks</p>
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5" />
                      <span>APIs Listas</span>
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                    <p className="text-[11px] text-neutral-500">IA de Ejercicios y Planes</p>
                    <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mt-1 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>gemini-3.8-flash</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            ¿Dudas? Todo el código de sincronización está en <code className="font-mono text-neutral-700 dark:text-neutral-300">src/services/googleWorkspace.ts</code>
          </p>
          <button
            id="guide-modal-finish-btn"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-white text-white dark:text-neutral-900 text-xs font-semibold shadow-sm transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

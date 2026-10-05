# 🚀 Productivity Hub

Plataforma integral orientada a optimizar el crecimiento profesional y la gestión técnica, desarrollada como proyecto práctico bajo arquitectura *local-first* e integrada con **Google Gemini AI**.

🔗 **Demo en vivo (Vercel):** [https://productivity-hub-cyan.vercel.app](https://productivity-hub-cyan.vercel.app)

---

## 📌 Módulos Principales

1. **Tablero Kanban de Empleo:** Gestión visual del embudo de contratación y seguimiento de postulaciones con estados configurables y bandas salariales.
2. **Planes de Estudio y Certificaciones:** Roadmaps técnicos asistidos por IA, temporizador de enfoque Pomodoro y control de horas invertidas.
3. **Simulador de Inglés Profesional (Gemini AI):** Entrenador interactivo para situaciones laborales técnicas (Daily Standups, blockers, entrevistas) con corrección y feedback en tiempo real.

---

## ☁️ Integración con Google Cloud & Workspace

La plataforma cuenta con un diseño modular preparado para sincronización con **Google Calendar** y **Google Tasks**:

* **Modo Demo (*Local-First*):** Para facilitar la prueba inmediata sin fricción y preservar la privacidad de los evaluadores, la versión web desplegada opera de forma 100% autónoma en el navegador (`localStorage`), permitiendo exportar e importar copias de seguridad en formato JSON sin requerir permisos de cuentas personales.
* **Flujo OAuth 2.0 (Diseño de Arquitectura):** Los componentes de UI y servicios están estructurados para conectarse directamente a un proyecto propio de Google Cloud Platform (GCP) mediante `Google Calendar API` y `Google Tasks API`, registrando un `OAuth Client ID` y pantalla de consentimiento correspondiente.

---

## 🛠️ Stack Tecnológico

* **Frontend:** React, TypeScript, Vite, Tailwind CSS.
* **Inteligencia Artificial:** Google Gemini API (`@google/genai`).
* **Despliegue e Infraestructura:** Vercel, Git / GitHub.
* **Persistencia:** LocalStorage & JSON Backup Engine.

---

## ⚙️ Configuración Local

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/ana-ai-lab/productivity-hub.git
   cd productivity-hub
2. Instalar dependencias:
   ```bash
   npm install
4. Variables de entorno (.env.local):
   ```env
   VITE_GEMINI_API_KEY=tu_api_key_aqui
6. Iniciar la aplicación:
   ```bash
   npm run dev

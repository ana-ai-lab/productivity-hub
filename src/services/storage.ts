import { JobApplication, VocabularyItem, StudyTopic, EnglishExercise, StudyCourse, StudySessionLog } from '../types';

const STORAGE_KEYS = {
  JOBS: 'productivity_hub_jobs_v1',
  VOCABULARY: 'productivity_hub_vocabulary_v1',
  TOPICS: 'productivity_hub_topics_v1',
  EXERCISES: 'productivity_hub_exercises_v1',
  COURSES: 'productivity_hub_courses_v1',
  STUDY_SESSIONS: 'productivity_hub_study_sessions_v1',
  GOOGLE_AUTH: 'productivity_hub_google_auth_v1',
  THEME: 'productivity_hub_theme_v1',
  CUSTOM_CLIENT_ID: 'productivity_hub_custom_client_id_v1',
  WELCOME_SEEN: 'productivity_hub_welcome_seen_v1',
};

const INITIAL_JOBS: JobApplication[] = [
  {
    id: 'job-1',
    company: 'Stripe',
    position: 'Senior Full Stack Engineer',
    applicationDate: '2026-09-12',
    vacancyUrl: 'https://stripe.com/jobs',
    notes: 'Revisar documentación de Connect API y Webhooks antes de la llamada con el reclutador.',
    status: 'Por aplicar',
    salary: '$110,000 - $130,000 USD / año',
    location: 'Remoto (Global)',
    contactPerson: 'Sarah Jenkins (Talent Acquisition)',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'job-2',
    company: 'Mercado Libre',
    position: 'Tech Lead Frontend (React / TypeScript)',
    applicationDate: '2026-09-08',
    vacancyUrl: 'https://careers.mercadolibre.com',
    notes: 'Aplicación enviada con CV en inglés actualizado y portfolio en GitHub.',
    status: 'Aplicado',
    salary: '$80,000 - $95,000 USD / año',
    location: 'Remoto (LATAM)',
    syncedToGoogleTasks: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'job-3',
    company: 'Shopify',
    position: 'Senior Software Engineer - Core Platform',
    applicationDate: '2026-09-02',
    vacancyUrl: 'https://shopify.com/careers',
    notes: 'Entrevista técnica de arquitectura de sistemas y diseño de APIs concurrentes.',
    status: 'Entrevista',
    interviewDate: '2026-09-22',
    interviewTime: '15:00',
    salary: '$120,000 - $145,000 USD / año',
    location: 'Remoto',
    contactPerson: 'David Chen (Engineering Manager)',
    syncedToGoogleCalendar: true,
    syncedToGoogleTasks: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'job-4',
    company: 'Automattic',
    position: 'JavaScript Core Developer',
    applicationDate: '2026-08-28',
    vacancyUrl: 'https://automattic.com/work-with-us',
    notes: 'Enviaron ejercicio de código para resolver en 48 horas. Enfocado en performance y accesibilidad.',
    status: 'Prueba Técnica',
    interviewDate: '2026-09-18',
    interviewTime: '18:00',
    salary: '$95,000 - $115,000 USD / año',
    location: '100% Remoto Asíncrono',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'job-5',
    company: 'Vercel',
    position: 'Developer Experience Engineer',
    applicationDate: '2026-08-15',
    vacancyUrl: 'https://vercel.com/careers',
    notes: 'Avanzado a la ronda final. Esperando propuesta formal de compensación.',
    status: 'Oferta/Rechazo',
    salary: '$125,000 - $150,000 USD / año + Equity',
    location: 'Remoto',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const INITIAL_VOCABULARY: VocabularyItem[] = [
  {
    id: 'vocab-1',
    term: 'Trade-off',
    meaning: 'Compromiso o balance entre dos alternativas opuestas (ganar una ventaja sacrificando otra).',
    partOfSpeech: 'noun',
    exampleSentence: 'Every architectural decision involves a trade-off between latency and consistency.',
    exampleTranslation: 'Cada decisión arquitectónica implica un balance entre latencia y consistencia.',
    pronunciation: '/ˈtreɪd.ɒf/',
    tags: ['Arquitectura', 'Entrevistas'],
    learned: true,
    dateAdded: '2026-09-01',
  },
  {
    id: 'vocab-2',
    term: 'Bottleneck',
    meaning: 'Cuello de botella; punto donde el flujo de un proceso se ralentiza o congestiona.',
    partOfSpeech: 'noun',
    exampleSentence: 'Database queries were the primary bottleneck causing high response times.',
    exampleTranslation: 'Las consultas a la base de datos eran el principal cuello de botella que causaba altos tiempos de respuesta.',
    pronunciation: '/ˈbɒt.əl.nek/',
    tags: ['Performance', 'Técnico'],
    learned: true,
    dateAdded: '2026-09-02',
  },
  {
    id: 'vocab-3',
    term: 'Seamless',
    meaning: 'Fluido, sin fricción ni interrupciones perceptibles.',
    partOfSpeech: 'adjective',
    exampleSentence: 'We integrated the payment gateway to provide a seamless checkout experience.',
    exampleTranslation: 'Integramos la pasarela de pagos para brindar una experiencia de compra fluida.',
    pronunciation: '/ˈsiːm.ləs/',
    tags: ['UX/UI', 'Negocios'],
    learned: false,
    dateAdded: '2026-09-05',
  },
  {
    id: 'vocab-4',
    term: 'Leverage',
    meaning: 'Aprovechar al máximo una herramienta, recurso o conocimiento para obtener resultados.',
    partOfSpeech: 'verb',
    exampleSentence: 'We can leverage serverless functions to scale efficiently under peak traffic.',
    exampleTranslation: 'Podemos aprovechar las funciones serverless para escalar eficientemente durante picos de tráfico.',
    pronunciation: '/ˈliː.vər.ɪdʒ/',
    tags: ['Liderazgo', 'Negocios'],
    learned: false,
    dateAdded: '2026-09-07',
  },
  {
    id: 'vocab-5',
    term: 'Stakeholder',
    meaning: 'Parte interesada o involucrada en un proyecto (clientes, directivos, equipo).',
    partOfSpeech: 'noun',
    exampleSentence: 'I regularly align with key stakeholders to prioritize the product backlog.',
    exampleTranslation: 'Me alineo regularmente con los interesados clave para priorizar el backlog del producto.',
    pronunciation: '/ˈsteɪkˌhəʊl.dər/',
    tags: ['Gestión', 'Entrevistas'],
    learned: true,
    dateAdded: '2026-09-09',
  },
  {
    id: 'vocab-6',
    term: 'Feasible',
    meaning: 'Factible, viable de realizar con los recursos y tiempo disponibles.',
    partOfSpeech: 'adjective',
    exampleSentence: 'Migrating the entire legacy codebase within this quarter is not technically feasible.',
    exampleTranslation: 'Migrar todo el código heredado en este trimestre no es técnicamente factible.',
    pronunciation: '/ˈfiː.zə.bəl/',
    tags: ['Estimaciones', 'Técnico'],
    learned: false,
    dateAdded: '2026-09-11',
  },
  {
    id: 'vocab-7',
    term: 'Hit the ground running',
    meaning: 'Empezar de inmediato con gran energía y productividad sin requerir mucha inducción.',
    partOfSpeech: 'idiom',
    exampleSentence: 'Thanks to my experience with React and Node, I was able to hit the ground running.',
    exampleTranslation: 'Gracias a mi experiencia con React y Node, pude empezar a rendir al máximo de inmediato.',
    pronunciation: '/hɪt ðə ɡraʊnd ˈrʌn.ɪŋ/',
    tags: ['Entrevistas', 'Idioms'],
    learned: false,
    dateAdded: '2026-09-14',
  },
];

const INITIAL_TOPICS: StudyTopic[] = [
  {
    id: 'topic-1',
    title: 'STAR Method para Entrevistas Comportamentales',
    category: 'Entrevistas de Trabajo',
    description: 'Estructurar historias de éxito usando Situation, Task, Action y Result con conectores en inglés.',
    estimatedHours: 4,
    completed: true,
    completedAt: '2026-09-10',
    targetDate: '2026-09-10',
    syncedToGoogleTasks: true,
  },
  {
    id: 'topic-2',
    title: 'Present Perfect vs Past Simple en Logros Laborales',
    category: 'Gramática',
    description: 'Diferenciar acciones terminadas en el pasado ("I reduced costs by 20%") de impacto continuo ("I have led").',
    estimatedHours: 3,
    completed: true,
    completedAt: '2026-09-12',
    targetDate: '2026-09-12',
    syncedToGoogleTasks: true,
  },
  {
    id: 'topic-3',
    title: 'Vocabulario de Arquitectura de Sistemas y Escalabilidad',
    category: 'Vocabulario Técnico',
    description: 'Dominar términos como latency, throughput, caching, load balancers, rate limiting e idempotency.',
    estimatedHours: 5,
    completed: false,
    targetDate: '2026-09-20',
  },
  {
    id: 'topic-4',
    title: 'Phrasal Verbs Comunes en Reuniones y Standups',
    category: 'Conversación',
    description: 'Call off, put off, walk through, wrap up, catch up, reach out, run into, figure out.',
    estimatedHours: 3,
    completed: false,
    targetDate: '2026-09-24',
  },
  {
    id: 'topic-5',
    title: 'Redacción de Emails de Negociación Salarial y Seguimiento',
    category: 'Escritura Profesional',
    description: 'Plantillas y modales corteses (would appreciate, looking forward, wondering if, open to discuss).',
    estimatedHours: 2,
    completed: false,
    targetDate: '2026-09-28',
  },
];

const INITIAL_COURSES: StudyCourse[] = [
  {
    id: 'course-1',
    title: 'AWS Certified Solutions Architect - Associate (SAA-C03)',
    category: 'Certificación',
    institutionOrPlatform: 'Amazon Web Services / Stephane Maarek',
    status: 'En progreso',
    startDate: '2026-08-15',
    targetDate: '2026-10-30',
    totalEstimatedHours: 45,
    completedHours: 24,
    notes: 'Enfocarse en alta disponibilidad (Multi-AZ), VPC Peering, Transit Gateway y patrones serverless con Lambda y DynamoDB.',
    color: '#F59E0B',
    resources: [
      { id: 'res-1', title: 'Portal Oficial AWS Certification', url: 'https://aws.amazon.com/certification/certified-solutions-architect-associate/' },
      { id: 'res-2', title: 'AWS Well-Architected Framework Whitepapers', url: 'https://aws.amazon.com/architecture/well-architected/' },
    ],
    milestones: [
      {
        id: 'ms-1-1',
        title: 'Fundamentos de IAM, Políticas y Seguridad',
        description: 'Roles, SCPs, Least Privilege, MFA y rotación de credenciales.',
        completed: true,
        completedAt: '2026-08-22',
        estimatedHours: 4,
        dueDate: '2026-08-22',
        syncedToGoogleTasks: true,
      },
      {
        id: 'ms-1-2',
        title: 'Cómputo en AWS: EC2, ALB/NLB y Auto Scaling Groups',
        description: 'Instancias spot vs on-demand, health checks y balanceadores de carga.',
        completed: true,
        completedAt: '2026-09-02',
        estimatedHours: 8,
        dueDate: '2026-09-02',
        syncedToGoogleTasks: true,
      },
      {
        id: 'ms-1-3',
        title: 'Almacenamiento: S3, EFS, EBS y Glaciar',
        description: 'Lifecycle rules, políticas de bucket, cifrado KMS y storage classes.',
        completed: true,
        completedAt: '2026-09-12',
        estimatedHours: 6,
        dueDate: '2026-09-12',
      },
      {
        id: 'ms-1-4',
        title: 'Redes Avanzadas: VPC, Subredes Públicas/Privadas y NAT Gateway',
        description: 'Configuración de CIDR, Route Tables, Internet Gateways y Security Groups vs NACLs.',
        completed: false,
        estimatedHours: 9,
        dueDate: '2026-09-25',
      },
      {
        id: 'ms-1-5',
        title: 'Bases de Datos en AWS: RDS Multi-AZ, Aurora y DynamoDB',
        description: 'Read replicas, failover automático, índices secundarios (GSI/LSI) y DAX.',
        completed: false,
        estimatedHours: 8,
        dueDate: '2026-10-10',
      },
      {
        id: 'ms-1-6',
        title: 'Simulacros de Examen y Revisión de Escenarios Prácticos',
        description: 'Resolver 3 exámenes de práctica con puntuación mínima de 85%.',
        completed: false,
        estimatedHours: 10,
        dueDate: '2026-10-25',
      },
    ],
    createdAt: '2026-08-15T00:00:00.000Z',
    updatedAt: '2026-09-15T00:00:00.000Z',
  },
  {
    id: 'course-2',
    title: 'Estructuras de Datos y Algoritmos (LeetCode 75)',
    category: 'Tecnología',
    institutionOrPlatform: 'NeetCode / LeetCode',
    status: 'En progreso',
    startDate: '2026-09-01',
    targetDate: '2026-11-15',
    totalEstimatedHours: 40,
    completedHours: 16,
    notes: 'Resolver 2 problemas diarios en TypeScript. Enfocarse en calcular complejidad temporal O(n) y espacial O(1) de memoria.',
    color: '#3B82F6',
    resources: [
      { id: 'res-3', title: 'NeetCode 150 Roadmap', url: 'https://neetcode.io/roadmap' },
      { id: 'res-4', title: 'LeetCode Study Plan 75', url: 'https://leetcode.com/studyplan/leetcode-75/' },
    ],
    milestones: [
      {
        id: 'ms-2-1',
        title: 'Arrays & Hashing (Two Sum, Group Anagrams, Top K Frequent)',
        description: 'Uso de HashMaps, Sets y ordenamiento eficiente.',
        completed: true,
        completedAt: '2026-09-08',
        estimatedHours: 6,
        dueDate: '2026-09-08',
        syncedToGoogleTasks: true,
      },
      {
        id: 'ms-2-2',
        title: 'Two Pointers & Sliding Window (3Sum, Container With Most Water)',
        description: 'Patrones de ventanas móviles con tamaño fijo y dinámico.',
        completed: true,
        completedAt: '2026-09-14',
        estimatedHours: 8,
        dueDate: '2026-09-14',
      },
      {
        id: 'ms-2-3',
        title: 'Pilas y Colas Monótonas (Valid Parentheses, Daily Temperatures)',
        description: 'Resolución de problemas con stack y colas de prioridad.',
        completed: false,
        estimatedHours: 6,
        dueDate: '2026-09-26',
      },
      {
        id: 'ms-2-4',
        title: 'Árboles Binarios, BFS y DFS (Invert Tree, Max Depth, Level Order)',
        description: 'Recorridos iterativos y recursivos en árboles binarios de búsqueda.',
        completed: false,
        estimatedHours: 10,
        dueDate: '2026-10-08',
      },
      {
        id: 'ms-2-5',
        title: 'Programación Dinámica Básica (Climbing Stairs, Coin Change)',
        description: 'Memoización top-down y tabulación bottom-up.',
        completed: false,
        estimatedHours: 10,
        dueDate: '2026-10-28',
      },
    ],
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-14T00:00:00.000Z',
  },
  {
    id: 'course-3',
    title: 'Arquitectura de Software y Diseño de Sistemas Distribuidos',
    category: 'Tecnología',
    institutionOrPlatform: 'Designing Data-Intensive Applications (Martin Kleppmann)',
    status: 'Por iniciar',
    startDate: '2026-10-01',
    targetDate: '2026-12-20',
    totalEstimatedHours: 35,
    completedHours: 0,
    notes: 'Preparación para preguntas de System Design en entrevistas Senior (Capacidad, Sharding, Consistencia Eventual, Kafka).',
    color: '#8B5CF6',
    resources: [
      { id: 'res-5', title: 'System Design Primer (GitHub)', url: 'https://github.com/donnemartin/system-design-primer' },
    ],
    milestones: [
      {
        id: 'ms-3-1',
        title: 'Particionamiento y Replicación (Master-Slave vs Multi-Master)',
        description: 'Consistencia de lectura después de escritura y replicación sin líderes.',
        completed: false,
        estimatedHours: 8,
        dueDate: '2026-10-15',
      },
      {
        id: 'ms-3-2',
        title: 'Mensajería Asíncrona y Event-Driven Architecture (Kafka vs SQS)',
        description: 'Patrones Pub/Sub, ordenamiento de mensajes y manejo de dead-letter queues.',
        completed: false,
        estimatedHours: 9,
        dueDate: '2026-11-01',
      },
      {
        id: 'ms-3-3',
        title: 'Diseño Práctico: URL Shortener (TinyURL) y Feed de Noticias',
        description: 'Estimaciones de back-of-the-envelope, diseño de API y esquema de base de datos.',
        completed: false,
        estimatedHours: 10,
        dueDate: '2026-11-20',
      },
    ],
    createdAt: '2026-09-10T00:00:00.000Z',
    updatedAt: '2026-09-10T00:00:00.000Z',
  },
];

const INITIAL_STUDY_SESSIONS: StudySessionLog[] = [
  {
    id: 'session-1',
    courseId: 'course-1',
    courseTitle: 'AWS Certified Solutions Architect - Associate',
    date: '2026-09-12',
    minutesSpent: 90,
    summary: 'Estudio de políticas de buckets en S3 y replicación entre regiones (CRR/SRR).',
    keyTakeaways: 'La replicación S3 requiere que el versionado esté activado en ambos buckets.',
  },
  {
    id: 'session-2',
    courseId: 'course-2',
    courseTitle: 'Estructuras de Datos y Algoritmos (LeetCode 75)',
    date: '2026-09-14',
    minutesSpent: 60,
    summary: 'Práctica de Two Pointers: 3Sum y Container With Most Water en TypeScript.',
    keyTakeaways: 'Ordenar el array primero simplifica la condición para evitar elementos duplicados en O(n^2).',
  },
];

export const storage = {
  getJobs(): JobApplication[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.JOBS);
      return data ? JSON.parse(data) : INITIAL_JOBS;
    } catch {
      return INITIAL_JOBS;
    }
  },

  saveJobs(jobs: JobApplication[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
    } catch (e) {
      console.error('Error saving jobs to localStorage', e);
    }
  },

  getVocabulary(): VocabularyItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.VOCABULARY);
      return data ? JSON.parse(data) : INITIAL_VOCABULARY;
    } catch {
      return INITIAL_VOCABULARY;
    }
  },

  saveVocabulary(vocab: VocabularyItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.VOCABULARY, JSON.stringify(vocab));
    } catch (e) {
      console.error('Error saving vocabulary to localStorage', e);
    }
  },

  getTopics(): StudyTopic[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TOPICS);
      return data ? JSON.parse(data) : INITIAL_TOPICS;
    } catch {
      return INITIAL_TOPICS;
    }
  },

  saveTopics(topics: StudyTopic[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(topics));
    } catch (e) {
      console.error('Error saving topics to localStorage', e);
    }
  },

  getExercises(): EnglishExercise[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXERCISES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveExercises(exercises: EnglishExercise[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(exercises));
    } catch (e) {
      console.error('Error saving exercises to localStorage', e);
    }
  },

  getCourses(): StudyCourse[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COURSES);
      return data ? JSON.parse(data) : INITIAL_COURSES;
    } catch {
      return INITIAL_COURSES;
    }
  },

  saveCourses(courses: StudyCourse[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
    } catch (e) {
      console.error('Error saving courses to localStorage', e);
    }
  },

  getStudySessions(): StudySessionLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STUDY_SESSIONS);
      return data ? JSON.parse(data) : INITIAL_STUDY_SESSIONS;
    } catch {
      return INITIAL_STUDY_SESSIONS;
    }
  },

  saveStudySessions(sessions: StudySessionLog[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.STUDY_SESSIONS, JSON.stringify(sessions));
    } catch (e) {
      console.error('Error saving study sessions to localStorage', e);
    }
  },

  getTheme(): 'light' | 'dark' {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  },

  saveTheme(theme: 'light' | 'dark'): void {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch (e) {
      console.error('Error saving theme', e);
    }
  },

  getCustomClientId(): string {
    try {
      return localStorage.getItem(STORAGE_KEYS.CUSTOM_CLIENT_ID) || '';
    } catch {
      return '';
    }
  },

  saveCustomClientId(clientId: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_CLIENT_ID, clientId);
    } catch (e) {
      console.error('Error saving custom client ID', e);
    }
  },

  hasSeenWelcome(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEYS.WELCOME_SEEN) === 'true';
    } catch {
      return false;
    }
  },

  setWelcomeSeen(seen: boolean): void {
    try {
      localStorage.setItem(STORAGE_KEYS.WELCOME_SEEN, seen ? 'true' : 'false');
    } catch (e) {
      console.error('Error saving welcome seen status', e);
    }
  },

  exportAllData(): string {
    const backup = {
      version: '1.1',
      exportedAt: new Date().toISOString(),
      jobs: this.getJobs(),
      vocabulary: this.getVocabulary(),
      topics: this.getTopics(),
      exercises: this.getExercises(),
      courses: this.getCourses(),
      studySessions: this.getStudySessions(),
    };
    return JSON.stringify(backup, null, 2);
  },

  importAllData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.jobs && Array.isArray(data.jobs)) this.saveJobs(data.jobs);
      if (data.vocabulary && Array.isArray(data.vocabulary)) this.saveVocabulary(data.vocabulary);
      if (data.topics && Array.isArray(data.topics)) this.saveTopics(data.topics);
      if (data.exercises && Array.isArray(data.exercises)) this.saveExercises(data.exercises);
      if (data.courses && Array.isArray(data.courses)) this.saveCourses(data.courses);
      if (data.studySessions && Array.isArray(data.studySessions)) this.saveStudySessions(data.studySessions);
      return true;
    } catch (e) {
      console.error('Failed to import backup data:', e);
      return false;
    }
  },
};

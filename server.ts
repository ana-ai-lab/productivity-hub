import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI, Type } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(express.json());

// Read oAuthClientId from firebase-applet-config.json if available
let defaultClientId = '';
try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    if (config.oAuthClientId) {
      defaultClientId = config.oAuthClientId;
    }
  }
} catch (err) {
  console.warn('Could not read firebase-applet-config.json', err);
}

// Lazy Gemini client helper
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

// List of candidate Gemini models to try in sequence for resilience against high demand (503 / 429)
const CANDIDATE_MODELS = [
  'gemini-3.8-flash',
  'gemini-flash-latest',
  'gemini-3.1-flash-lite',
];

function isRetryableGeminiError(error: any): boolean {
  if (!error) return false;
  const status = error.status || error.code || error.statusCode;
  const msg = (error.message || '').toLowerCase();
  return (
    status === 503 ||
    status === 429 ||
    status === 'UNAVAILABLE' ||
    msg.includes('high demand') ||
    msg.includes('unavailable') ||
    msg.includes('spikes in demand') ||
    msg.includes('quota') ||
    msg.includes('resource exhausted') ||
    msg.includes('rate limit')
  );
}

function cleanAndParseJson<T = any>(rawText: string): T | null {
  if (!rawText) return null;
  try {
    let clean = rawText.trim();
    if (clean.startsWith('```')) {
      clean = clean.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    }
    return JSON.parse(clean);
  } catch (err) {
    console.warn('Failed to parse JSON response from Gemini model:', err);
    return null;
  }
}

async function generateGeminiContentWithFallback(
  ai: GoogleGenAI,
  prompt: string,
  options: { json?: boolean; temperature?: number } = {}
): Promise<{ text: string; modelUsed: string } | null> {
  for (const model of CANDIDATE_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: options.json ? 'application/json' : undefined,
            temperature: options.temperature ?? 0.5,
          },
        });

        if (response?.text && response.text.trim().length > 0) {
          return { text: response.text, modelUsed: model };
        }
      } catch (err: any) {
        const retryable = isRetryableGeminiError(err);
        if (retryable && attempt === 0) {
          // Brief pause before retrying once on the same model
          await new Promise((resolve) => setTimeout(resolve, 600));
          continue;
        }
        console.warn(`Model ${model} unavailable (attempt ${attempt + 1}): ${err?.message || err}`);
        break; // Move to next candidate model
      }
    }
  }
  return null;
}

function getLocalAnswerEvaluation(exercise: any, userAnswer: string) {
  const normalizedUser = (userAnswer || '').trim().toLowerCase();
  const normalizedExpected = (exercise.correctAnswer || '').trim().toLowerCase();

  const isExact = normalizedUser === normalizedExpected;
  const isClose =
    isExact ||
    (Boolean(normalizedExpected) && normalizedUser.includes(normalizedExpected)) ||
    (Boolean(normalizedExpected) && normalizedExpected.includes(normalizedUser) && normalizedUser.length > 3);

  return {
    isCorrect: isExact,
    score: isExact ? 100 : isClose ? 75 : 55,
    feedback: isExact
      ? '¡Excelente respuesta! Tu respuesta es correcta y natural.'
      : isClose
      ? `Respuesta bastante acertada. La forma ideal esperada es: "${exercise.correctAnswer}".`
      : `Revisa la estructura gramatical. La respuesta esperada es: "${exercise.correctAnswer}".`,
    correctedVersion: exercise.correctAnswer || userAnswer,
    tips: exercise.explanation || 'Practica la conjugación y preposiciones clave de este tema.',
    source: 'fallback',
  };
}

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// App configuration for frontend
app.get('/api/config', (req: Request, res: Response) => {
  res.json({
    oAuthClientId: process.env.GOOGLE_CLIENT_ID || defaultClientId,
    hasGemini: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Endpoint: Generate 5 daily English exercises
app.post('/api/gemini/exercises', async (req: Request, res: Response) => {
  const { topic, difficulty = 'intermedio', focusArea = 'general' } = req.body || {};
  const ai = getGeminiClient();

  if (!ai) {
    // If no API key is present in environment, return rich curated fallback exercises
    return res.json({
      exercises: getCuratedExercises(topic, difficulty),
      source: 'curated_fallback',
    });
  }

  try {
    const prompt = `Genera exactamente 5 ejercicios prácticos diarios de inglés para un hispanohablante profesional (desarrollador o profesional que busca empleo en tecnología/negocios).
    Dificultad solicitada: ${difficulty}.
    Área de enfoque o tema: ${topic || focusArea || 'Inglés profesional y preparación para entrevistas de trabajo'}.
    
    Debes incluir una mezcla balanceada de:
    1. Gramática práctica (por ejemplo, Past Simple vs Present Perfect, Phrasal Verbs de oficina, Conditionals, Modals).
    2. Traducción profesional de español a inglés (frases usadas en standup, reuniones o emails).
    3. Corrección de oraciones con errores típicos de hispanohablantes (e.g. false friends, prepositions).
    4. Opción múltiple con contexto de trabajo.
    5. Pregunta de simulación de entrevista en inglés (STAR method o behavioral).
    
    Devuelve estrictamente un arreglo JSON de 5 objetos con la siguiente estructura:
    [
      {
        "id": "ex-1",
        "type": "grammar" | "translation" | "sentence_correction" | "multiple_choice",
        "title": "Título corto y claro del ejercicio",
        "category": "Categoría gramatical o temática",
        "question": "Instrucción o frase en inglés/español para resolver",
        "promptTranslation": "Traducción o contexto en español (opcional si aplica)",
        "options": ["opcion A", "opcion B", "opcion C", "opcion D"], // Opcional, solo si type es multiple_choice
        "correctAnswer": "Respuesta correcta ideal",
        "explanation": "Breve explicación pedagógica en español de por qué esa es la respuesta correcta"
      }
    ]`;

    const geminiResult = await generateGeminiContentWithFallback(ai, prompt, {
      json: true,
      temperature: 0.7,
    });

    if (geminiResult?.text) {
      const parsed = cleanAndParseJson(geminiResult.text);
      const exercises = Array.isArray(parsed) ? parsed : (parsed?.exercises || []);
      if (Array.isArray(exercises) && exercises.length > 0) {
        return res.json({
          exercises,
          source: 'gemini',
          modelUsed: geminiResult.modelUsed,
        });
      }
    }

    // Gracefully provide curated exercises if models experienced temporary spikes
    return res.json({
      exercises: getCuratedExercises(topic, difficulty),
      source: 'curated_fallback',
    });
  } catch (error: any) {
    console.warn('Recovered from exercise generation error using curated fallback:', error?.message || error);
    return res.json({
      exercises: getCuratedExercises(topic, difficulty),
      source: 'curated_fallback',
    });
  }
});

// Endpoint: Check and grade user answer
app.post('/api/gemini/check', async (req: Request, res: Response) => {
  const { exercise, userAnswer } = req.body || {};

  if (!exercise || !userAnswer) {
    return res.status(400).json({ error: 'Exercise and userAnswer are required' });
  }

  const ai = getGeminiClient();

  // Basic fallback check if no Gemini key is available
  if (!ai) {
    return res.json(getLocalAnswerEvaluation(exercise, userAnswer));
  }

  try {
    const prompt = `Evalúa la respuesta de un estudiante hispanohablante para el siguiente ejercicio de inglés:
    Título: ${exercise.title}
    Tipo: ${exercise.type}
    Pregunta / Instrucción: ${exercise.question}
    Respuesta esperada: ${exercise.correctAnswer || 'N/A'}
    Respuesta del usuario: "${userAnswer}"

    Analiza la gramática, vocabulario, ortografía, naturalidad y adecuación al contexto profesional.
    Devuelve un JSON con:
    {
      "isCorrect": boolean (true si es correcta o aceptable como variante natural, false si tiene errores graves),
      "score": number (de 0 a 100 reflejando la calidad),
      "feedback": string (explicación en español amigable, constructiva y clara),
      "correctedVersion": string (la versión más pulida y natural en inglés),
      "tips": string (consejo práctico en español para recordar esta regla o patrón)
    }`;

    const geminiResult = await generateGeminiContentWithFallback(ai, prompt, {
      json: true,
      temperature: 0.3,
    });

    if (geminiResult?.text) {
      const parsed = cleanAndParseJson(geminiResult.text);
      if (parsed) {
        return res.json({
          isCorrect: Boolean(parsed.isCorrect),
          score: typeof parsed.score === 'number' ? parsed.score : 85,
          feedback: parsed.feedback || 'Evaluación completada.',
          correctedVersion: parsed.correctedVersion || exercise.correctAnswer,
          tips: parsed.tips || 'Continúa practicando este tema regularmente.',
          source: 'gemini',
          modelUsed: geminiResult.modelUsed,
        });
      }
    }

    return res.json(getLocalAnswerEvaluation(exercise, userAnswer));
  } catch (error: any) {
    console.warn('Recovered from answer evaluation error using local evaluation:', error?.message || error);
    return res.json(getLocalAnswerEvaluation(exercise, userAnswer));
  }
});

// Endpoint: Generate custom study plan / syllabus with Gemini
app.post('/api/gemini/generate-study-plan', async (req: Request, res: Response) => {
  const { 
    topic, 
    category = 'Tecnología', 
    targetWeeks = 6, 
    weeklyHours = 5,
    institutionOrPlatform = 'Autodidacta / En línea',
    goal = ''
  } = req.body || {};

  if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
    return res.status(400).json({ error: 'El tema o materia de estudio es requerido.' });
  }

  const ai = getGeminiClient();

  if (!ai) {
    return res.json({
      studyPlan: getFallbackStudyPlan(topic, category, targetWeeks, weeklyHours, institutionOrPlatform),
      source: 'curated_fallback',
    });
  }

  try {
    const prompt = `Actúa como un Diseñador Curricular y Mentor Académico Senior.
Crea un plan de estudios completo, estructurado y realista para la siguiente materia o certificación:
Tema: "${topic}"
Categoría: "${category}"
Plataforma / Institución sugerida: "${institutionOrPlatform}"
Duración estimada: ${targetWeeks} semanas, dedicando unas ${weeklyHours} horas por semana (Total aprox: ${targetWeeks * weeklyHours} horas).
Objetivo del estudiante: ${goal || 'Dominar el tema a nivel profesional o prepararse para certificación/empleo'}.

Instrucciones:
1. Divide el temario en entre 4 y 7 módulos o hitos secuenciales (milestones) lógicos, desde fundamentos hasta conceptos avanzados o proyecto práctico final.
2. Asigna a cada hito un título claro, descripción detallada de lo que debe aprender/practicar y las horas estimadas.
3. Sugiere 2 o 3 recursos de referencia confiables (documentación oficial, libros clásicos, o plataformas).

Devuelve estrictamente un JSON válido con esta estructura:
{
  "title": "Nombre profesional y conciso del curso o plan",
  "category": "${category}",
  "institutionOrPlatform": "${institutionOrPlatform}",
  "notes": "Estrategia clave de estudio y recomendaciones metodológicas",
  "totalEstimatedHours": ${targetWeeks * weeklyHours},
  "milestones": [
    {
      "title": "Título del hito o módulo",
      "description": "Detalle de los conceptos y ejercicios a dominar",
      "estimatedHours": 8
    }
  ],
  "resources": [
    {
      "title": "Nombre del recurso o documentación",
      "url": "https://..."
    }
  ]
}`;

    const geminiResult = await generateGeminiContentWithFallback(ai, prompt, {
      json: true,
      temperature: 0.4,
    });

    if (geminiResult?.text) {
      const parsed = cleanAndParseJson(geminiResult.text);
      if (parsed?.title && Array.isArray(parsed?.milestones)) {
        return res.json({
          studyPlan: {
            ...parsed,
            milestones: parsed.milestones.map((m: any, idx: number) => ({
              id: `ai-ms-${Date.now()}-${idx}`,
              title: m.title || `Módulo ${idx + 1}`,
              description: m.description || '',
              estimatedHours: typeof m.estimatedHours === 'number' ? m.estimatedHours : Math.round((targetWeeks * weeklyHours) / parsed.milestones.length),
              completed: false,
            })),
            resources: Array.isArray(parsed.resources) 
              ? parsed.resources.map((r: any, idx: number) => ({
                  id: `ai-res-${Date.now()}-${idx}`,
                  title: r.title || 'Documentación / Guía oficial',
                  url: r.url || 'https://google.com',
                }))
              : [],
          },
          source: 'gemini',
          modelUsed: geminiResult.modelUsed,
        });
      }
    }

    return res.json({
      studyPlan: getFallbackStudyPlan(topic, category, targetWeeks, weeklyHours, institutionOrPlatform),
      source: 'fallback',
    });
  } catch (error: any) {
    console.warn('Recovered from study plan generation error using curated fallback:', error?.message || error);
    return res.json({
      studyPlan: getFallbackStudyPlan(topic, category, targetWeeks, weeklyHours, institutionOrPlatform),
      source: 'fallback',
    });
  }
});

function getFallbackStudyPlan(
  topic: string, 
  category: string, 
  targetWeeks: number, 
  weeklyHours: number, 
  institutionOrPlatform: string
) {
  const total = targetWeeks * weeklyHours;
  const hoursPerModule = Math.max(2, Math.round(total / 4));
  const timestamp = Date.now();

  return {
    title: topic.length > 50 ? topic.slice(0, 50) : topic,
    category,
    institutionOrPlatform: institutionOrPlatform || 'Autodidacta / Recursos Web',
    notes: `Plan de estudio estructurado en ${targetWeeks} semanas (${weeklyHours}h/semana). Enfocarse en proyectos prácticos y repaso activo.`,
    totalEstimatedHours: total,
    milestones: [
      {
        id: `ms-${timestamp}-1`,
        title: `1. Fundamentos y Conceptos Clave de ${topic}`,
        description: 'Comprensión de la arquitectura, sintaxis básica, glosario esencial y configuración del entorno de trabajo.',
        estimatedHours: hoursPerModule,
        completed: false,
      },
      {
        id: `ms-${timestamp}-2`,
        title: `2. Práctica Intermedia y Patrones Comunes`,
        description: 'Implementación de casos de uso reales, resolución de ejercicios prácticos y manejo de errores.',
        estimatedHours: hoursPerModule,
        completed: false,
      },
      {
        id: `ms-${timestamp}-3`,
        title: `3. Conceptos Avanzados y Buenas Prácticas`,
        description: 'Optimización, patrones de diseño recomendados por la industria, seguridad y testing.',
        estimatedHours: hoursPerModule,
        completed: false,
      },
      {
        id: `ms-${timestamp}-4`,
        title: `4. Proyecto Integrador o Simulacro de Evaluación`,
        description: 'Desarrollo de un proyecto de portafolio de principio a fin o resolución de exámenes de prueba.',
        estimatedHours: hoursPerModule,
        completed: false,
      },
    ],
    resources: [
      {
        id: `res-${timestamp}-1`,
        title: `Documentación Oficial de ${topic}`,
        url: 'https://developer.mozilla.org',
      },
      {
        id: `res-${timestamp}-2`,
        title: 'Roadmap y Guía Comunitaria (roadmap.sh)',
        url: 'https://roadmap.sh',
      },
    ],
  };
}

function getCuratedExercises(topic?: string, difficulty?: string) {
  const timestamp = Date.now();
  return [
    {
      id: `curated-${timestamp}-1`,
      type: 'grammar',
      title: 'Present Perfect vs. Past Simple',
      category: 'Tiempos Verbales en Entrevistas',
      question: 'Completa la oración con la forma correcta del verbo entre paréntesis: "I ______ (work) as a software engineer for 3 years before joining my previous company."',
      options: ['worked', 'have worked', 'had worked', 'was working'],
      correctAnswer: 'worked',
      explanation: 'Se utiliza Past Simple ("worked") porque la acción ocurrió y terminó en un período de tiempo definido en el pasado ("before joining...").',
    },
    {
      id: `curated-${timestamp}-2`,
      type: 'translation',
      title: 'Traducción de Situación Laboral',
      question: 'Traduce al inglés: "Fui responsable de optimizar el rendimiento de la base de datos y reducir los tiempos de respuesta en un 30%."',
      promptTranslation: 'Consejo: Usa verbos de acción fuertes como "I was responsible for optimizing..." o "I led the optimization of...".',
      correctAnswer: 'I was responsible for optimizing database performance and reducing response times by 30%.',
      explanation: 'En inglés se usa gerundio después de preposiciones ("responsible for optimizing... and reducing...") y la preposición "by" para porcentajes de cambio.',
    },
    {
      id: `curated-${timestamp}-3`,
      type: 'sentence_correction',
      title: 'Corrección de Frase en Reunión',
      question: 'Corrige el error típico en esta frase de standup: "I didn\'t finished the task because I had an unexpected meeting."',
      correctAnswer: 'I didn\'t finish the task because I had an unexpected meeting.',
      explanation: 'Con el auxiliar negativo en pasado "didn\'t", el verbo principal siempre debe ir en forma base ("finish", no "finished").',
    },
    {
      id: `curated-${timestamp}-4`,
      type: 'multiple_choice',
      title: 'Phrasal Verb Profesional',
      question: 'Elige el phrasal verb adecuado para: "We need to ______ the meeting until Friday because the team lead is out of the office."',
      options: ['call off', 'put off', 'look into', 'give up'],
      correctAnswer: 'put off',
      explanation: '"Put off" significa posponer o aplazar temporalmente. "Call off" significa cancelar definitivamente.',
    },
    {
      id: `curated-${timestamp}-5`,
      type: 'translation',
      title: 'Pregunta Comportamental (STAR Method)',
      question: 'Traduce al inglés: "Cuando enfrento un desacuerdo técnico con un compañero, prefiero programar una llamada corta para revisar los requerimientos."',
      correctAnswer: 'When I face a technical disagreement with a colleague, I prefer to schedule a quick call to review the requirements.',
      explanation: '"Colleague" o "peer" es más natural que "partner" en un entorno laboral, y "schedule a quick call" es una colocación muy idiomática.',
    },
  ];
}

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Productivity Hub server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

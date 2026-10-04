import { EnglishExercise } from '../types';

export const aiEnglishService = {
  async generateDailyExercises(topic?: string, difficulty: string = 'intermedio'): Promise<EnglishExercise[]> {
    try {
      const response = await fetch('/api/gemini/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, difficulty }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      if (Array.isArray(data.exercises) && data.exercises.length > 0) {
        return data.exercises;
      }
      throw new Error('No exercises returned');
    } catch (err) {
      console.warn('Fallback to client exercises generator due to API error', err);
      return this.getLocalFallbackExercises();
    }
  },

  async evaluateAnswer(
    exercise: EnglishExercise,
    userAnswer: string
  ): Promise<{
    isCorrect: boolean;
    score: number;
    feedback: string;
    correctedVersion?: string;
    tips?: string;
  }> {
    try {
      const response = await fetch('/api/gemini/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exercise, userAnswer }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return {
        isCorrect: Boolean(data.isCorrect),
        score: typeof data.score === 'number' ? data.score : 80,
        feedback: data.feedback || 'Evaluación completada.',
        correctedVersion: data.correctedVersion || exercise.correctAnswer,
        tips: data.tips,
      };
    } catch (err) {
      console.warn('Evaluating client-side as fallback', err);
      const isExact =
        exercise.correctAnswer &&
        userAnswer.trim().toLowerCase() === exercise.correctAnswer.trim().toLowerCase();

      return {
        isCorrect: isExact,
        score: isExact ? 100 : 70,
        feedback: isExact
          ? '¡Excelente! Respuesta correcta.'
          : `Respuesta esperada: "${exercise.correctAnswer}". Revisa tiempos verbales y vocabulario.`,
        correctedVersion: exercise.correctAnswer,
        tips: exercise.explanation || 'Revisa la regla gramatical del ejercicio.',
      };
    }
  },

  getLocalFallbackExercises(): EnglishExercise[] {
    const seed = Date.now();
    return [
      {
        id: `fb-1-${seed}`,
        type: 'grammar',
        title: 'Present Perfect vs Past Simple',
        category: 'Tiempos Verbales',
        question: 'Completa: "I ______ (lead) the backend migration project last quarter."',
        options: ['have led', 'led', 'was leading', 'had led'],
        correctAnswer: 'led',
        explanation: '"Last quarter" indica un período finalizado en el pasado, por lo que corresponde el Past Simple ("led").',
      },
      {
        id: `fb-2-${seed}`,
        type: 'translation',
        title: 'Traducción Técnica',
        category: 'Vocabulario Técnico',
        question: 'Traduce al inglés: "Implementamos una estrategia de caché para reducir la latencia de las consultas."',
        correctAnswer: 'We implemented a caching strategy to reduce query latency.',
        explanation: '"Caching strategy" y "query latency" son las colocaciones técnicas estándar en inglés de ingeniería de software.',
      },
      {
        id: `fb-3-${seed}`,
        type: 'sentence_correction',
        title: 'Corrección de Preposiciones',
        category: 'Preposiciones',
        question: 'Corrige: "I am working in this project since three months."',
        correctAnswer: 'I have been working on this project for three months.',
        explanation: 'Se usa "work ON a project" (preposición correcta), "have been working" para acción continua desde el pasado, y "for" para duración de tiempo ("for three months", no "since").',
      },
      {
        id: `fb-4-${seed}`,
        type: 'multiple_choice',
        title: 'Colocación en Entrevistas',
        category: 'Entrevistas de Trabajo',
        question: 'Elige la opción más natural: "Could you please ______ me through your previous experience with microservices?"',
        options: ['talk', 'walk', 'speak', 'tell'],
        correctAnswer: 'walk',
        explanation: '"Walk me through" es la expresión más común en entrevistas técnicas para pedirte que expliques paso a paso tu trayectoria.',
      },
      {
        id: `fb-5-${seed}`,
        type: 'translation',
        title: 'Pregunta Comportamental (STAR)',
        category: 'Método STAR',
        question: 'Traduce al inglés: "Mi mayor fortaleza es resolver problemas complejos bajo presión mientras mantengo una comunicación clara con el equipo."',
        correctAnswer: 'My greatest strength is solving complex problems under pressure while maintaining clear communication with the team.',
        explanation: '"Under pressure" y "while maintaining" expresan fluidez y profesionalismo natural.',
      },
    ];
  },
};

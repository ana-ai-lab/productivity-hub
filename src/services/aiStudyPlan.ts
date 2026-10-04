import { StudyCourse, StudyPlanCategory, StudyMilestone, StudyResource } from '../types';

export interface GeneratePlanParams {
  topic: string;
  category: StudyPlanCategory;
  targetWeeks: number;
  weeklyHours: number;
  institutionOrPlatform: string;
  goal?: string;
}

export const aiStudyPlanService = {
  async generateCoursePlan(params: GeneratePlanParams): Promise<{
    title: string;
    category: StudyPlanCategory;
    institutionOrPlatform: string;
    notes: string;
    totalEstimatedHours: number;
    milestones: Omit<StudyMilestone, 'id'>[];
    resources: Omit<StudyResource, 'id'>[];
  }> {
    try {
      const response = await fetch('/api/gemini/generate-study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.studyPlan && Array.isArray(data.studyPlan.milestones)) {
        return data.studyPlan;
      }
      throw new Error('Respuesta incompleta del servidor');
    } catch (err) {
      console.warn('Fallback local para generación de plan de estudio', err);
      return this.getLocalFallbackPlan(params);
    }
  },

  getLocalFallbackPlan(params: GeneratePlanParams) {
    const total = params.targetWeeks * params.weeklyHours;
    const hoursPerMilestone = Math.max(2, Math.round(total / 4));

    return {
      title: params.topic,
      category: params.category,
      institutionOrPlatform: params.institutionOrPlatform || 'Autodidacta / En línea',
      notes: `Plan de estudio generado para dominar ${params.topic} en ${params.targetWeeks} semanas dedicando ${params.weeklyHours}h/semana. Enfoque en proyectos prácticos.`,
      totalEstimatedHours: total,
      milestones: [
        {
          title: `1. Fundamentos y Arquitectura de ${params.topic}`,
          description: 'Instalación del entorno, conceptos base, glosario técnico y primeros ejemplos guiados.',
          completed: false,
          estimatedHours: hoursPerMilestone,
        },
        {
          title: `2. Desarrollo de Ejercicios y Casos Prácticos`,
          description: 'Implementación de patrones estándar, resolución de problemas típicos y depuración.',
          completed: false,
          estimatedHours: hoursPerMilestone,
        },
        {
          title: `3. Temas Avanzados y Buenas Prácticas`,
          description: 'Optimización de rendimiento, seguridad, concurrencia y estándares profesionales.',
          completed: false,
          estimatedHours: hoursPerMilestone,
        },
        {
          title: `4. Proyecto Integrador o Preparación de Examen`,
          description: 'Construcción de un proyecto real completo de portafolio o simulacro de certificación.',
          completed: false,
          estimatedHours: hoursPerMilestone,
        },
      ],
      resources: [
        {
          title: `Documentación Oficial de ${params.topic}`,
          url: 'https://roadmap.sh',
        },
        {
          title: 'Guía de Arquitectura y Buenas Prácticas',
          url: 'https://github.com',
        },
      ],
    };
  },
};

/**
 * Calcula los deadlines automáticos para newsletters y RRSS
 * basados en la fecha de publicación
 */

/**
 * Obtiene el día de la semana anterior más cercano (0=Domingo, 1=Lunes, etc.)
 * @param date Fecha de referencia
 * @param targetDay Día objetivo (0-6)
 * @param weeksBack Semanas hacia atrás
 */
function getPreviousWeekday(date: Date, targetDay: number, weeksBack: number): Date {
  const result = new Date(date);
  
  // Retroceder las semanas especificadas
  result.setDate(result.getDate() - (weeksBack * 7));
  
  // Ajustar al día de la semana objetivo
  const currentDay = result.getDay();
  const daysToSubtract = (currentDay - targetDay + 7) % 7;
  
  if (daysToSubtract > 0) {
    result.setDate(result.getDate() - daysToSubtract);
  }
  
  return result;
}

/**
 * Formatea una fecha a formato YYYY-MM-DD
 */
function formatDateToSQL(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export interface WorkflowDeadlines {
  enviar_cliente?: string;      // Newsletter: Viernes 3 semanas antes
  envio_diseno?: string;         // Newsletter: Lunes 2 semanas antes | RRSS: Lunes 2 semanas antes
  edicion?: string;              // Newsletter: Jueves 2 semanas antes | RRSS: Miércoles 1 semana antes
  cambios?: string;              // Newsletter: Jueves 1 semana antes | RRSS: Viernes 1 semana antes
}

/**
 * Calcula todos los deadlines para un newsletter técnico
 */
function calculateNewsletterDeadlines(pubDate: Date): WorkflowDeadlines {
  return {
    // Viernes 3 semanas antes de publicación
    enviar_cliente: formatDateToSQL(getPreviousWeekday(pubDate, 5, 3)), // 5 = Viernes
    // Lunes 2 semanas antes de publicación
    envio_diseno: formatDateToSQL(getPreviousWeekday(pubDate, 1, 2)), // 1 = Lunes
    // Jueves 2 semanas antes de publicación
    edicion: formatDateToSQL(getPreviousWeekday(pubDate, 4, 2)), // 4 = Jueves
    // Jueves 1 semana antes de publicación
    cambios: formatDateToSQL(getPreviousWeekday(pubDate, 4, 1)), // 4 = Jueves
  };
}

/**
 * Calcula todos los deadlines para RRSS (Social Media Post)
 * Plazos más cortos que el newsletter
 */
function calculateRRSSDeadlines(pubDate: Date): WorkflowDeadlines {
  return {
    // Viernes 2 semanas antes de publicación
    enviar_cliente: formatDateToSQL(getPreviousWeekday(pubDate, 5, 2)), // 5 = Viernes
    // Lunes 1 semana antes de publicación
    envio_diseno: formatDateToSQL(getPreviousWeekday(pubDate, 1, 1)), // 1 = Lunes 
    // Miércoles 1 semana antes de publicación
    edicion: formatDateToSQL(getPreviousWeekday(pubDate, 3, 1)), // 3 = Miércoles
    // Viernes misma semana (antes de publicación)
    cambios: formatDateToSQL(getPreviousWeekday(pubDate, 5, 0)), // 5 = Viernes
  };
}

/**
 * Calcula todos los deadlines según tipo de contenido
 * @param publicationDate Fecha de publicación (start_date)
 * @param contentType Tipo de contenido (banner o articulo_tecnico)
 * @returns Objeto con los deadlines calculados
 */
export function calculateWorkflowDeadlines(
  publicationDate: string | Date,
  contentType: string | null
): WorkflowDeadlines {
  const pubDate = typeof publicationDate === 'string' 
    ? new Date(publicationDate) 
    : publicationDate;

  // Validar fecha
  if (isNaN(pubDate.getTime())) {
    return {};
  }

  // Newsletter (artículo técnico) = plazos más largos
  if (contentType === 'articulo_tecnico') {
    return calculateNewsletterDeadlines(pubDate);
  }
  
  // RRSS / Banner = plazos más cortos
  return calculateRRSSDeadlines(pubDate);
}

/**
 * Obtiene el deadline específico según el estado del workflow
 * @param publicationDate Fecha de publicación
 * @param contentType Tipo de contenido
 * @param workflowState Estado actual del workflow
 * @returns Fecha deadline correspondiente o null
 */
export function getDeadlineForState(
  publicationDate: string | Date,
  contentType: string | null,
  workflowState: string
): string | null {
  const deadlines = calculateWorkflowDeadlines(publicationDate, contentType);
  
  // Mapear estados a deadlines
  const stateDeadlineMap: { [key: string]: keyof WorkflowDeadlines } = {
    'por_recibir': 'enviar_cliente',
    'enviado_diseno': 'envio_diseno',
    'en_edicion': 'edicion',
    'cambios': 'cambios',
  };

  const deadlineKey = stateDeadlineMap[workflowState];
  return deadlineKey ? deadlines[deadlineKey] || null : null;
}

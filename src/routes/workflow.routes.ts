import express from 'express';
import { 
  getTasks, 
  updateContentType, 
  updateWorkflowState,
  updateDesignResponsible,
  updateDeadline,
  recalculateDeadlines,
  updateNewsletterLink,
  updateRRSSPublication
} from '../controllers/workflow.controller';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Obtener todas las tareas de workflow
router.get('/tasks', getTasks);

// Actualizar tipo de contenido (banner/art tec)
router.put('/tasks/:id/content-type', updateContentType);

// Actualizar estado del workflow
router.put('/tasks/:id/state', updateWorkflowState);

// Actualizar responsable de diseño
router.put('/tasks/:id/design-responsible', updateDesignResponsible);

// Actualizar fecha límite
router.put('/tasks/:id/deadline', updateDeadline);

// Recalcular todos los deadlines automáticamente
router.post('/recalculate-deadlines', recalculateDeadlines);

// Actualizar link de newsletter publicada
router.put('/tasks/:id/newsletter-link', updateNewsletterLink);

// Actualizar publicación RRSS (fecha y link)
router.put('/tasks/:id/rrss-publication', updateRRSSPublication);

export default router;

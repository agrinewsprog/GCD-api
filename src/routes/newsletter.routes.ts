import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getNewsletterTypes,
  getNewsletterSchedules,
  getRegionsByMedium,
  getScheduleById,
  getAllNewsletterTypes,
  createNewsletterType,
  updateNewsletterType,
  deleteNewsletterType,
  toggleNewsletterTypeStatus,
  regenerateSchedules
} from '../controllers/newsletter.controller';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Public routes (for comerciales)
// GET /api/newsletters/types?medium_id=1&region=Spain
router.get('/types', getNewsletterTypes);

// GET /api/newsletters/schedules?newsletter_type_id=1&available_only=true
router.get('/schedules', getNewsletterSchedules);

// GET /api/newsletters/regions/:medium_id
router.get('/regions/:medium_id', getRegionsByMedium);

// GET /api/newsletters/schedules/:id
router.get('/schedules/:id', getScheduleById);

// Admin routes (CRUD newsletter types)
// GET /api/newsletters/admin/types - Get all types including inactive
router.get('/admin/types', getAllNewsletterTypes);

// POST /api/newsletters/admin/types - Create new type
router.post('/admin/types', createNewsletterType);

// PUT /api/newsletters/admin/types/:id - Update type
router.put('/admin/types/:id', updateNewsletterType);

// DELETE /api/newsletters/admin/types/:id - Delete type
router.delete('/admin/types/:id', deleteNewsletterType);

// PATCH /api/newsletters/admin/types/:id/toggle - Toggle active status
router.patch('/admin/types/:id/toggle', toggleNewsletterTypeStatus);

// POST /api/newsletters/admin/regenerate - Regenerate schedules for a year
router.post('/admin/regenerate', regenerateSchedules);

export default router;

import { Router } from 'express';
import {
  getAllMediums,
  getMediumById,
  createMedium,
  updateMedium,
  deleteMedium,
  assignChannels,
  removeChannel,
  validateMedium,
  validateMediumId,
  validateAssignChannels,
} from '../controllers/mediums.controller';
import { authMiddleware } from '../middleware/auth';
import { roleMiddleware } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get all mediums
router.get('/', getAllMediums);

// Get medium by ID with channels
router.get('/:id', validateMediumId, getMediumById);

// Create medium (admin only)
router.post(
  '/',
  roleMiddleware('admin'),
  validateMedium,
  createMedium
);

// Update medium (admin only)
router.put(
  '/:id',
  roleMiddleware('admin'),
  validateMediumId,
  validateMedium,
  updateMedium
);

// Delete medium (admin only)
router.delete(
  '/:id',
  roleMiddleware('admin'),
  validateMediumId,
  deleteMedium
);

// Assign channels to medium (admin only)
router.post(
  '/:id/channels',
  roleMiddleware('admin'),
  validateMediumId,
  validateAssignChannels,
  assignChannels
);

// Remove channel from medium (admin only)
router.delete(
  '/:id/channels/:channelId',
  roleMiddleware('admin'),
  validateMediumId,
  removeChannel
);

export default router;

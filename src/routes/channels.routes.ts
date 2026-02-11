import { Router } from 'express';
import {
  getAllChannels,
  getChannelById,
  createChannel,
  updateChannel,
  deleteChannel,
  assignActions,
  removeAction,
  validateChannel,
  validateChannelId,
  validateAssignActions,
} from '../controllers/channels.controller';
import { authMiddleware } from '../middleware/auth';
import { roleMiddleware } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get all channels
router.get('/', getAllChannels);

// Get channel by ID with actions
router.get('/:id', validateChannelId, getChannelById);

// Create channel (admin only)
router.post(
  '/',
  roleMiddleware('admin'),
  validateChannel,
  createChannel
);

// Update channel (admin only)
router.put(
  '/:id',
  roleMiddleware('admin'),
  validateChannelId,
  validateChannel,
  updateChannel
);

// Delete channel (admin only)
router.delete(
  '/:id',
  roleMiddleware('admin'),
  validateChannelId,
  deleteChannel
);

// Assign actions to channel (admin only)
router.post(
  '/:id/actions',
  roleMiddleware('admin'),
  validateChannelId,
  validateAssignActions,
  assignActions
);

// Remove action from channel (admin only)
router.delete(
  '/:id/actions/:actionId',
  roleMiddleware('admin'),
  validateChannelId,
  removeAction
);

export default router;

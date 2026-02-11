import { Router } from 'express';
import {
  getAllActions,
  getActionById,
  createAction,
  updateAction,
  deleteAction,
  validateAction,
  validateActionId,
} from '../controllers/actions.controller';
import { authMiddleware } from '../middleware/auth';
import { roleMiddleware } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get all actions
router.get('/', getAllActions);

// Get action by ID
router.get('/:id', validateActionId, getActionById);

// Create action (admin only)
router.post(
  '/',
  roleMiddleware('admin'),
  validateAction,
  createAction
);

// Update action (admin only)
router.put(
  '/:id',
  roleMiddleware('admin'),
  validateActionId,
  validateAction,
  updateAction
);

// Delete action (admin only)
router.delete(
  '/:id',
  roleMiddleware('admin'),
  validateActionId,
  deleteAction
);

export default router;

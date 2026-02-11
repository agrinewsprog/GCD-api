import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getConfirmations,
  confirmDeadline,
  revertConfirmation
} from '../controllers/magazineDeadlines.controller';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get confirmations for a campaign action
router.get('/campaign-action/:campaignActionId', getConfirmations);

// Confirm a deadline
router.post('/campaign-action/:campaignActionId/confirm', confirmDeadline);

// Revert a confirmation
router.post('/confirmations/:confirmationId/revert', revertConfirmation);

export default router;

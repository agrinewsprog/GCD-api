import { Router } from 'express';
import {
  getAllCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  assignActions,
  updateActionStatus,
  moveActionToEdition,
  validateCampaign,
  validateCampaignId,
  validateAssignActions,
  validateActionStatus,
} from '../controllers/campaigns.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get all campaigns (admin, comercial, post-venta, analista can read)
router.get('/', getAllCampaigns);

// Get campaign by ID (admin, comercial own, post-venta, analista can read)
router.get('/:id', validateCampaignId, getCampaignById);

// Create campaign (admin and comercial can create)
router.post(
  '/',
  roleMiddleware('admin', 'comercial'),
  validateCampaign,
  createCampaign
);

// Update campaign (admin and comercial own can update)
router.put(
  '/:id',
  roleMiddleware('admin', 'comercial'),
  validateCampaignId,
  validateCampaign,
  updateCampaign
);

// Delete campaign (admin and comercial own can delete)
router.delete(
  '/:id',
  roleMiddleware('admin', 'comercial'),
  validateCampaignId,
  deleteCampaign
);

// Assign actions to campaign (admin and comercial own can assign)
router.post(
  '/:id/actions',
  roleMiddleware('admin', 'comercial'),
  validateCampaignId,
  validateAssignActions,
  assignActions
);

// Update campaign action status (admin only)
router.patch(
  '/actions/:id',
  roleMiddleware('admin'),
  validateActionStatus,
  updateActionStatus
);

// Move action to another magazine edition (admin and comercial can move)
router.put(
  '/actions/:id/move',
  roleMiddleware('admin', 'comercial'),
  moveActionToEdition
);

export default router;

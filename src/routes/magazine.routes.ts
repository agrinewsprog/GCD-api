import { Router } from 'express';
import {
  getAllMagazineEditions,
  getMagazineEditionById,
  getEditionsByMedium,
  createMagazineEdition,
  updateMagazineEdition,
  deleteMagazineEdition,
  getEditionWithCampaigns,
  completeMagazineEdition
} from '../controllers/magazine.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get all magazine editions (admin, post-venta, analista can view)
router.get('/', getAllMagazineEditions);

// Get editions by medium (admin, post-venta, analista can view)
router.get('/medium/:mediumId', getEditionsByMedium);

// Get edition with campaigns (admin, post-venta, analista can view)
router.get('/:id/campaigns', getEditionWithCampaigns);

// Get single edition (admin, post-venta, analista can view)
router.get('/:id', getMagazineEditionById);

// Create new edition (only admin)
router.post('/', roleMiddleware('admin'), createMagazineEdition);

// Update edition (only admin)
router.put('/:id', roleMiddleware('admin'), updateMagazineEdition);

// Complete edition (admin and post-venta can complete)
router.put('/:id/complete', roleMiddleware('admin', 'post-venta'), completeMagazineEdition);

// Delete edition (only admin)
router.delete('/:id', roleMiddleware('admin'), deleteMagazineEdition);

export default router;
